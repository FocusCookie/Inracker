# Hooks

One file per domain in `src/hooks/`, exporting many small entity hooks.
**`usePlayers.ts` is the reference.**

- Every hook takes `(database = defaultDb)` for injection/mocking
  (`src/mocks/db.ts`).
- **Mutations wrap `useMutationWithErrorToast`; queries wrap
  `useQueryWithToast`** (`useQueryWithErrorToast.ts`) — these centralize error
  toasts. Do not call TanStack Query's `useQuery` / `useMutation` directly.
- Invalidate related query keys in `onSuccess`.
