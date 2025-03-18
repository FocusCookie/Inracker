---
to: src/components/<%= name %>/<%= name %>.stories.tsx
---
import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import <%= name %> from "./<%= name %>";

const meta = {
  title: "Components/<%= name %>",
  component: <%= name %>,
  args: {},
} satisfies Meta<typeof <%= name %>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};