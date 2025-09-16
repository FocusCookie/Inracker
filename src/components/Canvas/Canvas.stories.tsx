import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import testBackground from "./test_assets/HB_Festplatz.jpg";
import player1 from "./test_assets/player_1.webp";

import Canvas from "./Canvas";

const background = new Image();
background.src = testBackground;

const meta = {
  title: "Components/Canvas",
  component: Canvas,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: any) => (
      <div className="h-[90vh] w-[90vw] bg-neutral-800 p-8">{Story()}</div>
    ),
  ],
  args: {
    background:
      "http://localhost:6006/src/components/Canvas/test_assets/HB_Festplatz.jpg",
    elements: [],
    temporaryElement: undefined,
    players: [
      {
        id: 1,
        role: "mage",
        details: "Hex hex!",
        effects: [],
        icon: "🧙",
        ep: 234,
        health: 23,
        level: 4,
        immunities: [],
        name: "H. Potter",
        resistances: [
          {
            id: 1,
            name: "resistance xyz",
            icon: "🚨",
            description: "# Resistance markdown",
          },
        ],
        image: player1,
        max_health: 10,
        overview: "overview",
      },
    ],
    opponents: [],
    selectedToken: null,
    tokens: [
      {
        coordinates: { x: 1, y: 1 },
        id: 1,
        entity: 1,
        chapter: 1,
        type: "player",
      },
    ],
    onDrawed: fn(),
    onElementMove: fn(),
    onTokenSelect: fn(),
    onTokenMove: fn(),
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
    background: testBackground,
  },
};

export const WithBackgroundAndElements: Story = {
  args: {
    background: testBackground,
    elements: [
      {
        id: "1",
        icon: "🥦",
        onClick: fn(),
        height: 300,
        width: 300,
        x: 0,
        y: 0,
        color: "255, 0, 0",
      },
      {
        id: "2",
        icon: "📞",
        onClick: fn(),
        height: 250,
        width: 250,
        x: 200,
        y: 200,
        color: "255, 100, 255",
      },
      {
        id: "3",
        icon: "🍓",
        onClick: fn(),
        height: 100,
        width: 100,
        x: 400,
        y: 400,
        color: "0, 255, 0",
      },
    ],
  },
};

export const WithSelectedPlayer: Story = {
  args: {
    background: testBackground,
    elements: [
      {
        id: "1",
        icon: "🥦",
        onClick: fn(),
        height: 300,
        width: 300,
        x: 0,
        y: 0,
        color: "255, 0, 0",
      },
      {
        id: "2",
        icon: "📞",
        onClick: fn(),
        height: 250,
        width: 250,
        x: 200,
        y: 200,
        color: "255, 100, 255",
      },
      {
        id: "3",
        icon: "🍓",
        onClick: fn(),
        height: 100,
        width: 100,
        x: 400,
        y: 400,
        color: "0, 255, 0",
      },
    ],
  },
};
