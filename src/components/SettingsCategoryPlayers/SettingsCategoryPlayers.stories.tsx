import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import SettingsCategoryPlayers from "./SettingsCategoryPlayers";

const meta = {
  title: "Components/SettingsCategoryPlayers",
  component: SettingsCategoryPlayers,
  args: {},
} satisfies Meta<typeof SettingsCategoryPlayers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};