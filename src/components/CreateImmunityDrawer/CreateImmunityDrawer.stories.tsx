import type { Meta, StoryObj, StoryFn } from "@storybook/react";
import { fn } from "@storybook/test";

import Collapsible from "./CreateImmunityDrawer";

const meta = {
  title: "Components/CreateImmunityDrawer",
  component: Collapsible,
  parameters: {},
  args: {
    isCreating: false,
    onCreate: fn(),
  },
  decorators: [
    (Story: StoryFn) => (
      <div className="h-fit w-full rounded-md bg-white p-2">{Story()}</div>
    ),
  ],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
