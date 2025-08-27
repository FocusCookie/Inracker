import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import SettingsCategoryEffects from "./SettingsCategoryEffects";

const meta = {
  title: "Components/SettingsCategoryEffects",
  component: SettingsCategoryEffects,
  args: {},
} satisfies Meta<typeof SettingsCategoryEffects>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};