import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import SettingsCategoryGeneral from "./SettingsCategoryGeneral";

const meta = {
  title: "Components/SettingsCategoryGeneral",
  component: SettingsCategoryGeneral,
  args: {},
} satisfies Meta<typeof SettingsCategoryGeneral>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};