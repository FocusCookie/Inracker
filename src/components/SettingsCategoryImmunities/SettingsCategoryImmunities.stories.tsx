import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import mockDb from "@/mocks/db";

import SettingsCategoryImmunities from "./SettingsCategoryImmunities";

const queryClient = new QueryClient();

const meta = {
  title: "Components/SettingsCategoryImmunities",
  component: SettingsCategoryImmunities,
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
} satisfies Meta<typeof SettingsCategoryImmunities>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    database: mockDb,
  },
};
