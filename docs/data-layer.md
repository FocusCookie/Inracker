# Data layer

All database access lives in **`src/lib/db/`** — one module per domain.

- **`src/lib/database.ts`** is an aggregator: it re-exports the per-domain
  modules as one `database` object (`database.players`, `database.combat`,
  `database.backup`, …). Import the default from `@/lib/database`.
- Real code lives in **`src/lib/db/<domain>.ts`** (one file per domain).
  **`src/lib/db/core.ts`** owns the connection, `withRetry` (retries SQLite
  "database is locked"), and `execute / select / begin·commit·rollback`.

## Rules

- Never write raw SQL or import `@tauri-apps/plugin-sql` outside `src/lib/db/`.
- Add new operations to the relevant domain module and surface them through
  `database.ts`.
- Multi-step actions = one atomic function in the domain module, not chained
  promises in the UI.

## Adding a feature (data → UI)

1. Migration in `src-tauri/src/lib.rs` + types in `src/types/`.
2. Domain function in `src/lib/db/<domain>.ts` (+ aggregator wiring).
3. Hook in `src/hooks/` (see [hooks.md](hooks.md)).
4. UI; register overlays in `OverlayHost.tsx` (see [overlays.md](overlays.md)).
