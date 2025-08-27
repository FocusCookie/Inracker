import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SettingsDrawer from "./SettingsDrawer";
import { SidebarProvider } from "../ui/sidebar";

const meta = {
  title: "Components/SettingsDrawer",
  component: SettingsDrawer,
  args: { open: true, onOpenChange: fn(), onExitComplete: fn() },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="h-full w-full bg-white">{Story()}</div>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof SettingsDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
