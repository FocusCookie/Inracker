import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import SettingsOpponentCard from "./SettingsOpponentCard";

const meta = {
  title: "Components/SettingsOpponentCard",
  component: SettingsOpponentCard,
  args: {},
} satisfies Meta<typeof SettingsOpponentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};