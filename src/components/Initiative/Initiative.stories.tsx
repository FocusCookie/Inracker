import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Initiative from "./Initiative";
import {
  PlayerEntity,
  EncounterOpponentEntity,
} from "../InitiativeCard/InitiativeCard";

const meta = {
  title: "Components/Initiative",
  component: Initiative,
  args: { onCardClick: fn() },
} satisfies Meta<typeof Initiative>;

export default meta;
type Story = StoryObj<typeof meta>;

const players: PlayerEntity[] = [
  {
    id: 1,
    name: "Aragorn",
    role: "Ranger",
    level: 5,
    health: 45,
    max_health: 50,
    ep: 10,
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cG9ydHIlQzMlQTR0fGVufDB8fDB8fHww",
    icon: "🗡️",
    details: "Heir of Isildur",
    overview: "Strider",
    effects: [],
    immunities: [],
    resistances: [],
    type: "player",
    position: 1,
  },
  {
    id: 2,
    name: "Legolas",
    role: "Archer",
    level: 5,
    health: 35,
    max_health: 40,
    ep: 15,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cG9ydHIlQzMlQTR0fGVufDB8fDB8fHww",
    icon: "🏹",
    details: "Prince of Mirkwood",
    overview: "Elf eyes",
    effects: [],
    immunities: [],
    resistances: [],
    type: "player",
    position: 3,
  },
  {
    id: 3,
    name: "Gimli",
    role: "Warrior",
    level: 5,
    health: 60,
    max_health: 60,
    ep: 5,
    image:
      "https://images.unsplash.com/photo-1570158268183-d296b2892211?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBvcnRyJUMzJUE0dHxlbnwwfHwwfHx8MA%3D%3D",
    icon: "🪓",
    details: "Son of Glóin",
    overview: "Dwarf",
    effects: [],
    immunities: [],
    resistances: [],
    type: "player",
    position: 5,
  },
];

const opponents: EncounterOpponentEntity[] = [
  {
    id: 101,
    name: "Orc Grunt 1",
    icon: "👹",
    details: "A nasty orc",
    health: 15,
    max_health: 20,
    image:
      "https://plus.unsplash.com/premium_photo-1739153828572-8dbcb592f756?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cG9ydHIlQzMlQTR0JTIwZmFudGFzeXxlbnwwfHwwfHx8MA%3D%3D",
    level: 2,
    effects: [],
    immunities: [],
    resistances: [],
    labels: [],
    blueprint: 1,
    type: "encounterOpponent",
    position: 2,
  },
  {
    id: 102,
    name: "Orc Grunt 2",
    icon: "👹",
    details: "Another nasty orc",
    health: 20,
    max_health: 20,
    image:
      "https://images.unsplash.com/photo-1662548293729-0da75f4178d0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBvcnRyJUMzJUE0dCUyMGZhbnRhc3l8ZW58MHx8MHx8fDA%3D",
    level: 2,
    effects: [],
    immunities: [],
    resistances: [],
    labels: [],
    blueprint: 1,
    type: "encounterOpponent",
    position: 4,
  },
  {
    id: 103,
    name: "Orc Grunt 3",
    icon: "👹",
    details: "Yet another nasty orc",
    health: 5,
    max_health: 20,
    image:
      "https://plus.unsplash.com/premium_photo-1661319012531-36ad82c66b0f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDF8fHBvcnRyJUMzJUE0dCUyMGZhbnRhc3l8ZW58MHx8MHx8fDA%3D",
    level: 2,
    effects: [],
    immunities: [],
    resistances: [],
    labels: [],
    blueprint: 1,
    type: "encounterOpponent",
    position: 6,
  },
  {
    id: 104,
    name: "Uruk-hai Captain",
    icon: "👺",
    details: "Leader of the pack",
    health: 50,
    max_health: 50,
    image:
      "https://plus.unsplash.com/premium_photo-1744954074715-e90a397216b0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fHBvcnRyJUMzJUE0dCUyMGZhbnRhc3l8ZW58MHx8MHx8fDA%3D",
    level: 4,
    effects: [],
    immunities: [],
    resistances: [],
    labels: [],
    blueprint: 2,
    type: "encounterOpponent",
    position: 7,
  },
];

const entities = [...players, ...opponents].sort(
  (a, b) => a.position - b.position,
);

export const Primary: Story = {
  args: {
    entities: entities,
    activePosition: 3,
  },
};

export const Small: Story = {
  args: {
    entities: entities.slice(0, 3),
    activePosition: 1,
  },
};

export const ConfigurableLimit: Story = {
  args: {
    entities: entities,
    activePosition: 1,
    maxVisible: 3,
  },
};
