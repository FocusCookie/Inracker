import { connect, disconnect } from "./db/core";
import { effects } from "./db/effects";
import { immunities } from "./db/immunities";
import { resistances } from "./db/resistances";
import { players } from "./db/players";
import { parties } from "./db/parties";
import { chapters } from "./db/chapters";
import { encounters } from "./db/encounters";
import { opponents, encounterOpponents } from "./db/opponents";
import { tokens } from "./db/tokens";
import { settings } from "./db/settings";
import { combat } from "./db/combat";
import { shortRest, longRest } from "./db/rests";

const database = {
  connect,
  disconnect,
  parties,
  opponents,
  effects,
  immunities,
  resistances,
  players,
  chapters,
  encounters,
  tokens,
  encounterOpponents,
  combat,
  settings,
  rests: {
    short: shortRest,
    long: longRest,
  },
};

export default database;
