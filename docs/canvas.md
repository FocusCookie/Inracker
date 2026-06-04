# tldraw canvas

Custom shape utils (Encounter, Token, Background, Markup) + a sync hook
(`useTldrawSync`) keeping tldraw shapes in sync with app/DB state.

## Shape deletion must bypass the undo stack

When deleting shapes from the sync hook, **use
`editor.store.mergeRemoteChanges()` with `editor.store.remove()`**, never
`editor.deleteShapes()`:

```ts
// WRONG — tldraw's undo history can resurrect the shape
editor.deleteShapes(idsToRemove);

// CORRECT — bypasses undo stack entirely
editor.store.mergeRemoteChanges(() => {
  editor.store.remove(idsToRemove);
});
```

**Why:** `deleteShapes()` records the deletion in undo history. The draw tool's
state machine marks history during creation and bails back to a mark on cleanup,
**reverting** deletions recorded after that mark — deleted shapes silently
reappear ~500ms later. Applies to any app-state-managed shape (encounters,
tokens, markup, temp elements); creating/updating via `createShapes()` /
`updateShapes()` is fine.

## `BaseBoxShapeTool` lifecycle

Only `onCreate(shape)` exists (fires on mouse release). There is **no
`onComplete`** — code in such an override never runs.

## Key files

`src/components/Canvas/Canvas.tsx`, `tldraw/useTldrawSync.ts`,
`tldraw/EncounterTool.ts`, `tldraw/EncounterShapeUtil.tsx`,
`tldraw/TokenShapeUtil.tsx`, `tldraw/BackgroundShapeUtil.tsx`,
`tldraw/MarkupShapeUtil.tsx` / `MarkupTool.ts`. Interaction logic lives in the
`Canvas/use*.ts` hooks.
