# Inracker – Assistant Working Guide

## Product Overview

Inracker is a Dungeon Master Tool for playing Dungeons and Dragons and other TTRPGs. It allows users to create and manage campaigns (parties, chapters), track combat on a battlemap with tokens for players and opponents, and manage entity stats (effects, immunities, resistances). It is designed to support both offline preparation and live session management.

## Tech Stack

- **Core:** Tauri 2 (Rust backend + Web frontend)
- **Database:** SQLite (via `@tauri-apps/plugin-sql` with Rust-side migrations)
- **Frontend Framework:** React + TypeScript
- **Routing:** TanStack Router (file-based)
- **Data Fetching:** TanStack Query (React Query)
- **State Management:** Zustand
- **Styling:** Tailwind CSS (v4), clsx, tailwind-merge
- **UI Library:** shadcn/ui (Radix primitives)
- **i18n:** react-i18next (English & German)
- **Tooling:** Vite 6, Hygen (templating), Storybook 8

## Project Layout

- `src/`
  - `components/` – UI components.
    - `Overlay/OverlayHost.tsx` – **Central manager for all overlay/drawer rendering.**
    - `ui/` – shadcn/ui primitives.
  - `lib/`
    - `database.ts` – **The ONLY entry point for database interactions.**
    - `utils.ts` – Shared helpers.
  - `routes/` – File-based routes for TanStack Router.
  - `stores/` – Zustand stores (e.g., `useOverlayStore`, `useEncounterStore`).
  - `translations/` – i18n JSON resources.
  - `types/` – TypeScript definitions for domain entities (Player, Party, etc.).
- `src-tauri/` – Rust backend, migrations, and plugins.

## Architecture & Patterns

### 1. Database Access Layer (`src/lib/database.ts`)

**Rule:** `src/lib/database.ts` is the **single source of truth** for all database interactions.

- **Implementation:** It uses `@tauri-apps/plugin-sql` to communicate with the local SQLite database.
- **Abstraction:** It provides typed `async` functions (e.g., `getAllPlayers`, `createParty`, `updateToken`) that handle SQL queries, JSON parsing/serialization, and type mapping.
- **Usage:**
  - **NEVER** write raw SQL inside React components.
  - **NEVER** import `TauriDatabase` directly in components.
  - **ALWAYS** use the exported helper functions from `database.ts`.

### 2. Frontend-Backend Communication (TanStack Query)

The frontend interacts with the "backend" (the `database.ts` layer) exclusively via **TanStack Query**. To maintain clean separation and reusability, we use the **Entity Hook Pattern**.

- **Entity Hook Pattern:**

  - Create a dedicated hook file for each domain entity (e.g., `src/hooks/useOpponents.ts`, `src/hooks/useEncounterOpponents.ts`).
  - These hooks **export individual functions** (e.g., `export function useCreateOpponent(database = defaultDb)`) wrapping `useQuery` (for reading) and `useMutation` (for writing).
  - **Dependency Injection:** Each hook function should accept an optional `database` parameter (defaulting to the global `database` instance). This allows for easier testing by injecting a mock database.
  - Use `useMutationWithErrorToast` to handle errors consistently.
  - **Responsibility:** The hook handles cache invalidation (`queryClient.invalidateQueries`) upon success. The Component simply calls `create.mutate(data)`.

- **Atomic Operations (No Chaining in UI):**

  - **Rule:** If an action requires multiple database steps (e.g., "Create Opponent" AND "Create Token"), **do not chain promises in the React component**.
  - **Solution:** Create a single, atomic async function in `src/lib/database.ts` (e.g., `createEncounterOpponentWithToken`) that performs all steps. The hook and UI should treat this as one operation.

- **Example Usage:**

  ```tsx
  // src/hooks/useEncounterOpponents.ts
  export function useCreateEncounterOpponent(database = defaultDb) {
    const queryClient = useQueryClient();
    return useMutationWithErrorToast({
      mutationFn: (data) => database.encounterOpponents.createWithToken(data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] }),
    });
  }
  
  // In Component
  import { useCreateEncounterOpponent } from "@/hooks/useEncounterOpponents";
  
  function MyComponent({ database }) {
    const createOpponent = useCreateEncounterOpponent(database);
    // ...
  }
  ```

### Component Database Injection

To enhance testability and facilitate isolated unit/integration testing with tools like Storybook, certain page-level components (e.g., `ChapterSelection`, `PartySelection`) now accept the `database` instance as a direct prop. This allows for injecting a mock or in-memory database implementation during testing, enabling comprehensive UI and logic validation without relying on a live database connection.

**Usage:**

```tsx
function MyComponent({ database }) {
  // ... component logic using the injected database instance ...
  const myHook = useMyHook(database);
  // ...
}
```

This pattern ensures that components remain independent of global database imports and can be easily tested in various scenarios.

### 3. State Management (TanStack Query & Limited Zustand)

