import type { Meta, StoryObj } from "@storybook/react";
import CreateOpponentForm from "./CreateOpponentForm";
import { useCreateOpponent } from "@/hooks/useCreateOpponent";

const meta = {
  title: "Components/CreateOpponentForm",
  component: CreateOpponentForm,
  args: {
    disabled: false,
    // we need placeholders here just to satisfy TS; they'll get overridden in render
    form: {} as any,
    children: (
      <>
        <CreateOpponentForm.Immunities>
          immunities
        </CreateOpponentForm.Immunities>
        <CreateOpponentForm.Resistances>
          resistances
        </CreateOpponentForm.Resistances>
      </>
    ),
  },
  decorators: [(Story) => <div className="bg-white">{Story()}</div>],
} satisfies Meta<typeof CreateOpponentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  // required by StoryObj
  args: meta.args!,
  render: (args) => {
    // now we inject the real hook & real children
    const form = useCreateOpponent();
    return (
      <CreateOpponentForm disabled={args.disabled} form={form}>
        <CreateOpponentForm.Immunities>
          immunities
        </CreateOpponentForm.Immunities>
        <CreateOpponentForm.Resistances>
          resitances
        </CreateOpponentForm.Resistances>
      </CreateOpponentForm>
    );
  },
};
