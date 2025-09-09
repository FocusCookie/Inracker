import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { DBResistance } from "@/types/resistances";

import EditResistanceDrawer from "./EditResistanceDrawer";

const meta = {
  title: "Components/EditResistanceDrawer",
  component: EditResistanceDrawer,
  parameters: {},
  args: {
    open: true,
    onOpenChange: fn(),
    onEdit: fn(),
    onComplete: fn(),
    onCancel: fn(),
    onExitComplete: fn(),
    resistance: {
      id: 1,
      name: "Fire Resistance",
      description:
        "This character is resistant to fire damage and fire-based effects.",
      icon: "🔥",
    } as DBResistance,
  },
  decorators: [
    (Story) => (
      <div className="h-fit w-full rounded-md bg-white p-2">{Story()}</div>
    ),
  ],
} satisfies Meta<typeof EditResistanceDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};

