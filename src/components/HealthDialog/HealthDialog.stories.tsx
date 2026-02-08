import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import HealthDialog from "./HealthDialog";

const meta = {
  title: "Components/HealthDialog",
  component: HealthDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    currentHealth: 10,
    maxHealth: 20,
    entityName: "Test Entity",
    type: "damage",
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof HealthDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};