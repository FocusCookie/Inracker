import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SettingPlayerCard from "./SettingPlayerCard";

const meta = {
  title: "Components/SettingPlayerCard",
  component: SettingPlayerCard,
  args: {
    player: {
      details: "## details",
      effects: [],
      ep: 200,
      health: 123,
      image: null,
      immunities: [],
      resistances: [],
      max_health: 123,
      overview: "## Overview",
      id: 1,
      name: "Player One",
      role: "Warrior",
      level: 5,
      icon: "🛡️",
    },
    onDelete: fn(),
    onEdit: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-white p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingPlayerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
