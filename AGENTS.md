# Agent Guide — Inracker

Tauri v2 + React 19 + TypeScript desktop app for TTRPG session management. Stack: SQLite (`tauri-plugin-sql`), TanStack Router (file-based) + Query v5, Zustand, Radix/Shadcn + CVA + Tailwind 4, react-hook-form + zod, tldraw v4, i18next. Read the linked topic guide before working in that area.

## Topics

- **Components** — one folder per component; scaffold with Hygen first, add a translation namespace if it has copy. → [docs/components.md](docs/components.md)
- **Data layer** — all DB access goes through `src/lib/db/` domain modules; never raw SQL in components. → [docs/data-layer.md](docs/data-layer.md)
- **Hooks** — one entity-hook file per domain, DI + mandatory toast wrappers. → [docs/hooks.md](docs/hooks.md)
- **Overlays** — stack-based drawer/dialog system via a typed registry. → [docs/overlays.md](docs/overlays.md)
- **i18n & scaffolding** — per-namespace JSON registered in i18next; scaffold with Hygen. → [docs/i18n.md](docs/i18n.md)
- **Canvas (tldraw)** — custom shapes synced to DB; deletions must bypass the undo stack. → [docs/canvas.md](docs/canvas.md)
- **Database schema** — source of truth is the migrations in `src-tauri/src/lib.rs`.

## Conventions

- Absolute imports via `@/` (→ `src/`).
- Components: PascalCase, one folder each under `src/components/`, functional, destructured props.
- Hooks `useX` in `src/hooks/`; types (PascalCase) in `src/types/`; everything else camelCase.
- Prettier enforces formatting/import style — don't hand-tune.

## Environment

- `VITE_ENV=dev` → `dev.db`, `VITE_ENV=inracker` → `inracker.db` (resolved in both Vite scripts and `lib.rs`).

## Git

Do not self-commit. The user handles all git commits.
