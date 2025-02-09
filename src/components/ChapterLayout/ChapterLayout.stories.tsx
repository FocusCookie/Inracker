import type { Meta, StoryObj } from "@storybook/react";
import ChapterLayout from "./ChapterLayout";

const meta = {
  title: "Layout/ChapterLayout",
  component: ChapterLayout,
  parameters: {},
  args: {
    isAsideOpen: false,
    children: <div>chapters</div>,
  },
  render: ({ children, ...props }) => (
    <ChapterLayout {...props}>
      <ChapterLayout.Players>
        <div>
          <p className="py-64">player 1</p>
          <p className="py-64">player 2</p>
          <p className="py-64">player 3</p>
          <p className="py-64">player 4</p>
        </div>
      </ChapterLayout.Players>

      <ChapterLayout.Settings>
        <div>settings</div>
      </ChapterLayout.Settings>
      {children}
    </ChapterLayout>
  ),
} satisfies Meta<typeof ChapterLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
