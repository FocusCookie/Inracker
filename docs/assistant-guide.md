# Inracker – Assistant Working Guide

## Product Overview

Inracker is an Dungeon Master Tool for playing Dungeons and Dragons and also any other TTRPG. You can create parties and chapters where you can create and manage your campaigns. You will draw all the information about rolls, fights and notes on to your battlemap. The players and opponents will have tokens, which you can place on the map. This will help you to prepare your offline game or your online game upfront without any tool.

## Tech Stack

- Tauri 2 desktop app (Rust core + plugins)
- Rust backend (Tauri runner, migrations)
- SQLite (via `@tauri-apps/plugin-sql` with Rust-side migrations)
- React + TypeScript frontend
- TanStack: Router (file-based) and Query (+ DevTools)
- Tailwind CSS (v4) + tailwind-merge + clsx
- Storybook 8
- shadcn/ui components (Radix primitives)
- i18n: English and German (react-i18next + language detector)
- Hygen templates (components and translations)
- Zustand state management
- react-markdown (+ remark-gfm)
- zod + react-hook-form (+ @hookform/resolvers)
- Vite 6 (bundling + router plugin)

## Project Layout

- `src/`
  - `routes/` – TanStack Router file-based routes (`createFileRoute`, generated `routeTree.gen.ts`).
  - `components/` – UI and feature components (shadcn/ui, Radix, stories alongside).
  - `lib/` – helpers such as `database.ts` (SQL client), `utils.ts` (file handling, paths, images).
  - `schemas/` – zod schemas for forms and validations.
  - `stores/` – Zustand stores for UI and feature state.
  - `translations/` – i18n JSON namespaces under `en/` and `de/`.
  - `i18next.ts` – i18n bootstrap with resource wiring (Hygen insertion markers present).
  - `styles/global.css` – Tailwind base styles.
  - `main.tsx` – App bootstrap (Router, QueryClient, DevTools, app data dir init).
- `src-tauri/`
  - `src/lib.rs` – Tauri app entry + SQL migrations registration + plugins (fs, sql, shell).
  - `tauri.conf.json` – Tauri configuration.
  - `capabilities/` – Tauri 2 capability JSON (sql permissions etc.).
  - `Cargo.toml` – Rust crate config (plugins: fs, shell, sql with sqlite feature).
- `.storybook/` – Storybook configuration.
- `_templates/` – Hygen templates (components and translation automation).
- `package.json` – Scripts, dependencies, and dev tools.
- `vite.config.ts` – Vite config (alias `@` to `src/`, TanStack Router plugin, Tauri dev server settings).

## Run, Build, and Dev Tools

- Dev (web, browser): `pnpm dev` – Vite dev server for quick UI work (some Tauri APIs won’t function).
- Dev (desktop app): `pnpm tauri dev` – Run Tauri app with hot reload.
- Build (web assets): `pnpm build` – Type-check + Vite build.
- Storybook: `pnpm storybook` (dev) / `pnpm build-storybook` (static build).
- Note: `index.html` includes `<script src="http://localhost:8097"></script>` to enable React DevTools in Tauri. Ensure it’s removed before production builds.

## Environment & Database

- `VITE_ENV` controls the SQLite database name. Examples:
  - Dev scripts set `VITE_ENV=dev`.
  - Build sets `VITE_ENV=prod`.
- DB naming: Rust constructs `sqlite:${VITE_ENV}.db`; frontend connects via `@tauri-apps/plugin-sql` using `import.meta.env.VITE_ENV`.
- DB location: Resides under the OS-specific Tauri App Data directory. The app logs the directory on startup (see `appDataDir()` in `main.tsx`).
- Migrations: Defined in `src-tauri/src/lib.rs` and applied via `tauri_plugin_sql::Builder::add_migrations` on startup.

### Schema Summary (key tables)

- `parties(id, name, description, icon, players JSON)`
- `players(id, name, role, level, health, max_health, ep, image, icon, details, overview, effects JSON, resistances JSON, immunities JSON)`
- `effects(id, name, type, icon, description, value, duration, duration_type)`
- `immunities(id, name, description, icon)`
- `resistances(id, name, description, icon)`
- `chapters(id, party, name, description, icon, state, battlemap, tokens JSON, encounters JSON)`
- `encounters(id, element, name, description, images, color, type, experience, passed, dice, skill, difficulties, opponents JSON)`
- `opponents(id, name, details, level, health, max_health, image, icon, labels JSON, resistances JSON, immunities JSON, effects JSON)`
- `tokens(id, entity, coordinates JSON, chapter, type)`
- `encounter_opponents(id, name, details, level, health, max_health, image, icon, labels JSON, resistances JSON, immunities JSON, effects JSON, blueprint)`
- `active_effects(id, effect_id, entity_id, entity_type, remaining_duration, duration_type, created_at)`