- **Primary Application State:** For server-like data, caching, and most application-level state, **TanStack Query is the preferred solution.** Drive UI updates via TanStack Query's invalidations and refetches.
- **Limited UI State (Zustand):** Zustand stores are used sparingly for highly specific UI concerns, primarily:
  - The global overlay stack (`src/stores/useOverlayStore.tsx`).
  - A single use case within the canvas component.
- **Rule:** Do not use Zustand for general application data or state that can be managed effectively by TanStack Query.

### 4. Forms & Validation (React Hook Form & Zod)

- **Libraries:** `react-hook-form` for form management, integrated with `zod` schemas via `@hookform/resolvers` for validation.
- **Pattern:**
  - Define Zod schemas in `src/schemas/*`.
  - In components/hooks, create form instances using `useForm({ resolver: zodResolver(yourSchema) })`.
  - Reuse `shadcn/ui` form primitives (from `src/components/ui/form.tsx`) for consistent UI.

### 5. Overlay Management (`OverlayHost`)

Overlays (Drawers, Dialogs) are managed centrally to ensure clean state management and debuggability.

- **Component:** `src/components/Overlay/OverlayHost.tsx`
  - This component is mounted once in the app root (`src/routes/__root.tsx`).
  - It renders a stack of active overlays based on the global state.
  - It maintains a `registry` mapping internal strings (e.g., `"party.create"`) to React components.
- **Store:** `src/stores/useOverlayStore.tsx` (Zustand)
  - Controls the stack of open overlays.
  - **API:** `open(type, props)`, `close(id)`, `remove(id)`.
- **Usage Pattern:**
  - To open a drawer: `useOverlayStore.getState().open("opponent.create", { ...props })`.
  - Do **not** embed large Drawer components directly into page layouts if they can be handled globally.

### 5.1 Live Data in Overlays (TanStack Query)

When an overlay/drawer component (managed by `OverlayHost` and `useOverlayStore`) needs to display or react to real-time changes in data that is stored in the database, it's crucial to understand the data flow.

*   **The Challenge:** Overlays receive their initial `props` as a static snapshot when `useOverlayStore.getState().open(type, props)` is called. Since these props are stored in a Zustand store and the overlay renders in a portal, it is effectively "disconnected" from the direct React component tree that might be observing live data via TanStack Query.
*   **The Solution:** For overlays to reflect immediate database changes (e.g., after a mutation and query invalidation), the overlay component itself must **subscribe directly to the relevant TanStack Query hook**.

**Pattern:**
1.  Pass minimal identifying information (like an `id`) as a prop to the overlay. If initial display of a full object is necessary before the query loads, pass the full object as an `initialData` prop.
2.  Inside the overlay component, use a TanStack Query `useQuery` hook (e.g., `useEncounterQuery(id, initialData, database)`) to fetch the latest data based on the ID.
3.  Use the `data` returned by this query hook as the source of truth for rendering the overlay's UI. This ensures that when related mutations invalidate the query, the overlay component re-renders with the fresh data from the cache.

**Example (simplified):**

```tsx
// Inside src/components/MyOverlay/MyOverlay.tsx
import { useMyEntityQuery } from "@/hooks/useMyEntities"; // TanStack Query hook

function MyOverlay({ entityId, initialEntityData, database }) {
  // Subscribe to live data for the entity
  const { data: liveEntity } = useMyEntityQuery(entityId, initialEntityData, database);

  // Use 'liveEntity' for all rendering logic
  if (!liveEntity) return <Loader />;

  return (
    <div>
      {/* Display properties of liveEntity */}
      <p>{liveEntity.name}</p>
      <button onClick={() => updateMutation.mutate({ ...liveEntity, someProp: newValue })}>
        Update
      </button>
    </div>
  );
}

// How to open the overlay
// useOverlayStore.getState().open("my.overlay", { entityId: 123, initialEntityData: currentEntity });
```

This pattern ensures that overlays remain dynamic and display the most up-to-date information, despite their decoupled rendering environment.

## Environment & Database

- **Environment Variables:**
  - `VITE_ENV` determines the database filename (e.g., `sqlite:dev.db` vs `sqlite:prod.db`).
- **Migrations:** Defined in `src-tauri/src/lib.rs` and applied automatically on startup.
- **Images:** Stored in the OS-specific App Data folder via `@tauri-apps/plugin-fs` and referenced by file path in the DB.

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

## Development Workflow

1. **Modify Schema:**
    - Update migrations in `src-tauri/src/lib.rs`.
    - Update TypeScript types in `src/types/`.
2. **Update Data Layer:**
    - Add/Update functions in `src/lib/database.ts` to handle the new schema.
3. **Update State/UI:**
    - Create/Update TanStack Query hooks (in `src/hooks/` or co-located).
    - If a new Overlay is needed:
      - Create the component.
      - Register it in `src/components/Overlay/OverlayHost.tsx`.
      - Add types to `src/types/overlay.ts`.
4. **Scaffold:**
    - Use `hygen component new` or `hygen translation new` to speed up boilerplate.

## Common Commands

```bash
npm run dev           # Web-only dev (mocked DB or limited functionality)
npm run tauri dev     # Full Desktop app with hot reload
npm run build         # Build web assets
npm run storybook     # UI Component development
```

