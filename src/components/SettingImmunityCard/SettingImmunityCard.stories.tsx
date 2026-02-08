import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SettingImmunityCard from "./SettingImmunityCard";

const meta = {
  title: "Components/SettingImmunityCard",
  component: SettingImmunityCard,
  args: {
    immunity: {
      id: 1,
      name: "Fire Immunity",
      icon: "🔥",
      description: "Immune to fire damage.",
    },
    onDelete: fn(),
    onEdit: fn(),
  },
} satisfies Meta<typeof SettingImmunityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};