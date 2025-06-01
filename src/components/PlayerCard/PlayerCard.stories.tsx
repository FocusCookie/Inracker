import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import PlayerCard from "./PlayerCard";

const meta = {
  title: "Components/PlayerCard",
  component: PlayerCard,
  parameters: {},
  args: {
    onAddImmunity: fn(),
    onAddResistance: fn(),
    onEdit: fn(),
    onRemove: fn(),
    onRemoveImmunity: fn(),
    onRemoveResistance: fn(),
    expanded: false,
    player: {
      id: 1,
      role: "mage",
      details: "Hex hex!",
      effects: [],
      icon: "🧙",
      ep: 234,
      health: 23,
      level: 4,
      immunities: [],
      name: "H. Potter",
      resistances: [
        {
          id: 1,
          name: "resistance xyz",
          icon: "🚨",
          description: "# Resistance markdown",
        },
      ],
      image: null,
      max_health: 10,
      overview: "overview",
    },
  },
  decorators: [(Story) => <div className="w-fit bg-white p-4">{Story()}</div>],
} satisfies Meta<typeof PlayerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
