import type { Meta, StoryObj } from "@storybook/react";
import { db } from "@/mocks/db";

import Play from "./Play";

const meta = {
  title: "Pages/Play",
  component: Play,
  args: {
    partyId: 1,
    database: db as any,
    chapter: {
      id: 1,
      name: "Mock Chapter",
      description: "",
      icon: "📜",
      battlemap: null,
      party: 1,
      state: "ongoing",
      encounters: [],
    },
    encounters: [],
    players: [],
    tokens: [],
  },
} satisfies Meta<typeof Play>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};