import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SettingsDialog from "./SettingsDialog";

const meta = {
  title: "Components/SettingsDialog",
  component: SettingsDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    onDeletePlayer: fn(),
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
      {
        details: "details",
        effects: [],
        ep: 123,
        health: 10,
        icon: "💰",
        id: 2,
        image: null,
        immunities: [],
        level: 2,
        max_health: 22,
        name: "tester 2",
        overview: "overview",
        resistances: [],
        role: "tester",
      },
    ],
  },
} satisfies Meta<typeof SettingsDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
