import type { Meta, StoryObj } from "@storybook/react";
import OpponentCard from "./OpponentCard";
import { fn } from "@storybook/test";

const meta = {
  title: "Components/OpponentCard",
  component: OpponentCard,
  args: {
    opponent: {
      id: 1,
      name: "Test Opponent",
      icon: "👹",
      details: `
      # Test Opponent
      This is a test opponent with some details.
      ## Abilities
      - Ability 1
      - Ability 2
      ## Weaknesses
      - Weakness 1`,
      health: 100,
      labels: ["Test"],
      max_health: 100,
      image: null,
      level: 5,
      resistances: [
        {
          id: 1,
          name: "Fire Resistance",
          icon: "🔥",
          description: "Resistant to fire damage.",
        },
        {
          id: 2,
          name: "Cold Resistance",
          icon: "🥶",
          description: "Resistant to cold damage.",
        },
      ],
      effects: [
        {
          id: 1,
          name: "Strength Buff",
          icon: "💪",
          description: "Increased strength for 2 rounds.",
          duration: 2,
          duration_type: "rounds",
          type: "positive",
        },
        {
          id: 2,
          name: "Poisoned",
          icon: "🧪",
          description: "Takes poison damage for 3 rounds.",
          duration: 3,
          duration_type: "rounds",
          type: "negative",
        },
        {
          id: 3,
          name: "Weakness",
          icon: "⬇️",
          description: "Decreased damage for 1 round.",
          duration: 1,
          duration_type: "rounds",
          type: "negative",
        },
      ],
      immunities: [
        {
          id: 1,
          name: "Poison Immunity",
          icon: "🧪",
          description: "Immune to poison damage.",
        },
        {
          id: 2,
          name: "Disease Immunity",
          icon: "🤢",
          description: "Immune to disease.",
        },
      ],
    },
    onDelete: fn(),
    onEdit: fn(),
    onRemoveImmunity: fn(),
    onRemoveResistance: fn(),
    onRemoveEffect: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-white p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OpponentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
