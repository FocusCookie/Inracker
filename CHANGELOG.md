# Changelog

All notable changes to this project will be documented in this file.

## [unreleased]

### Bug Fixes

- 🐛 fix: resolve TypeScript build errors and missing i18n namespace ([c52e10f](https://github.com/FocusCookie/Inracker/commit/c52e10fa1458e7fedff7d8ba97fcf63150443dc9))

## [0.2.0] - 2026-04-02

### Bug Fixes

- 🐛 fix: Refactor createCombat to avoid transaction errors

- Remove manual transaction management in createCombat to prevent 'no transaction is active' errors caused by connection pooling.
- Implement sequential execution with batched insert for participants.
- Calculate active participant in-memory instead of querying the DB. ([99467e9](https://github.com/FocusCookie/Inracker/commit/99467e90e9a83dd00d1715a0c7e8f9d75e11b7fe))
- 🐛 fix: Destructure isCombatActive in EncounterSelection ([8cdef74](https://github.com/FocusCookie/Inracker/commit/8cdef744627e804e1a18a7cd43507392bc77bf73))
- 🐛 fix: Filter initiative menu entities

- Filter opponents in Play page to only show those belonging to the active encounter.
- Filter addable entities in InitiativeMenue to exclude those already selected in the initiative list. ([0d93eb9](https://github.com/FocusCookie/Inracker/commit/0d93eb9f141e055a5594eb8b64d1d57149594769))
- 🐛 fix: Remove manual transaction from nextTurn and correct typo

- Remove beginTransaction/commit/rollback from nextTurn to avoid 'no transaction is active' errors.
- Fix 'nextRound' typo to 'nextTurn' in CombatControls tooltip and translations. ([597ad55](https://github.com/FocusCookie/Inracker/commit/597ad55656b3434554028218b159cbff85b3475a))
- 🐛 debug: Add logging for isCreateEncounterDrawerOpen

- Add useEffect to log changes to isCreateEncounterDrawerOpen state.
- Add console.log to handeOpenCreateElementDrawer to trace calls. ([1063e38](https://github.com/FocusCookie/Inracker/commit/1063e382087efe2f639e546ee6064c269f4ef4bb))
- 🐛 fix: Prevent next turn button from toggling aside menu

- Refactor handleKeyDown in Play.tsx to avoid dependency issues with listener binding.
- Stop propagation of click events in CombatControls buttons.
- Remove border radius from aside panel in PlayLayout as requested.
- Remove debug logging. ([24cbe81](https://github.com/FocusCookie/Inracker/commit/24cbe811886b2e6a7a5cb5cd00a617272e8879b6))
- 🐛 fix: resolve types in Canvas.stories.tsx ([03a0edb](https://github.com/FocusCookie/Inracker/commit/03a0edbeaa2fae55253cee1782ca615be4bede06))
- 🐛 fix: resolve all reported TypeScript errors in storybooks and components ([461e676](https://github.com/FocusCookie/Inracker/commit/461e676a08fd16e67fdccb6a0b221f4ff1c5935b))
- 🐛 fix: resolve TypeScript errors and missing translation namespaces ([f005c80](https://github.com/FocusCookie/Inracker/commit/f005c808394c614e3ba56795db8be9af2787875b))
- 🐛 fix: checkout main branch before pushing changelog in release workflow ([ac470a3](https://github.com/FocusCookie/Inracker/commit/ac470a32cb69b81175884e75520fdab692c22e29))

### Chore

- ⚙️ chore: integrate git-cliff for automated changelog generation ([b720df9](https://github.com/FocusCookie/Inracker/commit/b720df97b269989a74b5ef6cc664f2a22641fd26))

### Features

- Canvas zoom and draw ([74725b9](https://github.com/FocusCookie/Inracker/commit/74725b9029e9bce7ad6f172f26fc8f214798b389))
- Canvas ([336e4a5](https://github.com/FocusCookie/Inracker/commit/336e4a53db89098bddfa6279643599d4c0e759f8))
- ✨ feat: Add glowing pulse animation for active combat elements

- Add encounter_id to combats table via migration
- Update createCombat to link fights to encounters
- Add isActiveCombat prop to CanvasElement and Play page logic
- Implement pulsing motion.rect in CanvasElementNode ([623a4ae](https://github.com/FocusCookie/Inracker/commit/623a4aeeaad37637c0a72319afc0e003de64ce1b))
- ✨ feat: Disable 'Start Fight' button when combat is active

- Add isCombatActive prop to EncounterSelection to disable the 'Start Fight' button when combat is ongoing.
- Update Play page to pass combat status to EncounterSelection.
- Add corresponding translations for 'startFight' and 'fightOngoing'. ([6d01568](https://github.com/FocusCookie/Inracker/commit/6d0156856606fd87bded0527e53847da415ce783))
- ✨ feat: Integrate Initiative and InitiativeMenue components

- Refactor InitiativeMenue to be centered vertically on the left.
- Refactor Initiative strip to be centered horizontally at the top.
- Add addParticipant mutation to database and hooks.
- Create InitiativeMenuEntity type.
- Integrate both components into Play page with full interactivity (add/remove participants, update initiative). ([6c0047f](https://github.com/FocusCookie/Inracker/commit/6c0047fd6992bd1d5d77dc08d1ce87fae89b15d1))
- ✨ feat: Implement initiative reset functionality

- Add resetInitiative function to database to set all initiatives to 0.
- Expose resetInitiative in useCombatActions hook.
- Implement handleInitiativeReset in Play page and wire it to InitiativeMenue. ([d885840](https://github.com/FocusCookie/Inracker/commit/d885840c4f59e22e171539bd19f4d7b318c9f6eb))
- ✨ feat: add health update dialog to player card menu ([ca3cab5](https://github.com/FocusCookie/Inracker/commit/ca3cab5b8ec9f0550a53a4bc94522fa53b07572a))
- ✨ feat: implement drawing tools, selection UI, and persistence for canvas markup ([f9c6907](https://github.com/FocusCookie/Inracker/commit/f9c69073730c7c19b20cb68c9ebd71564bb336bc))

### Performance

- 🚀 chore: bump version to 0.2.0 ([a9ba11e](https://github.com/FocusCookie/Inracker/commit/a9ba11ebf2d183777198ecfd623f9be75c93f2d0))

### Translations

- 🌍 fix: update German translations to use informal address (du) ([3aa279b](https://github.com/FocusCookie/Inracker/commit/3aa279b4d93e36b3c1dd471bc6e71909d7a76186))

### Refactor

- Canvas: useEffect order ([8ec7746](https://github.com/FocusCookie/Inracker/commit/8ec774692b539acf1e939dbfc24d2cc637a1e80b))

<!-- generated by git-cliff -->
