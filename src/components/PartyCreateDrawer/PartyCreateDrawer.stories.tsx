import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import PartyCreateDrawer from "./PartyCreateDrawer";

const meta = {
  title: "Components/PartyCreateDrawer",
  component: PartyCreateDrawer,
  parameters: {
    layout: "centered",
  },
  args: {},
} satisfies Meta<typeof PartyCreateDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  // args: {},
};
