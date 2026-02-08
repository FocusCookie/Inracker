import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import CreateChapterDrawer from "./CreateChapterDrawer";

const meta = {
  title: "Components/CreateChapterDrawer",
  component: CreateChapterDrawer,
  args: {
    open: true,
    onCreate: fn(),
    onOpenChange: fn(),
    partyId: 1,
    onComplete: fn(),
    onExitComplete: fn(),
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

export const Primary: Story = {};
