# Agent Guide - Inracker

This document provides essential information for AI agents operating in the Inracker repository.

## 1. Project Overview

Inracker is a desktop application built with **Tauri v2**, **React 19**, and **TypeScript**. It's designed as a tool for TTRPG session management.

- **Frontend**: React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS 4.
- **UI Components**: Shadcn UI (Radix UI primitives) with `class-variance-authority` (CVA).
- **State Management**: Zustand.
- **Backend**: Rust (Tauri core).
- **Internationalization**: i18next.

## 2. Commands

### Development

- `npm run dev`: Starts the Vite development server (web only).
- `npm run tauri:dev`: Starts the Tauri development environment (desktop app).
- `npm run storybook`: Starts Storybook for component development.

### Build & Lint

- `npm run build`: Type-checks with `tsc` and builds the frontend.
- `npm run tauri:build`: Builds the production-ready desktop application.
- `npx prettier --write .`: Formats the codebase using Prettier.

### Testing

_Note: Unit and integration tests are not yet implemented in this repository._

- Recommended command for future tests: `npx vitest`
- Running a single test: `npx vitest -t "test name pattern"`

## 3. Code Style & Conventions

### Imports

- Use absolute imports with the `@/` prefix (mapped to `src/`).
- **Grouping Order**:
  1. React and standard library.
  2. Third-party libraries (e.g., `@tanstack/react-query`, `lucide-react`).
  3. UI components (`@/components/ui/...`).
  4. Local components, hooks, stores, and utils.
  5. Styles/CSS.

### Naming Conventions

- **Components**: PascalCase (e.g., `PlayerCard.tsx`).
- **Hooks**: camelCase with `use` prefix (e.g., `usePlayers.ts`).
- **Stores**: camelCase (e.g., `useEncounterStore.tsx`).
- **Utilities/Variables**: camelCase.
- **Types/Interfaces**: PascalCase.

### Component Structure

- Use functional components. `function ComponentName() {}` is preferred for main components; arrow functions are acceptable for simple or internal sub-components.
- Use destructuring for props.
- Utilize the `cn` utility from `@/lib/utils` for merging Tailwind classes.
- Prefer Radix UI primitives for accessible components.

Example:

```tsx
import { cn } from "@/lib/utils";

interface MyComponentProps {
  className?: string;
  label: string;
}

export function MyComponent({ className, label }: MyComponentProps) {
  return <div className={cn("bg-background p-4", className)}>{label}</div>;
}
```

### State Management

- **TanStack Query**: Primary solution for data fetching and synchronization. Use the **Entity Hook Pattern** (exporting individual hooks like `useCreateOpponent` from dedicated hook files). Hooks should support dependency injection for the `database` instance.
- **Zustand**: Used sparingly for specific UI state: the global overlay stack (`useOverlayStore`) and specific canvas state.
- **TanStack Router**: Used for file-based routing and type-safe search params.

### Database Access Layer (`src/lib/database.ts`)

- **Single Source of Truth**: `src/lib/database.ts` is the ONLY entry point for database interactions.
- **Rules**:
  - NEVER write raw SQL in React components.
  - NEVER import `TauriDatabase` directly in components.
  - ALWAYS use helper functions from `database.ts`.
- **Atomic Operations**: If an action requires multiple database steps, create a single atomic async function in `database.ts`. Do not chain database promises in UI components.

### Overlay Management

- **OverlayHost**: Central manager mounted in `__root.tsx` that renders a stack of overlays based on `useOverlayStore`.
- **Usage**: Open overlays via `useOverlayStore.getState().open("type", props)`.
- **Live Data**: Portaled overlays must subscribe to relevant `useQuery` hooks themselves (using an `id` prop) to reflect real-time changes, as their props are static snapshots.

### Forms & Validation

- **Libraries**: `react-hook-form` with `zod` schemas via `@hookform/resolvers`.
- **Location**: Store Zod schemas in `src/schemas/`. Use Shadcn form primitives for UI.

### Internationalization

- **Files**: Resources are in `src/translations/[lng]/[namespace].json`.
- **Updates**: When adding translations, update `src/i18next.ts` and `src/@types/i18next.d.ts`.
- **Templates**: Use `hygen translation new` to scaffold new locales/namespaces.

### Scaffolding

- Use Hygen templates: `hygen component new` and `hygen translation new`.

## 4. Database Schema Summary

Key tables for context (see `src-tauri/src/lib.rs` for full migrations):

- `parties`: Campaign groups (JSON players).
- `players`: Detailed stats, effects, resistances (JSON).
- `chapters`: Campaign stages (JSON tokens/encounters).
- `encounters`: Combat scenarios (JSON opponents).
- `opponents`: Stat blocks (JSON labels/resistances/etc.).
- `tokens`: Map placement data.
- `encounter_opponents`: Specific instances of opponents in encounters.
- `active_effects`: Tracked buffs/debuffs on entities.

## 5. Development Workflow

1. **Schema**: Update migrations in `src-tauri/src/lib.rs` and types in `src/types/`.
2. **Data**: Add/update functions in `src/lib/database.ts`.
3. **Hooks**: Create/update TanStack Query hooks in `src/hooks/`.
4. **UI**: Register new overlays in `OverlayHost.tsx` and implement components.

## 6. Environment

- Use `cross-env VITE_ENV=dev` for local development (uses `dev.db`).
- Use `cross-env VITE_ENV=inracker` for production builds (uses `prod.db`).

## 7. Git Rule

Do not self-commit changes. The user will handle all git commits.
