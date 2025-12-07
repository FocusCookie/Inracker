import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import EditOpponentDrawer from "./EditOpponentDrawer";

const meta = {
  title: "Components/EditOpponentDrawer",
  component: EditOpponentDrawer,
  args: {},
} satisfies Meta<typeof EditOpponentDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};