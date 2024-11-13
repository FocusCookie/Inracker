import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import PartyEditDrawer from "./PartyEditDrawer";

const meta = {
  title: "Components/PartyEditDrawer",
  component: PartyEditDrawer,
  parameters: {
    layout: "centered",
  },
  args: {
    party: {
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consectetur, numquam minus nostrum beatae eius voluptatum. Accusamus quaerat repudiandae laboriosam fuga sapiente incidunt laudantium voluptatum, commodi quas quibusdam vero neque quisquam! ",
      icon: "🧛‍♀️",
      id: 1,
      name: "First blood",
      players: [],
    },
    isUpdating: false,
    onUpdate: fn(),
    onOpenChange: fn(),
    onDelete: fn(),
    open: true,
  },
} satisfies Meta<typeof PartyEditDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  // args: {},
};
