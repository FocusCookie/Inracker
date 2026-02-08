import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SettingsOpponentCard from "./SettingsOpponentCard";

const meta = {
  title: "Components/SettingsOpponentCard",
  component: SettingsOpponentCard,
  args: {
    opponent: {
      id: 1,
      name: "Goblin",
      icon: "👹",
      details: "A small goblin.",
      health: 10,
      max_health: 10,
      image: null,
      level: 1,
      labels: [],
      effects: [],
      immunities: [],
      resistances: [],
    },
    onDelete: fn(),
    onEdit: fn(),
  },
} satisfies Meta<typeof SettingsOpponentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};