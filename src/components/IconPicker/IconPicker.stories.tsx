import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import IconPicker from "./IconPicker";

const meta = {
  title: "Components/IconPicker",
  component: IconPicker,
  args: { onIconClick: fn(), disabled: false, initialIcon: "👨‍🎨" },
} satisfies Meta<typeof IconPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};

export const WithInitialIcon: Story = {
  args: { initialIcon: "🎱" },
};
