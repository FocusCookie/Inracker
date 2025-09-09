import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import mockDb from "@/mocks/db";

import SettingsDrawer from "./SettingsDrawer";
import { SidebarProvider } from "../ui/sidebar";

const queryClient = new QueryClient();

const meta = {
  title: "Components/SettingsDrawer",
  component: SettingsDrawer,
  args: { open: true, onOpenChange: fn(), onExitComplete: fn() },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <div className="h-full w-full bg-white">{Story()}</div>
        </SidebarProvider>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof SettingsDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    database: mockDb,
  },
};
