import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ResistancesCatalog from "./ResistancesCatalog";

const meta = {
  title: "Components/ResistancesCatalog",
  component: ResistancesCatalog,
  args: {
    onAdd: fn(),
    onOpenChange: fn(),
    open: true,
    resistances: [
      { description: "description text", icon: "📞", id: 1, name: "telefon" },
      { description: "description text", icon: "💰", id: 2, name: "money" },
    ],
  },
} satisfies Meta<typeof ResistancesCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
