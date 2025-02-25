import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import CreatePlayerDrawer from "./CreatePlayerDrawer";

const meta = {
  title: "Components/CreatePlayerDrawer",
  component: CreatePlayerDrawer,
  args: {},
} satisfies Meta<typeof CreatePlayerDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};