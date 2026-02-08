import type { Meta, StoryObj } from "@storybook/react";
import { db } from "@/mocks/db";

import SettingsCategoryOpponents from "./SettingsCategoryOpponents";

const meta = {
  title: "Components/SettingsCategoryOpponents",
  component: SettingsCategoryOpponents,
  args: {
    database: db as any,
  },
} satisfies Meta<typeof SettingsCategoryOpponents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};