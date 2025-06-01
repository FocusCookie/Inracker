import React, { useRef } from "react";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { Button } from "../ui/button";
import { TrashIcon } from "@radix-ui/react-icons";

type LabelsInputProps = {
  /** react-hook-form control object */
  control: Control<any>;
  /** Field array name in the form, e.g. 'labels' */
  name: string;
  /** Label text for the input */
  label?: string;
  /** Disable adding/removing labels */
  disabled?: boolean;
  placeholder?: string;
};

/**
 * A controlled component for editing an array of string labels using react-hook-form's useFieldArray.
 * Press Enter in the input to add a new label (lowercased), click the trash icon to remove.
 */
export default function LabelsInput({
  control,
  name,
  label = "Labels",
  disabled = false,
  placeholder = "Add a label and press Enter to add...",
}: LabelsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Manage the array of labels under the given field name
  const { fields, append, remove } = useFieldArray({ control, name });

  // Watch the current values of the labels array
  const labels = useWatch({ control, name }) as string[];

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && inputRef.current) {
      event.preventDefault(); // prevent form submission
      const value = inputRef.current.value.trim().toLowerCase();
      if (value && !labels.includes(value)) {
        append(value);
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium" htmlFor={`${name}-input`}>
          {label}
        </label>
      )}

      <input
        id={`${name}-input`}
        ref={inputRef}
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        className="border-input placeholder:text-muted-foreground focus:ring-ring focus-visible:ring-ring h-9 w-full rounded-md border bg-transparent px-3 text-base shadow-xs transition-colors file:border-0 focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
      />

      <div className="flex flex-wrap gap-2">
        {fields.map((field, index) => (
          <Button
            size="sm"
            variant="secondary"
            key={field.id}
            className="flex items-center gap-1 lowercase"
            onClick={() => remove(index)}
            disabled={disabled}
          >
            <span className="font-bold uppercase">{labels[index]}</span>
            <TrashIcon />
          </Button>
        ))}
      </div>
    </div>
  );
}
