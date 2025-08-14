import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ChapterCard from "./ChapterCard";
import { Chapter } from "@/types/chapters";

const CHAPTER: Chapter = {
  battlemap:
    "https://i.etsystatic.com/18388031/r/il/8b7a49/2796267092/il_fullxfull.2796267092_aezx.jpg",
  description:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa sequi, minus iure quidem temporibus saepe fugit dolore? Quaerat repudiandae culpa eius, sint voluptatum laudantium voluptas quod ratione sapiente, laboriosam hic! Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa sequi, minus iure quidem temporibus saepe fugit dolore? Quaerat repudiandae culpa eius, sint voluptatum laudantium voluptas quod ratione sapiente, laboriosam hic!",
  encounters: [],
  icon: "⚔️",
  id: 1,
  name: "a name of the chapter",
  state: "draft",
  party: 1,
};

const meta = {
  title: "Components/ChapterCard",
  component: ChapterCard,
  parameters: {
    layout: "centered",
  },
  args: {
    onEdit: fn(),
    onPlay: fn(),
  },
  decorators: [(Story) => <div className="bg-white p-4">{Story()}</div>],
} satisfies Meta<typeof ChapterCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    chapter: CHAPTER,
  },
};

export const NoDescription: Story = {
  args: {
    chapter: { ...CHAPTER, description: null },
  },
};
