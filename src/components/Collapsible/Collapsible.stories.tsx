import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import Collapsible from "./Collapsible";
import { Badge } from "../ui/badge";

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  parameters: {},
  args: {
    children: <span>CHIDREN</span>,
    titleChildren: <Badge>title childs</Badge>,
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
