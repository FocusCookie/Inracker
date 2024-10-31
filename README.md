# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

# Internationalization and localization

This project uses react-i18next for handlin the internationalization and localization. If you want to add translations add them to `src/translations/[lng]/[namespace].json`. Also you need to update:

- The `resources` in the`/src/i18next.ts` file.
- Add the namespace and translation to the `/src/@types/i18next.d.ts` file.
