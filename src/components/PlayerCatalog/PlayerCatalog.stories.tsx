import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import PlayerCatalog from "./PlayerCatalog";

const mockDatabase = {
  players: {
    getAll: fn(() => [
      {
        details: "details",
        effects: [],
        ep: 123,
        health: 10,
        icon: "💰",
        id: 1,
        image: null,
        immunities: [],
        level: 2,
        max_health: 22,
        name: "tester",
        overview: "overview",
        resistances: [],
        role: "tester",
      },
      {
        details: "details2",
        effects: [],
        ep: 100,
        health: 8,
        icon: "🛡️",
        id: 2,
        image: null,
        immunities: [],
        level: 1,
        max_health: 15,
        name: "defender",
        overview: "overview2",
        resistances: [],
        role: "tank",
      },
    ]),
    create: fn(),
  },
};

const meta = {
  title: "Components/PlayerCatalog",
  component: PlayerCatalog,
  args: {
    // @ts-ignore
    database: mockDatabase,
    open: true,
    onOpenChange: fn(),
    onSelect: fn(),
    partyId: 99,
    excludedPlayers: [],
    onExitComplete: fn(),
  },
} satisfies Meta<typeof PlayerCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