## Data Access Pattern

- Use `src/lib/database.ts` as the single entry for DB operations.
  - It lazily creates and caches a `TauriDatabase` instance via `@tauri-apps/plugin-sql`.
  - Provides typed functions to `select`, `insert`, `update`, `delete` across all entities.
  - Handles JSON fields (e.g., IDs arrays) and maps DB rows to domain types.
- Always reuse the exported helpers rather than executing raw SQL from components.

## Routing

- TanStack Router (file-based) with generated `src/routeTree.gen.ts`.
- Define routes using `createFileRoute` and the `routes/` directory convention.
- DevTools: `TanStackRouterDevtools` mounted in `__root` keeps navigation/debug visibility during dev.

## State Management

- Query state: `@tanstack/react-query` for server-like/stateful data (cache, stale times, retries).
- UI/local state: `zustand` stores in `src/stores/*` for view models, drawer toggles, selection, etc.
- Helpers: `useQueryWithErrorToast` and `useMutationWithErrorToast` wrap TanStack Query with i18n’d error toasts.

## Forms & Validation

- `react-hook-form` with `zod` schemas via `@hookform/resolvers`.
- Patterns:
  - Define schemas in `src/schemas/*`.
  - In components/hooks, create form via `useForm({ resolver: zodResolver(schema) })`.
  - Reuse shadcn form primitives in `src/components/ui/form.tsx`.

## UI, Styling, and Components

- Tailwind CSS v4 with `clsx` + `tailwind-merge` helper `cn` in `lib/utils`.
- shadcn/ui components configured by `components.json`.
- Radix UI used for accessible primitives (e.g., Dialog, Tabs, Tooltip, etc.).
- Storybook co-located stories for components; run Storybook to iterate UI in isolation.

## Internationalization (i18n)

- Libraries: `i18next`, `react-i18next`, `i18next-browser-languagedetector`.
- Resource wiring in `src/i18next.ts` for `en` and `de`.
- Types: `src/types/i18next.d.ts` augments i18next with namespaces.
- Hygen assists adding new namespaces and imports:
  - `hygen translation new` – generates JSON files and inserts wiring comments.
  - Follow the on-file markers like `// hygen-en-components` to keep automated insertions working.
- For usage outside React, call `i18next.t('Namespace:key')` directly.

## File Storage (Images)

- Images (players, battlemaps, chapters, others) are stored under App Data dir using `@tauri-apps/plugin-fs`.
- `createTauriAppDataSubfolders()` ensures folders exist on startup.
- `storeImage(file, folder)` writes to `images/<folder>/` and returns a `convertFileSrc(...)` URL usable in the UI.
- `deleteImage(name, folder)` removes a file from the App Data images folder.

## Conventions & Tips

- Prefer importing from `@/` (Vite alias to `src`).
- Keep DB mutations and side effects inside hooks or `lib/database.ts`, and drive UI via TanStack Query mutations/invalidations.
- Co-locate stories and small component-specific schemas/types near components where practical.
- Keep translations in both `en` and `de`; update resources/types or use Hygen to scaffold.
- Maintain JSON-in-DB fields as IDs or small blobs, and perform mapping to full objects in `database.ts` helpers.
- Use React Query DevTools and Router DevTools during development; remove/disable any production-unsafe dev tooling before release.

## Common Commands

```bash
# Web dev
npm run dev

# Desktop app dev (Tauri)
npm run tauri dev

# Build web assets
npm run build

# Storybook
npm run storybook
npm run build-storybook

# Hygen scaffolding
hygen component new
hygen translation new
```

## Where to Extend Next

- New entity or feature:

  1. Add DB schema migration (Rust) if needed.
  2. Create DB helpers in `lib/database.ts`.
  3. Add zod schemas and RHF forms.
  4. Add stores (Zustand) if UI state is needed.
  5. Add components, translations (use Hygen), and stories.
  6. Wire queries/mutations with invalidation and optimistic updates where appropriate.

- New translations namespace:

  - Run Hygen, then verify imports and resources in `i18next.ts` and `types/i18next.d.ts` were inserted correctly.

- New route/view:
  - Create a file route under `src/routes/...`, then re-run dev to regenerate `routeTree.gen.ts` (TanStack Router plugin).

---

This guide is optimized for rapid, consistent contributions in this codebase: migrate schema in Rust, access data through `lib/database.ts`, wire UI with TanStack Query + Zustand, validate via zod/RHF, keep i18n and stories current, and ship through Tauri.
