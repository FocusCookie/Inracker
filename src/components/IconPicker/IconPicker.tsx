import { useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";

type Props = {
  onIconClick: (icon: string) => void;
  initialIcon?: string;
  disabled: boolean;
};

function IconPicker({ initialIcon, disabled, onIconClick }: Props) {
  const [selectedIcon, setSelectedIcon] = useState(initialIcon || "🧙‍♂️");
  const [isOpen, setIsOpen] = useState(false);

  function handleEmojiSelect({ emoji }: { emoji: string }) {
    onIconClick(emoji);
    setSelectedIcon(emoji);
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className="w-full text-lg"
        >
          {selectedIcon}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={4}
        onWheel={(e) => e.stopPropagation()}
        className="w-fit p-0"
      >
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          className="h-[326px] border-none shadow-none"
        >
          <EmojiPickerSearch />
          <EmojiPickerContent />
        </EmojiPicker>
      </PopoverContent>
    </Popover>
  );
}

export default IconPicker;
