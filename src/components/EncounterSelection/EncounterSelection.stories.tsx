import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EncounterSelection from "./EncounterSelection";
import db from "@/mocks/db";

const meta = {
  title: "Components/EncounterSelection",
  component: EncounterSelection,
  args: {
    open: true,
    // @ts-ignore
    database: db,
    chapterId: 1,
    encounter: {
      id: 1,
      name: "die notiz mit einem unendlichen langen namen",
      color: "#f44336",
      passed: false,
      experience: 120,
      images: null,
      description: "viele viele notizen",
      dice: null,
      difficulties: null,
      opponents: null,
      skill: null,
      type: "note",
      element: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        color: "#f44336",
        icon: "💅",
        name: "notiz",
      },
    },
    onExitComplete: fn(),
    onOpenChange: fn(),
    onCancel: fn(),
  },
  decorators: [
    (Story) => (
      <div className="relative h-full w-full overflow-hidden bg-slate-500">
        {Story()}
      </div>
    ),
  ],
} satisfies Meta<typeof EncounterSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
