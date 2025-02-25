import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import SettingsButton from "./SettingsButton";

const meta = {
  title: "Components/SettingsButton",
  component: SettingsButton,
  args: {},
} satisfies Meta<typeof SettingsButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};