import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ChapterCard from "./ChapterCard";

const meta = {
  title: "Components/ChapterCard",
  component: ChapterCard,
  parameters: {
    layout: "centered",
  },
  args: {
    onEdit: fn(),
    chapter: {
      image: null,
      battlemap: null,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa sequi, minus iure quidem temporibus saepe fugit dolore? Quaerat repudiandae culpa eius, sint voluptatum laudantium voluptas quod ratione sapiente, laboriosam hic! Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa sequi, minus iure quidem temporibus saepe fugit dolore? Quaerat repudiandae culpa eius, sint voluptatum laudantium voluptas quod ratione sapiente, laboriosam hic!",
      encounters: null,
      experience: 200,
      icon: "⚔️",
      id: 1,
      name: "1. a name of the chapter",
      state: "draft",
      tokens: null,
    },
    onPushDown: fn(),
    onPushUp: fn(),
  },
  decorators: [(Story) => <div className="bg-white p-4">{Story()}</div>],
} satisfies Meta<typeof ChapterCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  // args: {},
};
