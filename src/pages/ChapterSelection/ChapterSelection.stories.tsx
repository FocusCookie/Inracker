import type { Meta, StoryObj } from "@storybook/react";

import ChapterSelection from "./ChapterSelection";
import { fn } from "@storybook/test";

const mockDatabase = {
  players: {
    create: fn,
    update: fn,
    edit: fn,
  },
  immunitites: {
    create: fn,
    update: fn,
    edit: fn,
  },
  resistances: {
    create: fn,
    update: fn,
    edit: fn,
  },
  effects: {
    create: fn,
    update: fn,
    edit: fn,
  },
};

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
    // @ts-ignore
    database: mockDatabase,
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
        party: 1,
        description: "lorem ipsum",
        icon: "⚔️",
        id: 1,
        name: "fight to death",
        state: "draft",
        battlemap: null,
        encounters: [],
      },
    ],
  },
} satisfies Meta<typeof ChapterSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {
  // },
};
