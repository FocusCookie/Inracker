import type { Meta, StoryObj } from "@storybook/react";

import InitiativeCard, {
  EncounterOpponentEntity,
  PlayerEntity,
} from "./InitiativeCard";
import { fn } from "@storybook/test";

const meta = {
  title: "Components/InitiativeCard",
  component: InitiativeCard,
  args: { onClick: fn() },
} satisfies Meta<typeof InitiativeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const fakePlayer: PlayerEntity = {
  id: 1,
  name: "Hero",
  role: "Warrior",
  level: 5,
  health: 142,
  max_health: 561,
  ep: 100,
  image:
    "https://plus.unsplash.com/premium_photo-1765709019390-172aae6717dc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyNXx8fGVufDB8fHx8fA%3D%3D",
  icon: "🥳",
  details: "A brave warrior.",
  overview: "A strong and courageous fighter.",
  effects: [],
  resistances: [],
  immunities: [],
  gold: 0,
  silver: 0,
  copper: 0,
  hero_points: 0,

  position: 1,
  type: "player",
};

const fakeOpponent: EncounterOpponentEntity = {
  id: 2,
  blueprint: "goblin-king",
  name: "Goblin King",
  details: "Rules over a small goblin tribe.",
  level: 7,
  health: 60,
  max_health: 60,
  image:
    "https://plus.unsplash.com/premium_photo-1686844462591-393ceae12be0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMXx8fGVufDB8fHx8fA%3D%3D",
  icon: "🛠️",
  labels: [],
  resistances: [],
  immunities: [],
  effects: [],

  position: 6,
  type: "encounterOpponent",
};

export const PlayerActive: Story = {
  args: {
    entity: fakePlayer,
    isActive: true,
  },
};

export const OpponentInactive: Story = {
  args: {
    entity: fakeOpponent,
    isActive: false,
  },
};
