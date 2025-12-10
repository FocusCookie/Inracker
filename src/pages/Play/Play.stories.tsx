import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import Play from "./Play";

const meta = {
  title: "Components/Play",
  component: Play,
  args: {},
} satisfies Meta<typeof Play>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};