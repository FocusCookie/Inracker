import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import ImmunitiesCatalog from "./ImmunitiesCatalog";

const immunities = [
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
  {
    id: 3,
    description: `
- no **splash damage**,
- ignores water damage`,
    name: "Water Splash ",
    icon: "💧",
  },
  {
    id: 4,
    description: `
- no **splash damage**,
- ignores water damage`,
    name: "Water Splash ",
    icon: "💧",
  },
  {
    id: 5,
    description: `
- no **splash damage**,
- ignores water damage`,
    name: "Water Splash ",
    icon: "💧",
  },
  {
    id: 7,
    description: `
- no **splash damage**,
- ignores water damage`,
    name: "Water Splash ",
    icon: "💧",
  },
  {
    id: 8,
    description: `
- no **splash damage**,
- ignores water damage`,
    name: "Water Splash ",
    icon: "💧",
  },
  {
    id: 9,
    description: `
- no **splash damage**,
- ignores water damage`,
    name: "Water Splash ",
    icon: "💧",
  },
  {
    id: 10,
    description: `
- no **splash damage**,
- ignores water damage`,
    name: "Water Splash ",
    icon: "💧",
  },
  {
    id: 11,
    description: `
- no **splash damage**,
- ignores water damage`,
    name: "Water Splash ",
    icon: "💧",
  },
];

const meta = {
  title: "Components/ImmunitiesCatalog",
  component: ImmunitiesCatalog,
  args: { immunities, open: true, onAdd: fn(), onOpenChange: fn() },
} satisfies Meta<typeof ImmunitiesCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
