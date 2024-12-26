import type { Meta, StoryFn, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import testBackground from "./test_assets/HB_Festplatz.jpg";
import player1 from "./test_assets/player_1.webp";
import player2 from "./test_assets/player_2.webp";
import player3 from "./test_assets/player_3.webp";
import player4 from "./test_assets/player_4.webp";

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
    (Story: StoryFn) => (
      <div className="h-[90vh] w-[90vw] bg-neutral-800 p-8">{Story()}</div>
    ),
  ],
  // args: { onClick: fn() },
  args: {
    background,
    elements: [],
    players: [
      {
        buffs: [],
        debuffs: [],
        coordinates: { x: 0, y: 0 },
        health: 12,
        id: 1,
        img: player1,
        name: "Tanatar",
      },
      {
        buffs: [],
        debuffs: [],
        coordinates: { x: 100, y: 0 },
        health: 10,
        id: 2,
        img: player2,
        name: "Flitzi",
      },
      {
        buffs: [],
        debuffs: [],
        coordinates: { x: 200, y: 0 },
        health: 11,
        id: 3,
        img: player3,
        name: "Calian",
      },
      {
        buffs: [],
        debuffs: [],
        coordinates: { x: 300, y: 0 },
        health: 20,
        id: 4,
        img: player4,
        name: "Tebag",
      },
    ],
    selectedPlayer: null,
    onElementClick: fn(),
    onDrawed: fn(),
    onPlayerMove: fn(),
    onPlayerSelect: fn(),
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
        title: "red",
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
        title: "pink",
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
        title: "green",
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
    background,
    elements: [
      {
        id: "1",
        title: "red",
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
        title: "pink",
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
        title: "green",
        icon: "🍓",
        onClick: fn(),
        height: 100,
        width: 100,
        x: 400,
        y: 400,
        color: "0, 255, 0",
      },
    ],
    selectedPlayer: {
      buffs: [],
      debuffs: [],
      coordinates: { x: 300, y: 0 },
      health: 20,
      id: 4,
      img: player4,
      name: "Tebag",
    },
  },
};
