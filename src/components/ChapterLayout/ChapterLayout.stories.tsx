import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import ChapterLayout from "./ChapterLayout";

const meta = {
  title: "Layout/ChapterLayout",
  component: ChapterLayout,
  parameters: {},
  args: {
    asideChildren: "aside content",
    children: "chapters",
    isAsideOpen: false,
    drawers: <div className="drawers"></div>,
  },
} satisfies Meta<typeof ChapterLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
