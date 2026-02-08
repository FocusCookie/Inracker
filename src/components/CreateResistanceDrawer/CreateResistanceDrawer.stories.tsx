import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import CreateResistanceDrawer from "./CreateResistanceDrawer";

const meta = {
  title: "Components/CreateResistanceDrawer",
  component: CreateResistanceDrawer,
  args: {
    open: true,
    onOpenChange: fn(),
    onCreate: fn(),
    onComplete: fn(),
    onExitComplete: fn(),
    onCancel: fn(),
  },
  decorators: [
    (Story) => (
      <div className="h-fit w-full rounded-md bg-white p-2">{Story()}</div>
    ),
  ],
} satisfies Meta<typeof CreateResistanceDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
