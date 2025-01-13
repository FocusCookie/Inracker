import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EffectsCatalog from "./EffectsCatalog";

const meta = {
  title: "Components/EffectsCatalog",
  component: EffectsCatalog,
  args: {
    onAddEffect: fn(),
    // @ts-expect-error
    query: {
      data: [
        {
          description: "description text",
          duration: 1,
          duration_type: "rounds",
          icon: "😎",
          id: 1,
          name: "sunglass filter",
          type: "positive",
        },
        {
          description: "description text",
          duration: 1,
          duration_type: "rounds",
          icon: "💩",
          id: 2,
          name: "bad sunglass filter",
          type: "negative",
        },
      ],
    },
    selection: [],
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
  // args: {},
};
