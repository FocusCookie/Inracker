import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import EditPlayerDrawer from "./EditPlayerDrawer";
import { Player } from "@/types/player";

const player: Player = {
  details:
    "A skilled warrior from the northern kingdoms, trained in both sword and bow",
  ep: 450,
  health: 85,
  image:
    "https://cdn-images.dzcdn.net/images/artist/77220ccb5a36d0e5df2c9e47f2c89de4/500x500-000000-80-0-0.jpg",
  icon: "⚔️",
  id: 1,
  level: 7,
  max_health: 100,
  name: "Thorgar the Brave",
  overview:
    "Frontline warrior specializing in close combat and defensive tactics",
  role: "Tank",
  effects: [],
  immunities: [],
  resistances: [],
};

const meta = {
  title: "Components/EditPlayerDrawer",
  component: EditPlayerDrawer,
  args: {
    player,
    open: true,
    isUpdating: false,
    isStoringImage: false,
    onUpdate: () => {},
    onStoringImage: () => Promise.resolve(null),
    onOpenChange: () => {},
  },
} satisfies Meta<typeof EditPlayerDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
