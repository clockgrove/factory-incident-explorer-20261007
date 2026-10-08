import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const ranks = ['critical', 'high', 'medium', 'low'];
export function query(records, p) {
  const q = (p.get('q') || '').toLowerCase();
  const rows = records.filter(r => (!q || [r.id,r.title,r.description].some(v => v.toLowerCase().includes(q))) && ['service','status','severity'].every(k => !p.getAll(k).length || p.getAll(k).includes(r[k])) && (!p.get('from') || r.openedAt.slice(0,10) >= p.get('from')) && (!p.get('to') || r.openedAt.slice(0,10) <= p.get('to')));
  const direction = p.get('direction') === 'asc' ? 1 : -1;
  rows.sort((a,b) => (p.get('sort') === 'severity' ? (ranks.indexOf(b.severity)-ranks.indexOf(a.severity)) : a.openedAt.localeCompare(b.openedAt)) * direction || a.id.localeCompare(b.id));
  return rows;
}
export async function createServer() {
  const records = JSON.parse(await readFile(new URL('.runtime/incidents.json', root),'utf8'));
  return http.createServer(async (req,res) => {
    try {
      const u = new URL(req.url,'http://localhost');
      if (u.pathname.startsWith('/api/')) {
        res.setHeader('Cache-Control','no-store');
        if (u.pathname.startsWith('/api/incidents/')) {
          const incident = records.find(r => r.id === decodeURIComponent(u.pathname.split('/').at(-1)));
          res.writeHead(incident ? 200 : 404, {'Content-Type':'application/json'}); res.end(JSON.stringify(incident || {error:'Incident not found'})); return;
        }
        const rows = query(records,u.searchParams);
        if (u.pathname === '/api/export') {
          const fields = Object.keys(records[0]);
          const escape = v => '"' + String(v ?? '').replaceAll('"','""') + '"';
          res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="incidents.csv"'});
          res.end([fields.join(','),...rows.map(r=>fields.map(k=>escape(k==='tags'?JSON.stringify(r[k]):r[k])).join(','))].join('\r\n')+'\r\n'); return;
        }
        if (u.pathname !== '/api/incidents') { res.writeHead(404); res.end(); return; }
        const days = {};
        for (const r of rows) { const day=r.openedAt.slice(0,10); days[day]=(days[day]||0)+1; }
        const size = u.searchParams.get('size')==='50'?50:25;
        const pages=Math.max(1,Math.ceil(rows.length/size));
        const page=Math.min(pages,Math.max(1,Number(u.searchParams.get('page'))||1));
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify({rows:rows.slice((page-1)*size,page*size),page,pages,total:rows.length,unresolved:rows.filter(r=>r.status!=='resolved').length,high:rows.filter(r=>ranks.indexOf(r.severity)<2).length,days:Object.entries(days).sort()})); return;
      }
      const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
      if (!files[u.pathname]) {res.writeHead(404);res.end();return;}
      res.writeHead(200,{'Content-Type':u.pathname.endsWith('.js')?'text/javascript':u.pathname.endsWith('.css')?'text/css':'text/html'});
      res.end(await readFile(new URL(files[u.pathname],import.meta.url)));
    } catch { res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Unable to load incidents'})); }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server=await createServer();server.listen(3000,'127.0.0.1',()=>console.log('Incident explorer: http://127.0.0.1:3000 — Ctrl+C to stop'));
  for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close());
}
