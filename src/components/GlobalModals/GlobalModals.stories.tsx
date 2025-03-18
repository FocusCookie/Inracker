import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import GlobalModals from "./GlobalModals";

const meta = {
  title: "Components/GlobalModals",
  component: GlobalModals,
  args: {},
} satisfies Meta<typeof GlobalModals>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};