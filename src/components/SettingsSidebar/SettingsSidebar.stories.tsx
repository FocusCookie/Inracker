import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SettingsSidebar from "./SettingsSidebar";
import { SidebarProvider } from "../ui/sidebar";

const meta = {
  title: "Components/SettingsSidebar",
  component: SettingsSidebar,
  args: {
    onClose: fn(),
    onSelect: fn(),
    activeItem: "general",
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="h-full w-full bg-white">{Story()}</div>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof SettingsSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
