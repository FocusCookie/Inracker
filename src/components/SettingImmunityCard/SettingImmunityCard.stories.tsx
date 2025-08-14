import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import SettingImmunityCard from "./SettingImmunityCard";

const meta = {
  title: "Components/SettingImmunityCard",
  component: SettingImmunityCard,
  args: {},
} satisfies Meta<typeof SettingImmunityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};