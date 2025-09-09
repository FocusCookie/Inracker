import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import mockDb from "@/mocks/db";

import SettingsCategoryResistances from "./SettingsCategoryResistances";

const queryClient = new QueryClient();

const meta = {
  title: "Components/SettingsCategoryResistances",
  component: SettingsCategoryResistances,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="h-full w-full bg-white p-4">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {},
} satisfies Meta<typeof SettingsCategoryResistances>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    database: mockDb,
  },
};