import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import mockDb from "@/mocks/db";

import SettingsCategoryEffects from "./SettingsCategoryEffects";

const queryClient = new QueryClient();

const meta = {
  title: "Components/SettingsCategoryEffects",
  component: SettingsCategoryEffects,
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
} satisfies Meta<typeof SettingsCategoryEffects>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    database: mockDb,
  },
};
