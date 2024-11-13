import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import Loader from "./Loader";

const meta = {
  title: "Components/Loader",
  component: Loader,
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};

export const LargeWithTitle: Story = {
  args: {
    title: "Loading",
    size: "large",
  },
};
