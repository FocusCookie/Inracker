import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SettingResistanceCard from "./SettingResistanceCard";

const meta = {
  title: "Components/SettingResistanceCard",
  component: SettingResistanceCard,
  args: {
    resistance: {
      id: 1,
      name: "Fire Resistance",
      icon: "🔥",
      description: "Resistant to fire damage.",
    },
    onDelete: fn(),
    onEdit: fn(),
  },
} satisfies Meta<typeof SettingResistanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};