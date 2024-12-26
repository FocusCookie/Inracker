import type { Meta, StoryFn, StoryObj } from "@storybook/react";

import Welcome from "./Welcome";
import { fn } from "@storybook/test";

const meta = {
  title: "Pages/Welcome",
  component: Welcome,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: StoryFn) => (
      <div className="h-[90vh] w-[90vw] bg-neutral-800 p-8">{Story()}</div>
    ),
  ],
  args: { onLetUsRole: fn() },
} satisfies Meta<typeof Welcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
