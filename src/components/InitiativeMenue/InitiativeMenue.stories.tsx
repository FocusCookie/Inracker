import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import InitiativeMenue from "./InitiativeMenue";

const meta = {
  title: "Components/InitiativeMenue",
  component: InitiativeMenue,
  args: {},
} satisfies Meta<typeof InitiativeMenue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};