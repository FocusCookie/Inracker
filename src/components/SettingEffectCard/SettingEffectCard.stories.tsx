import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SettingEffectCard from "./SettingEffectCard";

const meta = {
  title: "Components/SettingEffectCard",
  component: SettingEffectCard,
  args: {
    effect: {
      id: 1,
      name: "Test Effect",
      description: "This is a test effect.",
      icon: "✨",
      type: "positive",
      duration: 5,
      durationType: "rounds",
      value: 10,
    },
    onDelete: fn(),
    onEdit: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-white p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingEffectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
