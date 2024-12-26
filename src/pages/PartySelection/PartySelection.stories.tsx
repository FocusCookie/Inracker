import type { Meta, StoryFn, StoryObj } from "@storybook/react";

import PartySelection from "./PartySelection";
import PartyCreateDrawer from "@/components/CreatePartyDrawer/PartyCreateDrawer";
import { fn } from "@storybook/test";

const meta = {
  title: "Pages/PartySelection",
  component: PartySelection,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: StoryFn) => (
      <div className="h-[90vh] w-[90vw] bg-neutral-800 p-8">{Story()}</div>
    ),
  ],
  args: {
    parties: [],
    renderCreatePartyDrawer: (
      <PartyCreateDrawer
        isCreating={false}
        onCreate={fn()}
        onOpenChange={fn()}
        open
      />
    ),
    loading: false,
    onEditParty: fn(),
  },
} satisfies Meta<typeof PartySelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
