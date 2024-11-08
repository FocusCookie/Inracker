import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  SkinTonePickerLocation,
} from "emoji-picker-react";
import { useState } from "react";
import { Button } from "../ui/button";

type Props = {
  onIconClick: (icon: string) => void;
  initialIcon?: string;
};

function IconPicker({ initialIcon, onIconClick }: Props) {
  const [selectedIcon, setSelectedIcon] = useState(initialIcon || "🧙‍♂️");
  const [isOpen, setIsOpen] = useState(false);

  function handleEmojiClick(emojiData: EmojiClickData) {
    onIconClick(emojiData.emoji);
    setSelectedIcon(emojiData.emoji);
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={() => setIsOpen((c) => !c)}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
          {selectedIcon}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-fit border-0 p-0">
        <EmojiPicker
          className="absolute left-0 top-0"
          onEmojiClick={handleEmojiClick}
          emojiStyle={EmojiStyle.NATIVE}
          skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
        />
      </PopoverContent>
    </Popover>
  );
}

export default IconPicker;
