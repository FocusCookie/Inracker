import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ResistanceCard from "./ResistanceCard";
import { Button } from "../ui/button";

const meta = {
  title: "Components/ResistanceCard",
  component: ResistanceCard,
  parameters: {},
  args: {
    resistance: {
      id: 1,
      description: `# reduces damage 
      ## is Bad 
      - first
      - second
      **bold**`,
      icon: "⚔️",
      name: "some resistance",
    },
    onRemove: fn(),
  },
  decorators: [
    (Story) => (
      <div className="h-fit w-full rounded-md bg-white p-2">{Story()}</div>
    ),
  ],
} satisfies Meta<typeof ResistanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const WithActions: Story = {
  args: {
    actions: <Button>Add</Button>,
  },
};
