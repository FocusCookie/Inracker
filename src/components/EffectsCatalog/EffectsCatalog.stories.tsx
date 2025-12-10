import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EffectsCatalog from "./EffectsCatalog";

const mockDatabase = {
  effects: {
    getAll: fn(() => [
      {
        description: "descriptive text",
        duration: 4,
        duration_type: "rounds",
        icon: "🎅",
        id: 1,
        name: "Santa Effect",
        type: "positive",
        value: 1,
      },
      {
        description: "descriptive text",
        duration: 4,
        duration_type: "rounds",
        icon: "👹",
        id: 2,
        name: "Satan Effect",
        type: "negative",
        value: 1,
      },
    ]),
    create: fn(),
  },
};

const meta = {
  title: "Components/EffectsCatalog",
  component: EffectsCatalog,
  args: {
    // @ts-ignore
    database: mockDatabase,
    open: true,
    onOpenChange: fn(),
    onAdd: fn(),
    onExitComplete: fn(),
    onCancel: fn(),
    onSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div className="h-fit w-full rounded-md bg-white p-2">{Story()}</div>
    ),
  ],
} satisfies Meta<typeof EffectsCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
