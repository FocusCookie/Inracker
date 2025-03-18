import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import EffectCard from "./EffectCard";
import { Button } from "../ui/button";

const meta = {
  title: "Components/EffectCard",
  component: EffectCard,
  args: {
    effect: {
      description: "descriptive text",
      duration: 4,
      duration_type: "rounds",
      icon: "🎅",
      id: 1,
      name: "Santa Effect",
      type: "positive",
    },
  },
  decorators: [
    (Story) => (
      <div className="h-fit w-full rounded-md bg-white p-2">{Story()}</div>
    ),
  ],
} satisfies Meta<typeof EffectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};

export const NegativeEffect: Story = {
  args: {
    effect: {
      description: "descriptive text",
      duration: 4,
      duration_type: "rounds",
      icon: "👹",
      id: 1,
      name: "Satan Effect",
      type: "negative",
    },
  },
};

export const WithActions: Story = {
  args: { actions: <Button>Action</Button> },
};
