import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import "emoji-mart";
import { useState } from "react";
import { Button } from "../ui/button";
import * as PopoverPrimitive from "@radix-ui/react-popover";

type Props = {
  onIconClick: (icon: string) => void;
  initialIcon?: string;
  disabled: boolean;
};

function IconPicker({ initialIcon, disabled, onIconClick }: Props) {
  const [selectedIcon, setSelectedIcon] = useState(initialIcon || "🧙‍♂️");
  const [isOpen, setIsOpen] = useState(false);

  function handleEmojiSelect(emojiData: any) {
    const emoji = emojiData.native;
    onIconClick(emoji);
    setSelectedIcon(emoji);
    setIsOpen(false);
  }

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className="w-full text-lg"
        >
          {selectedIcon}
        </Button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="right"
          align="start"
          sideOffset={4}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="rounded-lg border bg-white shadow-xl">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              autoFocus={true}
              set="native"
            />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export default IconPicker;
