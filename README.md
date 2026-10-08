# Synthetic support-incident explorer

A local, read-only explorer for 2,400 fictional support incidents, with a dependency-free Node HTTP backend and a responsive browser interface.

The qualification environment uses Node.js 24. Run `npm run seed` from this directory to create `.runtime/incidents.json`. The generator requires no packages or network access. Every invocation produces the same bytes. See `data/FIELDS.md` for the record meanings.

Keep `data/generate.mjs` and `data/FIELDS.md` unchanged. The application must treat the generated dataset as read-only. Add application code, useful verification, and startup instructions as needed. The installed browser-verification tooling and its exact command will be documented in the shared execution environment before either route begins; this starter does not claim that a browser is already installed.

## Exact shared commands

Generate the supplied canonical data:

npm run seed

Run complete verification, including meaningful application HTTP and browser checks you add:

npm test

The baseline uses Node's built-in `node:test` runner (generic `node --test` discovery). Its immutable data prerequisite runs before the test suite and installs the exact pinned development tooling with package lifecycle scripts disabled when needed. Keep the seed, pretest and test script bodies unchanged; add application verification in locations the generic Node test runner discovers. The initial passing data/tooling prerequisite is a tooling/data prerequisite, not application acceptance. Preserve `scripts/prepare.mjs` and the two `data/*` sources. Add the app, its startup instructions and meaningful real HTTP/browser verification without replacing these checks. Choose application architecture, API, UI and work breakdown freely.

Declare and implement a local startup script for this exact command, then document the actual URL/port and shutdown procedure:

npm run start

## Installed browser environment

All arms use the same pinned Playwright 1.64.0 and sandbox-enabled headless Chromium 156.0.8078.4. The provided package lock pins the Node browser tooling. Before importing Playwright for browser tests, set `PLAYWRIGHT_BROWSERS_PATH` to the provided browser directory. Use `{channel:'chromium', headless:true, chromiumSandbox:true}`; never add `--no-sandbox` or relax controls to pass a test.

The qualification host exposes the real `qualification-chromium` executable through a dedicated read-only tool prefix on PATH. Locate its alias using `command -v qualification-chromium`; the alias directory contains no application or account data. The browser directory is `../browsers` and the local library directory is `../host-libs/usr/lib/x86_64-linux-gnu` relative to that alias directory. Resolve those local tooling paths dynamically; do not hardcode a contributor workspace path in application code. Pass that library directory as `LD_LIBRARY_PATH` in Chromium's explicit child environment, with `ALSA_CONFIG_PATH` pointing to `../host-libs/usr/share/alsa/alsa.conf`. Do not assume arbitrary inherited environment variables survive worker isolation. Browser profiles and temporary files belong under the current checkout's ignored `.runtime/`; an explicit relative `TMPDIR='.runtime/browser-tmp'` (also TMP/TEMP) avoids Chromium's Linux socket-path length limit while keeping files in that workspace. Create that directory before launch, preserve the current checkout as cwd, and close the browser and any owned HTTP server in finally blocks. The controller's later shared screenshot assessment uses its independently proved short alias, retained separately.

Run actual local HTTP requests and real browser interactions against your implemented backend. Include data/sort/filter/pagination/whole-result-summary/details/export correctness and the human Objective's saved-view, keyboard, responsive, loading, empty, genuine failure and retry journeys. Do not mock or replace responses, generate screenshots of an imagined app, or treat this browser prerequisite as proof of application acceptance. Tests and app-local screenshots may use ignored `.runtime/`; commit source/verification/startup instructions, not runtime profiles or node_modules. Report an exact environment limitation if a required operation remains unavailable.

The same dedicated tool prefix also provides this actual browser/HTTP prerequisite command, after the data/tooling prerequisite has installed Playwright:

qualification-browser-smoke

It starts and closes a tiny real loopback HTTP page and sandbox-enabled Chromium, records actual process identities/launch argv and closure under ignored `.runtime/`, and reports the receipt path. It verifies the installed browser environment; it never supplies the application's behavior, design, API or passing acceptance.

## Run the explorer

With Node 24, run `npm run seed` once, then `npm run start`.
Open **http://127.0.0.1:3000**. The server binds only to IPv4 loopback.
Stop it with Ctrl+C in its terminal. The application has no runtime dependencies.
If port 3000 is occupied, stop the other local process before starting.

Search is literal and case-insensitive across ID, title and description. Checked values
within each category are combined with OR; categories, search and inclusive UTC dates
are combined with AND. Opened date defaults to newest first, with 25 rows. Severity
uses critical, high, medium, low; ties use ascending incident ID. Query and sort changes
reset to page one. Counts and daily chart always describe all matches. Expand the chart
for dated bars and readable counts. Details preserve the results when you return.

Saved views are stored in this browser's localStorage for this origin. They remember
search, filters, sorting and page size, and can be reopened or deleted. CSV exports every
matching record in the selected order; tags are a JSON array inside a correctly quoted
CSV field. Null resolved dates export as an empty field. Incident content is plain text.

Run `npm test` for canonical-data preparation and discovered HTTP and sandboxed Chromium
application tests. Then run `qualification-browser-smoke` for the independent installed
browser prerequisite. Tests use ephemeral loopback ports, close their servers and browsers,
and preserve the generated dataset bytes. Screenshots, downloads and browser receipts
are written under ignored `.runtime/`. The real failure journey stops the HTTP server,
checks preserved selections, restarts the same port and retries; responses are never mocked.
