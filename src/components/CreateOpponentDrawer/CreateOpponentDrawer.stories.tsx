import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { useCreateOpponent } from "@/hooks/useCreateOpponent";
import CreateOpponentDrawer from "./CreateOpponentDrawer";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";

// Dummy data for immunities and resistances
const dummyImmunities: DBImmunity[] = [
  { id: 1, name: "Fire", icon: "🔥", description: "Immune to fire damage" },
  { id: 2, name: "Cold", icon: "❄", description: "Immune to cold damage" },
];
const dummyResistances: DBResistance[] = [
  { id: 1, name: "Poison", icon: "🤮", description: "Resistant to poison" },
  {
    id: 2,
    name: "Lightning",
    icon: "⚡️",
    description: "Resistant to lightning",
  },
];

const meta = {
  title: "Components/CreateOpponentDrawer",
  component: CreateOpponentDrawer,
  decorators: [
    (Story) => <div className="h-screen bg-gray-50 p-6">{Story()}</div>,
  ],
  args: {
    open: true,
    loading: false,
    immunities: dummyImmunities,
    resistances: dummyResistances,
    onOpenChange: action("onOpenChange"),
    onCreate: action("onCreate"),
    onOpenImmunityCatalog: action("onOpenImmunityCatalog"),
    onOpenResistanceCatalog: action("onOpenResistanceCatalog"),
    onCreateImmunity: action("onCreateImmunity"),
    onCreateResistance: action("onCreateResistance"),
    form: {} as any, // placeholder, will be injected in render
  },
} satisfies Meta<typeof CreateOpponentDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: meta.args!,
  render: (args) => {
    // Inject the real form hook
    const form = useCreateOpponent();
    return <CreateOpponentDrawer {...args} form={form} />;
  },
};
