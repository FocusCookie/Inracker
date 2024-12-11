import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import ResistanceCard from "./ResistanceCard";

const meta = {
  title: "Components/ResistanceCard",
  component: ResistanceCard,
  parameters: {},
  args: {
    resistances: [
      {
        description: `
* super unhealthy
* to undeads
      `,
        icon: "🧛‍♀️",
        id: 1,
        name: "The unholy",
      },
      {
        description: `
# hello world
another test
> qoute
      `,
        icon: "🎱",
        id: 2,
        name: "Crit when rolling an eight!",
      },
    ],
  },
  decorators: [(Story) => <div className="w-full bg-white p-4">{Story()}</div>],
} satisfies Meta<typeof ResistanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
