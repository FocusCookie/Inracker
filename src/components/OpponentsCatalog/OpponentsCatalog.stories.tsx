import type { Meta, StoryObj } from "@storybook/react";
import OpponentsCatalog from "./OpponentsCatalog";
import { fn } from "@storybook/test";
import { db } from "@/mocks/db";

const meta = {
  title: "Components/OpponentsCatalog",
  component: OpponentsCatalog,
  args: {
    open: true,
    database: db as any,
    onSelect: fn(),
    onOpenChange: fn(),
    onExitComplete: fn(),
  },
} satisfies Meta<typeof OpponentsCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
