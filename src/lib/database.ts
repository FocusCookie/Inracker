import { connect, disconnect } from "./db/core";
import { effects } from "./db/effects";
import { immunities } from "./db/immunities";
import { resistances } from "./db/resistances";
import { weaknesses } from "./db/weaknesses";
import { players } from "./db/players";
import { parties } from "./db/parties";
import { chapters } from "./db/chapters";
import { encounters } from "./db/encounters";
import { opponents, encounterOpponents } from "./db/opponents";
import { tokens } from "./db/tokens";
import { settings } from "./db/settings";
import { combat } from "./db/combat";
import { shortRest, longRest } from "./db/rests";
import { logs } from "./db/logs";
import { exportAllData, importAllData, mergeAllData } from "./db/backup";

const database = {
  connect,
  disconnect,
  parties,
  opponents,
  effects,
  immunities,
  resistances,
  weaknesses,
  players,
  chapters,
  encounters,
  tokens,
  encounterOpponents,
  combat,
  settings,
  logs,
  backup: {
    exportAll: exportAllData,
    importAll: importAllData,
    mergeAll: mergeAllData,
  },
  rests: {
    short: shortRest,
    long: longRest,
  },
};

export default database;
