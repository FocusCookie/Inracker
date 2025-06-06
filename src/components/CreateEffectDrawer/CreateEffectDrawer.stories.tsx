import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import CreateEffectDrawer from "./CreateEffectDrawer";

const meta = {
  title: "Components/CreateEffectDrawer",
  component: CreateEffectDrawer,
  args: {
    open: true,
    isCreating: false,
    onOpenChange: fn(),
    onCreate: fn(),
  },
} satisfies Meta<typeof CreateEffectDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
