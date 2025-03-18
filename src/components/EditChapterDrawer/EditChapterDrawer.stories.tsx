import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EditChapterDrawer from "./EditChapterDrawer";

const meta = {
  title: "Components/EditChapterDrawer",
  component: EditChapterDrawer,
  args: {
    chapter: {
      battlemap: "",
      description: "description",
      encounters: [],
      icon: "🚨",
      id: 1,
      name: "name",
      party: 1,
      state: "draft",
      tokens: [],
    },
    loading: false,
    onOpenChange: fn(),
    onSave: fn(),
    open: true,
  },
} satisfies Meta<typeof EditChapterDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
