import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Collapsible from "./ResistanceCatalog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DBImmunity } from "@/types/immunitiy";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, refetchOnMount: true } },
});

const meta = {
  title: "Components/ResistanceCatalog",
  component: Collapsible,
  parameters: {},
  args: {
    onAddResistance: fn(),
    //@ts-expect-error
    query: {
      data: [
        { description: "description", icon: "🔥", id: 1, name: "fire" },
        { description: "description", icon: "💧", id: 2, name: "water" },
      ],
    },
    selection: [],
  },
  decorators: [
    (Story) => (
      <div className="h-fit w-full rounded-md bg-white p-2">{Story()}</div>
    ),
    (Story) => {
      queryClient.setQueryData(["resistances"], {
        description: "some resistance description",
        icon: "🔥",
        id: 1,
        name: "Fire Resistance",
      } as DBImmunity);
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // args: {
  // },
};

export const Loading: Story = {
  args: {
    // @ts-expect-error
    query: { isLoading: true },
  },
};

export const WithSelection: Story = {
  args: {
    selection: [
      { description: "description", icon: "🔥", id: 1, name: "fire" },
    ],
  },
};
