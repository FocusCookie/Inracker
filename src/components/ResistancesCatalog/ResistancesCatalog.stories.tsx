import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import ResistancesCatalog from "./ResistancesCatalog";

const meta = {
  title: "Components/ResistancesCatalog",
  component: ResistancesCatalog,
  args: {},
} satisfies Meta<typeof ResistancesCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};