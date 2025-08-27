import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import SettingsCategoryResistances from "./SettingsCategoryResistances";

const meta = {
  title: "Components/SettingsCategoryResistances",
  component: SettingsCategoryResistances,
  args: {},
} satisfies Meta<typeof SettingsCategoryResistances>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};