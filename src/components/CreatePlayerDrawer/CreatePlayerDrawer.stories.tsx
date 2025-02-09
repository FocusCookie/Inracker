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
    isCreating: false,
    open: true,
    isStoringImage: false,
    onStoringImage: fn(),
    renderImmunitiesCatalog: () => <p>Immunities Renderer</p>,
    renderResistancesCatalog: () => <p>Resistances Renderer</p>,
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
  args: {},
};
