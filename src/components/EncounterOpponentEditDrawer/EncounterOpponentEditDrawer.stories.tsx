import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import EncounterOpponentEditDrawer from "./EncounterOpponentEditDrawer";

const meta = {
  title: "Components/EncounterOpponentEditDrawer",
  component: EncounterOpponentEditDrawer,
  args: {},
} satisfies Meta<typeof EncounterOpponentEditDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};