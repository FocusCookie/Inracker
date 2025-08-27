import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import SettingsCategoryImmunities from "./SettingsCategoryImmunities";

const meta = {
  title: "Components/SettingsCategoryImmunities",
  component: SettingsCategoryImmunities,
  args: {},
} satisfies Meta<typeof SettingsCategoryImmunities>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};