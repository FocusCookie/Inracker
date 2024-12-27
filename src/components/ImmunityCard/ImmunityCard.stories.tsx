import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Collapsible from "./ImmunityCard";
import { Button } from "../ui/button";

const meta = {
  title: "Components/ImmunityCard",
  component: Collapsible,
  parameters: {},
  args: {
    immunity: {
      id: 1,
      description: `# Fire
      ## is Bad 
      - first
      - second
      **bold**`,
      icon: "🎸",
      name: "some immunity",
    },
  },
  decorators: [
    (Story) => (
      <div className="h-fit w-full rounded-md bg-white p-2">{Story()}</div>
    ),
  ],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};

export const WithActions: Story = {
  args: {
    actions: <Button>Add</Button>,
  },
};
