import type { Meta, StoryFn, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import Collapsible from "./Collapsible";
import { Badge } from "../ui/badge";

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  parameters: {},
  args: {
    children: <span>CHIDREN</span>,
    title: <Badge>title childs</Badge>,
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

export const WithActions: Story = {
  args: {
    actions: <button>test actions</button>,
  },
};
