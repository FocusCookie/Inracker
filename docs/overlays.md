# Overlays

Drawers, catalogs and dialogs are rendered through a single stack-based overlay
system.

- Open via `useOverlayStore.getState().open("type", props)`. The store
  (`src/stores/useOverlayStore.tsx`) is a stack with a 3-phase lifecycle: `open`
  → `close` (plays framer exit) → `remove` (on `onExitComplete`).
- Register new overlays in the typed registry in
  **`src/components/Overlay/OverlayHost.tsx`** (mounted in `__root.tsx`); types
  in `src/types/overlay.d.ts`.
- Portaled overlays take an `id` prop and subscribe to their own `useQuery` for
  live data — props are static snapshots.
