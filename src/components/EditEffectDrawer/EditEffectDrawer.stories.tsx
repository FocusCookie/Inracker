import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EditEffectDrawer from "./EditEffectDrawer";

const meta = {
  title: "Components/EditEffectDrawer",
  component: EditEffectDrawer,
  args: {
    effect: {
      id: 1,
      name: "Test Effect",
      description: "This is a test effect.",
      icon: "🪄",
      type: "positive",
      duration: 5,
      durationType: "rounds",
      value: 10,
    },
    open: true,
    onOpenChange: fn(),
    onEdit: fn(),
    onComplete: fn(),
    onCancel: fn(),
    onExitComplete: fn(),
  },
} satisfies Meta<typeof EditEffectDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
