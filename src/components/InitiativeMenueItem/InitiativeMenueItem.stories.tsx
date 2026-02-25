import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import InitiativeMenueItem from "./InitiativeMenueItem";

const meta = {
  title: "Components/InitiativeMenueItem",
  component: InitiativeMenueItem,
  args: {},
  decorators: (Story) => <div className="bg-white p-4">{Story()}</div>,
} satisfies Meta<typeof InitiativeMenueItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    entity: {
      type: "player",
      initiative: 0,
      properties: {
        id: 1,
        name: "Player 1",
        level: 5,
        health: 20,
        max_health: 20,
        ep: 0,
        image: "",
        icon: "🧝",
        details: "Some player details",
        overview: "Player overview",
        role: "Fighter",
        effects: [],
        immunities: [],
        resistances: [],
        gold: 0,
        silver: 0,
        copper: 0,
        hero_points: 0,
      },
    },
    onRemove: fn((entity) =>
      console.log(
        `Removed ${entity.type} with id: ${entity.properties.id}`,
      ),
    ),
    onInitiativeChange: fn((entity, value) =>
      console.log(
        `Changed ${entity.type} with id: ${entity.properties.id} to initiative: ${value}`,
      ),
    ),
  },
};
