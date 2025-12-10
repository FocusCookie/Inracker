import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EncounterSelection from "./EncounterSelection";
import db from "@/mocks/db";
import { Encounter, EncounterDifficulty } from "@/types/encounter";

const difficulties: EncounterDifficulty[] = [
  {
    description:
      "Failed - broken leg - super long text to see hoe it looks like and even longer to see another break in the text maklsdjflkajeföwj klefja lkwejflk aöwjefl kj awölefj ",
    value: 10,
  },

  {
    description: "Passed",
    value: 15,
  },
  {
    description: "Crititcal Success - jumpen higher",
    value: 20,
  },
];

const encounter: Encounter = {
  id: 1,
  name: "ein langer titel zum testen ",
  color: "#f44336",
  passed: false,
  experience: 120,
  images: null,
  description: `### some thing!
- first thing
- second
`,
  dice: 20,
  difficulties,
  opponents: [1, 2],
  skill: "athletic",
  type: "note",
  element: {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    color: "#f44336",
    icon: "💅",
    name: "notiz",
  },
};

const meta = {
  title: "Components/EncounterSelection",
  component: EncounterSelection,
  args: {
    open: true,
    // @ts-ignore
    database: db,
    chapterId: 1,
    encounter,
    encounterOpponents: [
      {
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
      {
        id: 2,
        name: "voldemort",
        icon: "👻",
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
    ],
    onExitComplete: fn(),
    onOpenChange: fn(),
    onCancel: fn(),
  },
  decorators: [
    (Story) => (
      <div className="relative h-full w-full overflow-hidden bg-slate-500">
        {Story()}
      </div>
    ),
  ],
} satisfies Meta<typeof EncounterSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Note: Story = {
  // args: {},
};

export const Roll: Story = {
  args: {
    encounter: { ...encounter, type: "roll", description: "some small note" },
  },
};

export const Fight: Story = {
  args: {
    encounter: { ...encounter, type: "fight", description: "some small note" },
  },
};
