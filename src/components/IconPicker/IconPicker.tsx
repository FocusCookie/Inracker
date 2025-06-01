import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  SkinTonePickerLocation,
} from "emoji-picker-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";

type Props = {
  onIconClick: (icon: string) => void;
  initialIcon?: string;
  disabled: boolean;
};

function IconPicker({ initialIcon, disabled, onIconClick }: Props) {
  const [selectedIcon, setSelectedIcon] = useState(initialIcon || "🧙‍♂️");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.addEventListener("keydown", closeOnEscDown);

    return () => {
      window.removeEventListener("keydown", closeOnEscDown);
    };
  }, []);

  function handleEmojiClick(emojiData: EmojiClickData) {
    onIconClick(emojiData.emoji);
    setSelectedIcon(emojiData.emoji);
    setIsOpen(false);
  }

  function closeOnEscDown(event: KeyboardEvent) {
    if (isOpen && event.code === "Space") {
      setIsOpen(false);
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button disabled={disabled} variant="outline" className="w-full">
          {selectedIcon}
        </Button>
      </PopoverTrigger>

      <PopoverContent>
        <EmojiPicker
          key="picker"
          lazyLoadEmojis
          open={isOpen}
          onEmojiClick={handleEmojiClick}
          emojiStyle={EmojiStyle.NATIVE}
          skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
        />
      </PopoverContent>
    </Popover>
  );
}

export default IconPicker;
