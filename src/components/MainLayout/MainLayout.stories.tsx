import type { Meta, StoryObj } from "@storybook/react";
import MainLayout from "./MainLayout";

const meta = {
  title: "Layout/MainLayout",
  component: MainLayout,
  parameters: {},
  args: {
    isAsideOpen: false,
    children: <div>chapters</div>,
    fullContent: false,
  },
  render: ({ children, ...props }) => (
    <MainLayout {...props}>
      <MainLayout.Players>
        <div>
          <p className="py-64">player 1</p>
          <p className="py-64">player 2</p>
          <p className="py-64">player 3</p>
          <p className="py-64">player 4</p>
        </div>
      </MainLayout.Players>

      <MainLayout.Settings>
        <div>settings</div>
      </MainLayout.Settings>
      {children}
    </MainLayout>
  ),
} satisfies Meta<typeof MainLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
