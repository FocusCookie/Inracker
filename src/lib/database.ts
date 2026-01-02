import { connect, disconnect } from "./db/core";
import { effects } from "./db/effects";
import { immunitites } from "./db/immunities";
import { resistances } from "./db/resistances";
import { players } from "./db/players";
import { parties } from "./db/parties";
import { chapters } from "./db/chapters";
import { encounters } from "./db/encounters";
import { opponents, encounterOpponents } from "./db/opponents";
import { tokens } from "./db/tokens";
import { settings } from "./db/settings";
import { combat } from "./db/combat";

const Database = {
  connect,
  disconnect,
  effects,
  immunitites,
  resistances,
  players,
  parties,
  chapters,
  encounters,
  opponents,
  encounterOpponents,
  tokens,
  settings,
  combat,
};

export default Database;