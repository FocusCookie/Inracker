import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import PartyCard from "./PartyCard";

const meta = {
  title: "Components/PartyCard",
  component: PartyCard,
  parameters: {
    layout: "centered",
  },
  // args: { onClick: fn() },
  args: {
    onEdit: fn(),
    onOpen: fn(),
    party: {
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam enim dolor delectus eos assumenda officiis, cum, maxime, ratione obcaecati perspiciatis cupiditate at aspernatur facere repudiandae. Officia amet mollitia quisquam aliquid.",
      icon: "🧛‍♀️",
      id: 1,
      name: "Draculas Nachfolger und seine Haustiere",
      players: [
        {
          id: 1,
          name: "magien",
          icon: "🧙",
          role: "barbar",
          level: 4,
          health: 23,
          max_health: 10,
          ep: 234,
          details: "DESTROY!",
          overview: "overview",
          image: null,
          effects: [],
          immunities: [],
          resistances: [],
          gold: 0,
          silver: 0,
          copper: 0,
          hero_points: 0,
        },
        {
          id: 2,
          name: "other player",
          icon: "🥷",
          role: "rouqe",
          level: 4,
          health: 23,
          max_health: 10,
          ep: 234,
          details: "DESTROY!",
          overview: "overview",
          image: null,
          effects: [],
          immunities: [],
          resistances: [],
          gold: 0,
          silver: 0,
          copper: 0,
          hero_points: 0,
        },
        {
          id: 3,
          name: "Conan",
          icon: "🧌",
          role: "barbar",
          level: 4,
          health: 23,
          max_health: 10,
          ep: 234,
          details: "DESTROY!",
          overview: "overview",
          image: null,
          effects: [],
          immunities: [],
          resistances: [],
          gold: 0,
          silver: 0,
          copper: 0,
          hero_points: 0,
        },
      ],
    },
  },
} satisfies Meta<typeof PartyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  // args: {},
};
