import { Effect } from "@/types/effect";
import { DBImmunity } from "@/types/immunitiy";
import { Player, TCreatePlayer } from "@/types/player";
import { DBResistance } from "@/types/resistances";

const players: Player[] = [
  {
    id: 1,
    name: "Grommash Hellscream",
    icon: "🦁",
    level: 10,
    role: "Warrior",
    health: 100,
    max_health: 100,
    ep: 50,
    details: "A fierce warrior from the Frostwolf clan.",
    overview: "Leader of the Warsong clan.",
    effects: [],
    immunities: [],
    resistances: [],
    image: null,
    gold: 10,
    silver: 5,
    copper: 2,
    hero_points: 1,
  },
  {
    id: 2,
    name: "Jaina Proudmoore",
    icon: "🧙‍♀️",
    level: 12,
    role: "Mage",
    health: 80,
    max_health: 80,
    ep: 120,
    details: "A powerful mage, daughter of the sea.",
    overview: "Lord Admiral of Kul Tiras.",
    effects: [],
    immunities: [],
    resistances: [],
    image: null,
    gold: 10,
    silver: 5,
    copper: 2,
    hero_points: 1,
  },
];

const effects: Effect[] = [
  {
    id: 1,
    name: "Blessing of Might",
    icon: "💪",
    description: "Increases attack power.",
    duration: 2,
    durationType: "rounds",
    type: "positive",
    value: 10,
  },
  {
    id: 2,
    name: "Curse of Weakness",
    icon: "😞",
    description: "Decreases attack power.",
    duration: 2,
    durationType: "rounds",
    type: "negative",
    value: 10,
  },
];

const immunities: DBImmunity[] = [
  {
    id: 1,
    name: "Fire Immunity",
    icon: "🔥",
    description: "Immune to fire damage.",
  },
  {
    id: 2,
    name: "Poison Immunity",
    icon: "☠️",
    description: "Immune to poison damage.",
  },
];

const resistances: DBResistance[] = [
  {
    id: 1,
    name: "Fire Resistance",
    icon: "🔥",
    description: "Resistant to fire damage.",
  },
  {
    id: 2,
    name: "Frost Resistance",
    icon: "❄️",
    description: "Resistant to frost damage.",
  },
];

