import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import PlayerCatalog from "./PlayerCatalog";

const meta = {
  title: "Components/PlayerCatalog",
  component: PlayerCatalog,
  args: {},
} satisfies Meta<typeof PlayerCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};