import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import HealthDialog from "./HealthDialog";

const meta = {
  title: "Components/HealthDialog",
  component: HealthDialog,
  args: {},
} satisfies Meta<typeof HealthDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};