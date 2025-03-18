import type { Meta, StoryObj } from "@storybook/react";

import ChapterSelection from "./ChapterSelection";
import { fn } from "@storybook/test";

const meta = {
  title: "Pages/ChapterSelection",
  component: ChapterSelection,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="h-[90vh] w-[90vw] bg-neutral-800 p-8">{Story()}</div>
    ),
  ],
  args: {
    party: {
      description: "desc",
      icon: "🕵️‍♂️",
      id: 1,
      name: "party name",
      players: [
        {
          details: "details",
          effects: [],
          ep: 123,
          health: 10,
          icon: "💰",
          id: 24,
          image: null,
          immunities: [],
          level: 2,
          max_health: 22,
          name: "tester",
          overview: "overview",
          resistances: [],
          role: "tester",
        },
      ],
    },
    isLoading: false,
    chapters: [
      {
        image: null,
        description: "lorem ipsum",
        icon: "⚔️",
        id: 1,
        name: "fight to death",
        state: "draft",
        battlemap: null,
        encounters: null,
        experience: 200,
        tokens: null,
      },
    ],
    players: [
      {
        details: "details",
        effects: [],
        ep: 123,
        health: 10,
        icon: "💰",
        id: 1,
        image: null,
        immunities: [],
        level: 2,
        max_health: 22,
        name: "tester",
        overview: "overview",
        resistances: [],
        role: "tester",
      },
      {
        details: "details",
        effects: [],
        ep: 123,
        health: 10,
        icon: "💰",
        id: 2,
        image: null,
        immunities: [],
        level: 2,
        max_health: 22,
        name: "tester 2",
        overview: "overview",
        resistances: [],
        role: "tester",
      },
    ],
    onRemoveImmunityFromPlayer: fn(),
    onRemovePlayerFromParty: fn(),
    onRemoveResistanceFromPlayer: fn(),
  },
} satisfies Meta<typeof ChapterSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {
  // },
};
