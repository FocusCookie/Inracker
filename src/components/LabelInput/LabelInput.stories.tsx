import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import LabelsInput from "./LabelInput";

const meta = {
  title: "Components/LabelsInput",
  component: LabelsInput,
  args: {
    control: {} as any,
    name: "labels",
    label: "Labels",
    disabled: false,
  },
  decorators: [(Story) => <div className="bg-white p-4">{Story()}</div>],
} satisfies Meta<typeof LabelsInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: meta.args!,
  render: (args) => {
    const form = useForm<{ labels: string[] }>({
      defaultValues: { labels: ["first", "sec", "thirdl"] },
    });

    return (
      <div className="bg-white p-4">
        <form onSubmit={form.handleSubmit((data) => console.log(data))}>
          <LabelsInput
            control={form.control}
            name={args.name}
            label={args.label}
            disabled={args.disabled}
          />
        </form>
      </div>
    );
  },
};
