import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Catalog from "./Catalog";
import ImmunityCard from "../ImmunityCard/ImmunityCard";

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
];

const meta = {
  title: "Components/Catalog",
  component: Catalog,
  parameters: {},
  args: {
    triggerName: "Immunities Catalog",
    disabled: false,
    description: "Choose an immunity for your player.",
    title: "Immunity Catalog",
    onSearchChange: fn(),
    children: (
      <div className="flex flex-col gap-2">
        {immunities.map((immunity) => (
          <ImmunityCard key={immunity.id} immunity={immunity} onAction={fn()} />
        ))}
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="h-fit w-full rounded-md bg-white p-2">{Story()}</div>
    ),
  ],
} satisfies Meta<typeof Catalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
