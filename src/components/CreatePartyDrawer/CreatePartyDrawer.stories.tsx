import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import CreatePartyDrawer from "./CreatePartyDrawer";

const meta = {
  title: "Components/CreatePartyDrawer",
  component: CreatePartyDrawer,
  parameters: {
    layout: "centered",
  },
  args: {
    onCreate: fn(),
    onOpenChange: fn(),
    open: true,
    onComplete: fn(),
    onExitComplete: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof CreatePartyDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {};