export const db = {
  players: {
    getAll: async (): Promise<Player[]> => {
      console.log("STORYBOOK MOCK: getAll players");
      return Promise.resolve(players);
    },
    getAllDetailed: async (): Promise<Player[]> => {
      console.log("STORYBOOK MOCK: getAllDetailed players");
      return Promise.resolve(players);
    },
    create: async (player: TCreatePlayer): Promise<Player> => {
      console.log("STORYBOOK MOCK: create player", player);
      const newPlayer: Player = {
        ...player,
        id: Math.max(...players.map((p) => p.id)) + 1,
        effects: [],
        immunities: [],
        resistances: [],
      };
      players.push(newPlayer);
      return Promise.resolve(newPlayer);
    },
    update: async (player: Player): Promise<Player> => {
      console.log("STORYBOOK MOCK: update player", player);
      const index = players.findIndex((p) => p.id === player.id);
      if (index !== -1) {
        players[index] = player;
      }
      return Promise.resolve(player);
    },
    delete: async (playerId: number): Promise<Player> => {
      console.log("STORYBOOK MOCK: delete player", playerId);
      const index = players.findIndex((p) => p.id === playerId);
      const deletedPlayer = players[index];
      if (index !== -1) {
        players.splice(index, 1);
      }
      return Promise.resolve(deletedPlayer);
    },
    deletePlayerById: async (playerId: number): Promise<Player> => {
      console.log("STORYBOOK MOCK: delete player (deletePlayerById)", playerId);
      const index = players.findIndex((p) => p.id === playerId);
      const deletedPlayer = players[index];
      if (index !== -1) {
        players.splice(index, 1);
      }
      return Promise.resolve(deletedPlayer);
    },
    getById: async (id: number): Promise<Player> => {
      console.log("STORYBOOK MOCK: getById player", id);
      const player = players.find((p) => p.id === id);
      if (!player) throw new Error(`Player ${id} not found`);
      return Promise.resolve(player);
    },
    addEffect: async (playerId: number, effectId: number) => {
      console.log("STORYBOOK MOCK: addEffect", playerId, effectId);
      return Promise.resolve({} as any);
    },
    removeEffect: async (playerId: number, effectId: number) => {
      console.log("STORYBOOK MOCK: removeEffect", playerId, effectId);
      return Promise.resolve({} as any);
    },
    addImmunity: async (playerId: number, immunityId: number) => {
      console.log("STORYBOOK MOCK: addImmunity", playerId, immunityId);
      return Promise.resolve({} as any);
    },
    removeImmunity: async (playerId: number, immunityId: number) => {
      console.log("STORYBOOK MOCK: removeImmunity", playerId, immunityId);
      return Promise.resolve({} as any);
    },
    addResistance: async (playerId: number, resistanceId: number) => {
      console.log("STORYBOOK MOCK: addResistance", playerId, resistanceId);
      return Promise.resolve({} as any);
    },
    removeResistance: async (playerId: number, resistanceId: number) => {
      console.log("STORYBOOK MOCK: removeResistance", playerId, resistanceId);
      return Promise.resolve({} as any);
    },
  },
  effects: {
    getAll: async (): Promise<Effect[]> => {
      console.log("STORYBOOK MOCK: getAll effects");
      return Promise.resolve(effects);
    },
    getById: async (id: number): Promise<Effect> => {
      console.log("STORYBOOK MOCK: getById effect", id);
      const effect = effects.find((e) => e.id === id);
      if (!effect) throw new Error(`Effect ${id} not found`);
      return Promise.resolve(effect);
    },
    create: async (effect: Omit<Effect, "id">): Promise<Effect> => {
      console.log("STORYBOOK MOCK: create effect", effect);
      const newEffect: Effect = {
        ...effect,
        id: Math.max(...effects.map((e) => e.id)) + 1,
      };
      effects.push(newEffect);
      return Promise.resolve(newEffect);
    },
    update: async (effect: Effect): Promise<Effect> => {
      console.log("STORYBOOK MOCK: update effect", effect);
      const index = effects.findIndex((e) => e.id === effect.id);
      if (index !== -1) {
        effects[index] = effect;
      }
      return Promise.resolve(effect);
    },
    delete: async (effectId: number): Promise<Effect> => {
      console.log("STORYBOOK MOCK: delete effect", effectId);
      const index = effects.findIndex((e) => e.id === effectId);
      const deletedEffect = effects[index];
      if (index !== -1) {
        effects.splice(index, 1);
      }
      return Promise.resolve(deletedEffect);
    },
  },
  immunities: {
    getAll: async (): Promise<DBImmunity[]> => {
      console.log("STORYBOOK MOCK: getAll immunities");
      return Promise.resolve(immunities);
    },
    getById: async (id: number): Promise<DBImmunity> => {
      console.log("STORYBOOK MOCK: getById immunity", id);
      const immunity = immunities.find((i) => i.id === id);
      if (!immunity) throw new Error(`Immunity ${id} not found`);
      return Promise.resolve(immunity);
    },
    create: async (immunity: Omit<DBImmunity, "id">): Promise<DBImmunity> => {
      console.log("STORYBOOK MOCK: create immunity", immunity);
      const newImmunity: DBImmunity = {
        ...immunity,
        id: Math.max(...immunities.map((i) => i.id)) + 1,
      };
      immunities.push(newImmunity);
      return Promise.resolve(newImmunity);
    },
    update: async (immunity: DBImmunity): Promise<DBImmunity> => {
      console.log("STORYBOOK MOCK: update immunity", immunity);
      const index = immunities.findIndex((i) => i.id === immunity.id);
      if (index !== -1) {
        immunities[index] = immunity;
      }
      return Promise.resolve(immunity);
    },
    delete: async (immunityId: number): Promise<DBImmunity> => {
      console.log("STORYBOOK MOCK: delete immunity", immunityId);
      const index = immunities.findIndex((i) => i.id === immunityId);
      const deletedImmunity = immunities[index];
      if (index !== -1) {
        immunities.splice(index, 1);
      }
      return Promise.resolve(deletedImmunity);
    },
  },
  resistances: {
    getAll: async (): Promise<DBResistance[]> => {
      console.log("STORYBOOK MOCK: getAll resistances");
      return Promise.resolve(resistances);
    },
    getById: async (id: number): Promise<DBResistance> => {
      console.log("STORYBOOK MOCK: getById resistance", id);
      const resistance = resistances.find((r) => r.id === id);
      if (!resistance) throw new Error(`Resistance ${id} not found`);
      return Promise.resolve(resistance);
    },
    create: async (
      resistance: Omit<DBResistance, "id">,
    ): Promise<DBResistance> => {
      console.log("STORYBOOK MOCK: create resistance", resistance);
      const newResistance: DBResistance = {
        ...resistance,
        id: Math.max(...resistances.map((r) => r.id)) + 1,
      };
      resistances.push(newResistance);
      return Promise.resolve(newResistance);
    },
    update: async (resistance: DBResistance): Promise<DBResistance> => {
      console.log("STORYBOOK MOCK: update resistance", resistance);
      const index = resistances.findIndex((r) => r.id === resistance.id);
      if (index !== -1) {
        resistances[index] = resistance;
      }
      return Promise.resolve(resistance);
    },
    delete: async (resistanceId: number): Promise<DBResistance> => {
      console.log("STORYBOOK MOCK: delete resistance", resistanceId);
      const index = resistances.findIndex((r) => r.id === resistanceId);
      const deletedResistance = resistances[index];
      if (index !== -1) {
        resistances.splice(index, 1);
      }
      return Promise.resolve(deletedResistance);
    },
  },
  tokens: {
    createOpponentsTokensByEncounter: async () => {
      console.log("STORYBOOK MOCK: createOpponentsTokensByEncounter");
      return Promise.resolve([]);
    },
    update: async (token: any) => {
      console.log("STORYBOOK MOCK: update token", token);
      return Promise.resolve(token);
    },
    getById: async (id: number) => {
      console.log("STORYBOOK MOCK: getById token", id);
      return Promise.resolve({ id, coordinates: { x: 0, y: 0 } } as any);
    },
    getByChapter: async (chapterId: number) => {
      console.log("STORYBOOK MOCK: getByChapter tokens", chapterId);
      return Promise.resolve([]);
    },
    create: async (token: any) => {
      console.log("STORYBOOK MOCK: create token", token);
      return Promise.resolve({ ...token, id: Math.random() });
    },
    delete: async (id: number) => {
      console.log("STORYBOOK MOCK: delete token", id);
      return Promise.resolve({ id } as any);
    },
    groupIntoElement: async (tokens: number[], element: any) => {
      console.log("STORYBOOK MOCK: groupIntoElement", tokens, element);
      return Promise.resolve([]);
    },
  },
  encounters: {
    create: async (encounter: any) => {
      console.log("STORYBOOK MOCK: create encounter", encounter);
      return Promise.resolve({ ...encounter, id: Math.random() });
    },
    update: async (encounter: any) => {
      console.log("STORYBOOK MOCK: update encounter", encounter);
      return Promise.resolve(encounter);
    },
    delete: async (id: number) => {
      console.log("STORYBOOK MOCK: delete encounter", id);
      return Promise.resolve({ id } as any);
    },
    getById: async (id: number) => {
      console.log("STORYBOOK MOCK: getById encounter", id);
      return Promise.resolve({
        id,
        name: "Mock Encounter",
        description: "Mock Description",
        type: "fight",
        element: { x: 0, y: 0, width: 100, height: 100, color: "#ff0000", icon: "⚔️" },
        opponents: [],
        images: [],
        difficulties: [],
        experience: 100,
        completed: false,
        passed: false,
        soundcloud: null,
        musicFile: null,
      } as any);
    },
    updateProperty: async (id: number, property: string, value: any) => {
      console.log("STORYBOOK MOCK: updateProperty encounter", id, property, value);
      return Promise.resolve({ id } as any);
    },
    getByChapterId: async (chapterId: number) => {
      console.log("STORYBOOK MOCK: getByChapterId", chapterId);
      return Promise.resolve([]);
    },
    getAll: async () => {
      console.log("STORYBOOK MOCK: getAll encounters");
      return Promise.resolve([]);
    },
  },
  chapters: {
    addEncounter: async () => {
      console.log("STORYBOOK MOCK: addEncounter");
      return Promise.resolve({} as any);
    },
    updateProperty: async () => {
      console.log("STORYBOOK MOCK: updateProperty");
      return Promise.resolve({} as any);
    },
    delete: async (id: number) => {
      console.log("STORYBOOK MOCK: delete chapter", id);
      return Promise.resolve({ id } as any);
    },
    create: async (chapter: any) => {
      console.log("STORYBOOK MOCK: create chapter", chapter);
      return Promise.resolve({ ...chapter, id: Math.random(), encounters: "[]" });
    },
    getAllForParty: async (partyId: number) => {
      console.log("STORYBOOK MOCK: getAllForParty", partyId);
      return Promise.resolve([]);
    },
    getAll: async () => {
      console.log("STORYBOOK MOCK: getAll chapters");
      return Promise.resolve([]);
    },
    get: async (id: number) => {
      console.log("STORYBOOK MOCK: get chapter", id);
      return Promise.resolve({ id, name: "Mock Chapter", encounters: "[]" } as any);
    },
    removeEncounter: async (chapterId: number, encounterId: number) => {
      console.log("STORYBOOK MOCK: removeEncounter", chapterId, encounterId);
      return Promise.resolve({} as any);
    },
    update: async (chapter: any) => {
      console.log("STORYBOOK MOCK: update chapter", chapter);
      return Promise.resolve(chapter);
    },
  },
  encounterOpponents: {
    getAllDetailed: async () => {
      console.log("STORYBOOK MOCK: getAllDetailed encounterOpponents");
      return Promise.resolve([]);
    },
    update: async (opponent: any) => {
      console.log("STORYBOOK MOCK: update encounterOpponent", opponent);
      return Promise.resolve(opponent);
    },
    delete: async (id: number) => {
      console.log("STORYBOOK MOCK: delete encounterOpponent", id);
      return Promise.resolve({ id } as any);
    },
    create: async (opponent: any) => {
      console.log("STORYBOOK MOCK: create encounterOpponent", opponent);
      return Promise.resolve({ ...opponent, id: Math.random() });
    },
    createWithToken: async (opponent: any, chapterId: number) => {
      console.log("STORYBOOK MOCK: createWithToken encounterOpponent", opponent, chapterId);
      return Promise.resolve({ ...opponent, id: Math.random() });
    },
    createMultiple: async (opponents: any[]) => {
      console.log("STORYBOOK MOCK: createMultiple encounterOpponents", opponents);
      return Promise.resolve(opponents.map(o => ({ ...o, id: Math.random() })));
    },
    addEffect: async (opponentId: number, effectId: number) => {
      console.log("STORYBOOK MOCK: addEffect to encounterOpponent", opponentId, effectId);
      return Promise.resolve({} as any);
    },
    removeEffect: async (opponentId: number, effectId: number) => {
      console.log("STORYBOOK MOCK: removeEffect from encounterOpponent", opponentId, effectId);
      return Promise.resolve({} as any);
    },
  },
  parties: {
    getAll: async () => {
      console.log("STORYBOOK MOCK: getAll parties");
      return Promise.resolve([]);
    },
    getAllDetailed: async () => {
      console.log("STORYBOOK MOCK: getAllDetailed parties");
      return Promise.resolve([]);
    },
    getById: async (id: number) => {
      console.log("STORYBOOK MOCK: getById party", id);
      return Promise.resolve({ id, name: "Mock Party", description: "", icon: "⚔️", players: [] } as any);
    },
    create: async (party: any) => {
      console.log("STORYBOOK MOCK: create party", party);
      return Promise.resolve({ ...party, id: Math.random() });
    },
    update: async (party: any) => {
      console.log("STORYBOOK MOCK: update party", party);
      return Promise.resolve(party);
    },
    delete: async (id: number) => {
      console.log("STORYBOOK MOCK: delete party", id);
      return Promise.resolve(id);
    },
    addPlayer: async (partyId: number, playerId: number) => {
      console.log("STORYBOOK MOCK: addPlayer", partyId, playerId);
      return Promise.resolve({} as any);
    },
    removePlayer: async (partyId: number, playerId: number) => {
      console.log("STORYBOOK MOCK: removePlayer", partyId, playerId);
      return Promise.resolve({} as any);
    },
  },
  connect: async () => {
    console.log("STORYBOOK MOCK: connect");
    return Promise.resolve({} as any);
  },
  disconnect: async () => {
    console.log("STORYBOOK MOCK: disconnect");
    return Promise.resolve();
  },
  opponents: {
    getAll: async () => {
      console.log("STORYBOOK MOCK: getAll opponents");
      return Promise.resolve([]);
    },
    getAllDetailed: async () => {
      console.log("STORYBOOK MOCK: getAllDetailed opponents");
      return Promise.resolve([]);
    },
    create: async (opponent: any) => {
      console.log("STORYBOOK MOCK: create opponent", opponent);
      return Promise.resolve({ ...opponent, id: Math.random() });
    },
    update: async (opponent: any) => {
      console.log("STORYBOOK MOCK: update opponent", opponent);
      return Promise.resolve(opponent);
    },
    delete: async (id: number) => {
      console.log("STORYBOOK MOCK: delete opponent", id);
      return Promise.resolve({ id } as any);
    },
  },
  settings: {
    get: async (key: string) => {
      console.log("STORYBOOK MOCK: get setting", key);
      return Promise.resolve(null);
    },
    update: async (key: string, value: string) => {
      console.log("STORYBOOK MOCK: update setting", key, value);
      return Promise.resolve();
    },
  },
  combat: {
    get: async () => {
      console.log("STORYBOOK MOCK: get combat");
      return Promise.resolve(null);
    },
    create: async () => {
      console.log("STORYBOOK MOCK: create combat");
      return Promise.resolve({} as any);
    },
    nextTurn: async () => {
      console.log("STORYBOOK MOCK: nextTurn");
      return Promise.resolve({} as any);
    },
    finish: async () => {
      console.log("STORYBOOK MOCK: finish combat");
      return Promise.resolve();
    },
    addEffect: async () => {
      console.log("STORYBOOK MOCK: addEffect to combat");
      return Promise.resolve({} as any);
    },
    removeEffect: async () => {
      console.log("STORYBOOK MOCK: removeEffect from combat");
      return Promise.resolve({} as any);
    },
    updateInitiative: async () => {
      console.log("STORYBOOK MOCK: updateInitiative");
      return Promise.resolve({} as any);
    },
    resetInitiative: async () => {
      console.log("STORYBOOK MOCK: resetInitiative");
      return Promise.resolve({} as any);
    },
    removeParticipant: async () => {
      console.log("STORYBOOK MOCK: removeParticipant");
      return Promise.resolve({} as any);
    },
    addParticipant: async () => {
      console.log("STORYBOOK MOCK: addParticipant");
      return Promise.resolve({} as any);
    },
    getActiveParticipantId: async () => {
      console.log("STORYBOOK MOCK: getActiveParticipantId");
      return Promise.resolve(null);
    },
    getState: async () => {
      console.log("STORYBOOK MOCK: getState");
      return Promise.resolve(null);
    },
  },
  logs: {
    getAll: async () => {
      console.log("STORYBOOK MOCK: getAll logs");
      return Promise.resolve([]);
    },
    getByChapterId: async (chapterId: number) => {
      console.log("STORYBOOK MOCK: getByChapterId logs", chapterId);
      return Promise.resolve([]);
    },
    create: async (log: any) => {
      console.log("STORYBOOK MOCK: create log", log);
      return Promise.resolve({ ...log, id: Math.random() });
    },
    delete: async (id: string) => {
      console.log("STORYBOOK MOCK: delete log", id);
      return Promise.resolve({ id } as any);
    },
    update: async (log: any) => {
      console.log("STORYBOOK MOCK: update log", log);
      return Promise.resolve(log);
    },
  },
  backup: {
    exportAll: async () => {
      console.log("STORYBOOK MOCK: exportAll");
      return Promise.resolve({} as any);
    },
    importAll: async () => {
      console.log("STORYBOOK MOCK: importAll");
      return Promise.resolve();
    },
    mergeAll: async () => {
      console.log("STORYBOOK MOCK: mergeAll");
      return Promise.resolve({});
    },
  },
  rests: {
    short: async () => {
      console.log("STORYBOOK MOCK: shortRest");
      return Promise.resolve();
    },
    long: async () => {
      console.log("STORYBOOK MOCK: longRest");
      return Promise.resolve();
    },
  },
};

export default db;
