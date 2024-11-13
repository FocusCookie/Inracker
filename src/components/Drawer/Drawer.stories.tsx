import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Drawer from "./Drawer";
import { Button } from "../ui/button";

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
  },
  args: {
    open: true,
    onOpenChange: fn(),
    createTrigger: <Button>Trigger Drawer</Button>,
    cancelTrigger: <Button>Cancel</Button>,
    title: "Title",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Minima labore molestias magni, exxxx sequi suscipit! Minus sunt nam unde dolorum cupiditate? Qui laboriosam alias neque asperiores beatae odio veniam at!",
    children: (
      <div className="flex flex-col gap-8">
        <p className="h-96">some content</p>
      </div>
    ),
    actions: (
      <>
        <Button>Action 1</Button>
        <Button>Action 2</Button>
      </>
    ),
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  // args: {},
};
