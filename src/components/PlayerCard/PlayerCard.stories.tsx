import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import PlayerCard from "./PlayerCard";

const meta = {
  title: "Components/PlayerCard",
  component: PlayerCard,
  parameters: {},
  args: {
    onRemoveEffect: fn(),
    onEdit: fn(),
    onRemove: fn(),
    onRemoveImmunity: fn(),
    onRemoveResistance: fn(),
    onEditImmunity: fn(),
    onEditResistance: fn(),
    onEditEffect: fn(),
    onOpenImmunitiesCatalog: fn(),
    onOpenResistancesCatalog: fn(),
    onOpenEffectsCatalog: fn(),
    onEditMoney: fn(),
    onToggleHeroPoint: fn(),
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
      gold: 10,
      silver: 5,
      copper: 100,
      hero_points: 1,
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

export const Primary: Story = {};
