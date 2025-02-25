import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import PlayerCatalog from "./PlayerCatalog";

const meta = {
  title: "Components/PlayerCatalog",
  component: PlayerCatalog,
  args: {
    open: true,
    onOpenChange: fn(),
    onAdd: fn(),
    partyId: 99,
    players: [
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
    ],
    excludedPlayers: [],
  },
} satisfies Meta<typeof PlayerCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
