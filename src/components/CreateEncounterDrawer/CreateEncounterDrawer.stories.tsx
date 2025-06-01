import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import CreateEncounterDrawer from "./CreateEncounterDrawer";

const meta = {
  title: "Components/CreateEncounterDrawer",
  component: CreateEncounterDrawer,
  parameters: {
    layout: "centered",
  },
  args: { isCreating: false, onCreate: fn(), onOpenChange: fn(), open: true },
} satisfies Meta<typeof CreateEncounterDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  // args: {},
};
