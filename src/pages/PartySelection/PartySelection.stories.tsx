import type { Meta, StoryObj } from "@storybook/react";
import PartySelection from "./PartySelection";
import { fn } from "@storybook/test";

const mockDatabase = {
  parties: {
    create: fn(),
    update: fn(),
    delete: fn(),
    getById: fn(),
    addPlayer: fn(),
    removePlayer: fn(),
  },
};

const meta = {
  title: "Pages/PartySelection",
  component: PartySelection,
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
    parties: [
      {
        name: "test adventure",
        id: 1,
        description: "lorem ipsum magic",
        icon: "🥳",
        players: [],
      },
    ],
    isLoading: false,
    onPartySelect: fn(),
  },
} satisfies Meta<typeof PartySelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
