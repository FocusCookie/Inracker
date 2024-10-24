import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import testBackground from "./test_assets/HB_Festplatz.jpg";

import Canvas from "./Canvas";

const background = new Image();
background.src = testBackground;

const meta = {
  title: "Example/Canvas",
  component: Canvas,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="h-[90vh] w-[90vw] bg-neutral-800 p-8">{Story()}</div>
    ),
  ],
  // args: { onClick: fn() },
  args: {
    background,
    elements: [],
    onElementClick: fn(),
    onDrawed: fn(),
  },
} satisfies Meta<typeof Canvas>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  // args: {},
};

export const WithBackground: Story = {
  args: {
    background,
  },
};

export const WithBackgroundAndElements: Story = {
  args: {
    background,
    elements: [
      {
        id: "1",
        type: "rect",
        height: 200,
        width: 200,
        x: 100,
        y: 100,
        color: "red",
      },
      {
        id: "2",
        type: "rect",
        height: 250,
        width: 250,
        x: 200,
        y: 200,
        color: "pink",
      },
      {
        id: "3",
        type: "rect",
        height: 100,
        width: 100,
        x: 400,
        y: 400,
        color: "green",
      },
    ],
  },
};
