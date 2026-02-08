import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EditOpponentDrawer from "./EditOpponentDrawer";

const meta = {
  title: "Components/EditOpponentDrawer",
  component: EditOpponentDrawer,
  args: {
    opponent: {
      id: 1,
      name: "Opponent Name",
      details: "Details",
      icon: "👹",
      health: 100,
      max_health: 100,
      image: null,
      level: 1,
      labels: [],
      effects: [],
      immunities: [],
      resistances: [],
    },
    open: true,
    onOpenChange: fn(),
    onExitComplete: fn(),
    onEdit: fn(),
    onComplete: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof EditOpponentDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};