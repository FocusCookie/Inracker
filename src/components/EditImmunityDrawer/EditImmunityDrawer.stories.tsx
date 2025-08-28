import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { DBImmunity } from "@/types/immunitiy";

import EditImmunityDrawer from "./EditImmunityDrawer";

const meta = {
  title: "Components/EditImmunityDrawer",
  component: EditImmunityDrawer,
  parameters: {},
  args: {
    open: true,
    onOpenChange: fn(),
    onEdit: fn(),
    onComplete: fn(),
    onCancel: fn(),
    onExitComplete: fn(),
    immunity: {
      id: 1,
      name: "Fire Immunity",
      description:
        "This character is immune to fire damage and fire-based effects.",
      icon: "🔥",
    } as DBImmunity,
  },
  decorators: [
    (Story) => (
      <div className="h-fit w-full rounded-md bg-white p-2">{Story()}</div>
    ),
  ],
} satisfies Meta<typeof EditImmunityDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
