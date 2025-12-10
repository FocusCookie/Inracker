import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import CreatePlayerDrawer from "./CreatePlayerDrawer";

const mockDatabase = {
  immunitites: {
    getAll: fn(() => ([
      { id: 1, name: "Fire Immunity", icon: "🔥", description: "Immune to fire" },
      { id: 2, name: "Cold Immunity", icon: "❄️", description: "Immune to cold" },
    ])),
    create: fn(),
  },
  resistances: {
    getAll: fn(() => ([
      { id: 1, name: "Fire Resistance", icon: "🔥", description: "Resistant to fire" },
      { id: 2, name: "Cold Resistance", icon: "❄️", description: "Resistant to cold" },
    ])),
    create: fn(),
  },
};

const meta = {
  title: "Components/CreatePlayerDrawer",
  component: CreatePlayerDrawer,
  parameters: {
    layout: "centered",
  },
  args: {
    // @ts-ignore
    database: mockDatabase,
    open: true,
    onOpenChange: fn(),
    onExitComplete: fn(),
    onCreate: fn(),
    onComplete: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof CreatePlayerDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
