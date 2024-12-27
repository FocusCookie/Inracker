import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Collapsible from "./CreatePlayerDrawer";

const meta = {
  title: "Components/CreatePlayerDrawer",
  component: Collapsible,
  parameters: {},
  args: {
    onCreate: fn(),
    onOpenChange: fn(),
    onStorePlayerImage: fn(),
    isCreating: false,
    open: true,
    immunities: [
      {
        id: 1,
        description: `
    - 4 damage over time decreased
    - ignores water damage`,
        name: "Feuerimunität",
        icon: "🔥",
      },
      {
        id: 2,
        description: `
    - no **splash damage**,
    - ignores water damage`,
        name: "Water Splash ",
        icon: "🟢",
      },
      {
        id: 3,
        description: `
    - no **splash damage**,
    - ignores water damage`,
        name: "Water Splash ",
        icon: "🔴",
      },
      {
        id: 4,
        description: `
    - no **splash damage**,
    - ignores water damage`,
        name: "Water Splash ",
        icon: "🎅",
      },
      {
        id: 5,
        description: `
    - no **splash damage**,
    - ignores water damage`,
        name: "Water Splash ",
        icon: "💶",
      },
    ],
    isCreatingImmunity: false,
    onCreateImmunity: fn(),
  },
  decorators: [
    (Story) => (
      <div className="h-fit w-full rounded-md bg-white p-2">{Story()}</div>
    ),
  ],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    isCreatingImmunity: false,
  },
};
