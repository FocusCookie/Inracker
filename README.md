# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

# Build Process

- **Remove** in `index.html` the ` <script src="http://localhost:8097"></script>`

# React Dev Tools

In order to use the react dev tools within the tauri application, you need to install the dev tools via npm
`npm install -g react-devtools`
This is because it uses webkit as the browser engine. As you can read [here](https://react.dev/learn/react-developer-tools) it can be connected via the npm package.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

# Internationalization and localization

This project uses react-i18next for handlin the internationalization and localization. If you want to add translations add them to `src/translations/[lng]/[namespace].json`. Also you need to update:

- The `resources` in the`/src/i18next.ts` file.
- Add the namespace and translation to the `/src/@types/i18next.d.ts` file.
