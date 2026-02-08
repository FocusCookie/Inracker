import type { Meta, StoryObj } from "@storybook/react";
import mockDb from "@/mocks/db";
// import { fn } from "@storybook/test";

import SettingsCategoryPlayers from "./SettingsCategoryPlayers";

const meta = {
  title: "Components/SettingsCategoryPlayers",
  component: SettingsCategoryPlayers,
  decorators: [
    (Story) => (
      <div className="h-full w-full bg-white p-4">
        <Story />
      </div>
    ),
  ],
  args: {},
} satisfies Meta<typeof SettingsCategoryPlayers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    database: mockDb as any,
  },
};
