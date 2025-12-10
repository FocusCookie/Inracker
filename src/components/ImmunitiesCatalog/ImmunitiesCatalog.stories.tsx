import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import ImmunitiesCatalog from "./ImmunitiesCatalog";

const mockDatabase = {
  immunitites: {
    getAll: fn(() => [
      {
        id: 1,
        description: `
- 4 damage over time decreased
- ignores water damage`,
        name: "Feuerimunität",
        icon: "🔥",
      },
      {
        id: 2,
        description: `
- no **splash damage**,
- ignores water damage`,
        name: "Water Splash ",
        icon: "💧",
      },
    ]),
    create: fn(),
  },
};

const meta = {
  title: "Components/ImmunitiesCatalog",
  component: ImmunitiesCatalog,
  args: {
    // @ts-ignore
    database: mockDatabase,
    open: true,
    onAdd: fn(),
    onOpenChange: fn(),
    onCancel: fn(),
    onExitComplete: fn(),
    onSelect: fn(),
  },
} satisfies Meta<typeof ImmunitiesCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
