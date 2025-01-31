import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import MarkdownEditor from "./MarkdownEditor";

const meta = {
  title: "Components/MarkdownEditor",
  component: MarkdownEditor,
  args: {},
} satisfies Meta<typeof MarkdownEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};