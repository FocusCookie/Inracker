import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";

import ChapterLayout from "./ChapterLayout";

const meta = {
  title: "Layout/ChapterLayout",
  component: ChapterLayout,
  parameters: {},
  args: {
    players: (
      <>
        <p>
          Loremmmmaklsjfwjelfkjwlekjfölakwjeglökjeölrkgjlökej33rglökejröglkjseölrjglöek
          ipsum dolor sit amet consectetur, adipisicing elit. Eos, incidunt
          laudantium! Sed, maxime! Dolorum reprehenderit optio esse omnis labore
          modi debitis laudantium, velit obcaecati minus delectus ipsa qui,
          veritatis aliquam!
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos,
          incidunt laudantium! Sed, maxime! Dolorum reprehenderit optio esse
          omnis labore modi debitis laudantium, velit obcaecati minus delectus
          ipsa qui, veritatis aliquam!
        </p>{" "}
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos,
          incidunt laudantium! Sed, maxime! Dolorum reprehenderit optio esse
          omnis labore modi debitis laudantium, velit obcaecati minus delectus
          ipsa qui, veritatis aliquam!
        </p>{" "}
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos,
          incidunt laudantium! Sed, maxime! Dolorum reprehenderit optio esse
          omnis labore modi debitis laudantium, velit obcaecati minus delectus
          ipsa qui, veritatis aliquam!
        </p>{" "}
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos,
          incidunt laudantium! Sed, maxime! Dolorum reprehenderit optio esse
          omnis labore modi debitis laudantium, velit obcaecati minus delectus
          ipsa qui, veritatis aliquam!
        </p>{" "}
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos,
          incidunt laudantium! Sed, maxime! Dolorum reprehenderit optio esse
          omnis labore modi debitis laudantium, velit obcaecati minus delectus
          ipsa qui, veritatis aliquam!
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos,
          incidunt laudantium! Sed, maxime! Dolorum reprehenderit optio esse
          omnis labore modi debitis laudantium, velit obcaecati minus delectus
          ipsa qui, veritatis aliquam!
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos,
          incidunt laudantium! Sed, maxime! Dolorum reprehenderit optio esse
          omnis labore modi debitis laudantium, velit obcaecati minus delectus
          ipsa qui, veritatis aliquam!
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos,
          incidunt laudantium! Sed, maxime! Dolorum reprehenderit optio esse
          omnis labore modi debitis laudantium, velit obcaecati minus delectus
          ipsa qui, veritatis aliquam!
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos,
          incidunt laudantium! Sed, maxime! Dolorum reprehenderit optio esse
          omnis labore modi debitis laudantium, velit obcaecati minus delectus
          ipsa qui, veritatis aliquam!
        </p>
      </>
    ),

    settings: "settings",
    children: "chapters",
    isAsideOpen: false,
    drawers: <div className="drawers"></div>,
  },
} satisfies Meta<typeof ChapterLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
