import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import EditEncounterDrawer from "./EditEncounterDrawer";

const meta = {
  title: "Components/EditEncounterDrawer",
  component: EditEncounterDrawer,
  args: {},
} satisfies Meta<typeof EditEncounterDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};