import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import IconAvatar from "./IconAvatar";

const meta = {
  title: "Components/IconAvatar",
  component: IconAvatar,
  parameters: {
    layout: "centered",
  },
  args: {
    name: "Lizard",
    icon: "🧙",
    onClick: fn(),
  },
} satisfies Meta<typeof IconAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  // args: {},
};
