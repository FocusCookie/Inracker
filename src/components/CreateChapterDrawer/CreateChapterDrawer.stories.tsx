import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import CreateChapterDrawer from "./CreateChapterDrawer";
import { FormProvider, useForm } from "react-hook-form";

const meta = {
  title: "Components/CreateChapterDrawer",
  component: CreateChapterDrawer,
  args: {
    open: true,
    isCreating: false,
    onCreate: fn(),
    onOpenChange: fn(),
  },
  //TODO: Use this in other drawers as well
  // decorators: [
  //   (Story) => (
  //     <FormProvider {...useForm()}>
  //       <Story />
  //     </FormProvider>
  //   ),
  // ],
} satisfies Meta<typeof CreateChapterDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {},
};
