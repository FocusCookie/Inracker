# Components

One folder per component under `src/components/<Name>/`: `<Name>.tsx` (default
export, functional, destructured props) + `<Name>.stories.tsx`. PascalCase
throughout. Scaffold first with Hygen — don't hand-create the folder.

## Creating a component

1. `hygen component new` (prompts for the name) — generates
   `src/components/<Name>/<Name>.tsx` and `<Name>.stories.tsx`. Templates:
   `_templates/component/new/`.
2. If the component needs translations, scaffold its namespace too:
   `hygen translation new` → pick type `component`, enter `<Name>`. This creates
   the de/en JSON, wires the `src/i18next.ts` imports, and adds the type entries
   (see [i18n.md](i18n.md)). Don't wire translations by hand.

## Translations in a component

The namespace is `Component<Name>` (e.g. `ComponentPartyEditDrawer`):

```ts
const { t } = useTranslation("ComponentPartyEditDrawer");
```

Storybook is a real workflow here — keep the generated `.stories.tsx` working.
