import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import CombatControls from "./CombatControls";

const meta = {
  title: "Components/CombatControls",
  component: CombatControls,
  args: {
    round: 2,
    time: 12,
    onFinish: fn(),
    onInitiative: fn(),
    onNext: fn(),
  },
} satisfies Meta<typeof CombatControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    round: 3,
  },
};
