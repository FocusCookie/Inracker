import type { Meta, StoryObj } from "@storybook/react";

import IconAvatar from "./IconAvatar";

const meta = {
  title: "Components/IconAvatar",
  component: IconAvatar,
  parameters: {
    layout: "centered",
  },
  args: {
    player: {
      id: 1,
      name: "H. Potter",
      icon: "🧙",
      role: "mage",
      level: 4,
      health: 23,
      max_health: 10,
      ep: 234,
      details: "Hex hex!",
      overview: "overview",
      image: null,
      effects: [],
      immunities: [],
      resistances: [],
      weaknesses: [],
      gold: 0,
      silver: 0,
      copper: 0,
      hero_points: 0,
    },
  },
} satisfies Meta<typeof IconAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {};
