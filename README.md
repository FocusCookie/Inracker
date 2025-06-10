# About Inracker

Inracker is designed to be the ultimate companion app for Dungeon Masters (DMs) running Pen and Paper RPGs 🐉. This tool is aimed at helping you create and plan your campaigns, while also providing seamless tracking for initiative, player stats, effects, and more 📜.

Inracker is NOT meant to replace virtual tabletops like Foundry or Owlbear 🖥️🎲—instead, it's meant to help you plan out elements on the actual battlemap (both online and offline). For example, quickly identify when a player is stepping on a trap by marking it directly on the battlemap along with any relevant notes.

Planned Features 🌟

- Player Tracking 🛡️: Manage full stats of each character, such as skills, attributes, shields, health, and more—perfect for quick DM reference.

- Initiative Tracker ⚔️: Easily track initiative during combat encounters, ensuring a smooth flow for battles.

- Effects Tracking 💥: Keep tabs on buffs, debuffs, and harmful effects—whether temporary or long-term.

- Battlemap Canvas 🗺️: Create and mark key notes directly on the battlemap—plan important events like fights, traps, and other surprises!

- Token Tracker 🎭: Use tokens to represent both player characters (PCs) and enemies on the battlemap, making it easier to visually manage encounters.

- Multi-Campaign and Chapters Support 📖: Track multiple campaigns and their respective chapters, making it easier to manage vast and complex worlds.

- Cross-Campaign Character Support 🌍: Seamlessly move characters across different campaigns with ease, allowing for extended narratives and shared universes.
- Campaign Logs 📚: Quickly log important actions like player attacks, damage dealt, or other key events for later recaps and detailed session summaries.

# Docs

## Techstack

- Tauri
- Rust
- Typescript
- React
- SQLITE
- Tailwind
- Shadcn UI
- RadixUI
- Tanstack Router
- Tanstack Query
- hygen templates

## Notes

- **Remove** in `index.html` the ` <script src="http://localhost:8097"></script>` in the build process.

## Templates

With hygen you can create components and translations.

```bash
hygen component new
```

```bash
hygen translation new
```

## React Dev Tools

In order to use the react dev tools within the tauri application, you need to install the dev tools via npm
`npm install -g react-devtools`
This is because it uses webkit as the browser engine. As you can read [here](https://react.dev/learn/react-developer-tools) it can be connected via the npm package.

## Internationalization and localization

This project uses react-i18next for handlin the internationalization and localization. If you want to add translations add them to `src/translations/[lng]/[namespace].json`. Also you need to update:

- The `resources` in the`/src/i18next.ts` file.
- Add the namespace and translation to the `/src/@types/i18next.d.ts` file.

### Translation with i18n.t

If you need to translate somethinge outside of an React Component use the i18n.t function. Important is that you seperate the namespce with a douple point :

```ts
import i18next from "i18next";

i18next.t("ComponentCreatePlayerDrawer:minName"),
```

### Translation Templates

You can use the hygen templates in order to create new translations files.

```bash
hygen translation new
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

# Future Features

- In settings: see all files that are in the app directory in order to delete files that are not used
- Importing and Exporting databases

# Todos

- [ ] Effects need to have a boolean value for until long rest
- [ ] effectCard - show duration and value in the opened card or as badges
- [ ] need to store a game round and time state for the effects. time needs to be enabled somehow with a timer than rounds could be updated with a next round function
- [ ] settings dialog
  - [ ] immunites edit
  - [ ] resistances edit
  - [ ] user settings
- [ ] ui for round interaction
- [ ] innitiative
  - [ ] ui
  - [ ] gamestate
    - [ ] stored as an entity for each party
  - [ ]
