import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EditEncounterDrawer from "./EditEncounterDrawer";

const meta = {
  title: "Components/EditEncounterDrawer",
  component: EditEncounterDrawer,
  args: {
    encounter: {
      id: 1,
      name: "Encounter Name",
      description: "Encounter Description",
      type: "fight",
      color: "#ff0000",
      experience: 100,
      images: [],
      dice: 20,
      skill: "Athletics",
      difficulties: [],
      opponents: [],
      passed: false,
      completed: false,
      soundcloud: null,
      musicFile: null,
      music_file: null,
      element: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        color: "#ff0000",
        icon: "⚔️",
      },
    },
    open: true,
    onOpenChange: fn(),
    onExitComplete: fn(),
    onComplete: fn(),
    onCancel: fn(),
    onDelete: fn(),
    onEdit: fn(),
  },
} satisfies Meta<typeof EditEncounterDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};