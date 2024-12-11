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
    onPlayerClick: fn(),
    party: {
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam enim dolor delectus eos assumenda officiis, cum, maxime, ratione obcaecati perspiciatis cupiditate at aspernatur facere repudiandae. Officia amet mollitia quisquam aliquid.",
      icon: "🧛‍♀️",
      id: 1,
      name: "Draculas Nachfolger und seine Haustiere",
      players: [
        {
          id: 1,
          armor: 12,
          role: "barbar",
          classSg: 22,
          description: "DESTROY!",
          effects: [],
          icon: "🧙",
          // @ts-ignore
          attributes: {},
          ep: 234,
          health: 23,
          level: 4,
          // @ts-ignore
          skills: {},
          // @ts-ignore
          immunities: [],
          movement: {
            air: 0,
            ground: 8,
            highJump: 2,
            water: 2,
            wideJump: 4,
          },
          name: "magien",
          perception: 22,
          savingThrows: {
            reflex: 2,
            toughness: 2,
            will: 2,
          },
          shield: null,
        },
        {
          id: 2,
          armor: 12,
          role: "rouqe",
          classSg: 22,
          description: "DESTROY!",
          effects: [],
          icon: "🥷",
          // @ts-ignore
          attributes: {},
          ep: 234,
          health: 23,
          level: 4,
          // @ts-ignore
          skills: {},
          // @ts-ignore
          immunities: [],
          movement: {
            air: 0,
            ground: 8,
            highJump: 2,
            water: 2,
            wideJump: 4,
          },
          name: "other player",
          perception: 22,
          savingThrows: {
            reflex: 2,
            toughness: 2,
            will: 2,
          },
          shield: null,
        },
        {
          id: 3,
          armor: 12,
          role: "barbar",
          classSg: 22,
          description: "DESTROY!",
          effects: [],
          icon: "🧌",
          // @ts-ignore
          attributes: {},
          ep: 234,
          health: 23,
          level: 4,
          // @ts-ignore
          skills: {},
          // @ts-ignore
          immunities: [],
          movement: {
            air: 0,
            ground: 8,
            highJump: 2,
            water: 2,
            wideJump: 4,
          },
          name: "Conan",
          perception: 22,
          savingThrows: {
            reflex: 2,
            toughness: 2,
            will: 2,
          },
          shield: null,
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
