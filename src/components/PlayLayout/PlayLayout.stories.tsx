import type { Meta, StoryObj } from "@storybook/react";
import PlayLayout from "./PlayLayout";

const meta = {
  title: "Layout/PlayLayout",
  component: PlayLayout,
  parameters: {},
  args: {
    isAsideOpen: false,
    isEncounterOpen: false,
    children: <div>chapters</div>,
  },
  render: ({ children, ...props }) => (
    <PlayLayout {...props}>
      <PlayLayout.Players>
        <div>
          <p className="py-64">player 1</p>
          <p className="py-64">player 2</p>
          <p className="py-64">player 3</p>
          <p className="py-64">player 4</p>
        </div>
      </PlayLayout.Players>

      <PlayLayout.Settings>
        <div>settings</div>
      </PlayLayout.Settings>

      <PlayLayout.Settings>
        <div>encounter</div>
      </PlayLayout.Settings>

      {children}
    </PlayLayout>
  ),
} satisfies Meta<typeof PlayLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
