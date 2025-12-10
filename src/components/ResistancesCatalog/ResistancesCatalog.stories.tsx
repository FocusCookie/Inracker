import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ResistancesCatalog from "./ResistancesCatalog";

const mockDatabase = {
  resistances: {
    getAll: fn(() => [
      { description: "description text", icon: "📞", id: 1, name: "telefon" },
      { description: "description text", icon: "💰", id: 2, name: "money" },
    ]),
    create: fn(),
  },
};

const meta = {
  title: "Components/ResistancesCatalog",
  component: ResistancesCatalog,
  args: {
    // @ts-ignore
    database: mockDatabase,
    onAdd: fn(),
    onOpenChange: fn(),
    open: true,
    onCancel: fn(),
    onExitComplete: fn(),
    onSelect: fn(),
  },
} satisfies Meta<typeof ResistancesCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
