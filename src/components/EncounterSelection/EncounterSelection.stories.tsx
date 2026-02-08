import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EncounterSelection from "./EncounterSelection";
import db from "@/mocks/db";
import { Encounter, EncounterDifficulty } from "@/types/encounter";

const difficulties: EncounterDifficulty[] = [
  {
    description:
      "Failed - broken leg - super long text to see hoe it looks like and even longer to see another break in the text maklsdjflkajeföwj klefja lkwejflk aöwjefl kj awölefj ",
    value: 10,
  },

  {
    description: "Passed",
    value: 15,
  },
  {
    description: "Crititcal Success - jumpen higher",
    value: 20,
  },
];

const encounter: Encounter = {
  id: 1,
  name: "ein langer titel zum testen ",
  color: "#f44336",
  passed: false,
  experience: 120,
  images: null,
  description: `### some thing!
- first thing
- second
`,
  dice: 20,
  difficulties,
  opponents: [1, 2],
  skill: "athletic",
  type: "note",
  completed: false,
  soundcloud: null,
  musicFile: null,
  music_file: null,
  element: {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    color: "#f44336",
    icon: "💅",
    name: "notiz",
  },
};

const meta = {
  title: "Components/EncounterSelection",
  component: EncounterSelection,
  args: {
    open: true,
    // @ts-ignore
    database: db,
    chapterId: 1,
    encounterId: encounter.id,
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

export const Note: Story = {
  // args: {},
};

export const Roll: Story = {
  args: {
    encounterId: 2,
  },
};

export const Fight: Story = {
  args: {
    encounterId: 3,
  },
};
