import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import SettingResistanceCard from "./SettingResistanceCard";

const meta = {
  title: "Components/SettingResistanceCard",
  component: SettingResistanceCard,
  args: {},
} satisfies Meta<typeof SettingResistanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};