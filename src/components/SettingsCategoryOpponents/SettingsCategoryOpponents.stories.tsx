import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import SettingsCategoryOpponents from "./SettingsCategoryOpponents";

const meta = {
  title: "Components/SettingsCategoryOpponents",
  component: SettingsCategoryOpponents,
  args: {},
} satisfies Meta<typeof SettingsCategoryOpponents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};