import type { Meta, StoryObj } from "@storybook/react";

import PartySelection from "./PartySelection";
// import { fn } from "@storybook/test";

const meta = {
  title: "Pages/PartySelection",
  component: PartySelection,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="h-[90vh] w-[90vw] bg-neutral-800 p-8">{Story()}</div>
    ),
  ],
  args: {},
} satisfies Meta<typeof PartySelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
