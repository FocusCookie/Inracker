import { Player, TCreatePlayer } from "../types/player";

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
  },
];

export const db = {
  players: {
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
    deletePlayerById: async (playerId: number): Promise<Player> => {
      console.log("STORYBOOK MOCK: delete player", playerId);
      const index = players.findIndex((p) => p.id === playerId);
      const deletedPlayer = players[index];
      if (index !== -1) {
        players.splice(index, 1);
      }
      return Promise.resolve(deletedPlayer);
    },
  },
};

export default db;
