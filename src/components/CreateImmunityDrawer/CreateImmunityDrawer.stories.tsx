import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import CreateImmunityDrawer from "./CreateImmunityDrawer";

const meta = {
  title: "Components/CreateImmunityDrawer",
  component: CreateImmunityDrawer,
  parameters: {},
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
} satisfies Meta<typeof CreateImmunityDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
