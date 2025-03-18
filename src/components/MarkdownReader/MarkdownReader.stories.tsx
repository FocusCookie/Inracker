import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import MarkdownReader from "./MarkdownReader";

const meta = {
  title: "Components/MarkdownReader",
  component: MarkdownReader,
  args: {
    markdown: `# hello world 
    * Has a lot of plugins

## Contents`,
  },
  decorators: [(Story) => <div className="text-white">{Story()}</div>],
} satisfies Meta<typeof MarkdownReader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
