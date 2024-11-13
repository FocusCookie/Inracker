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
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import * as Dialog from "@radix-ui/react-dialog";

type Props = {
  onIconClick: (icon: string) => void;
  initialIcon?: string;
  disabled: boolean;
};

function IconPicker({ initialIcon, disabled, onIconClick }: Props) {
  const [selectedIcon, setSelectedIcon] = useState(initialIcon || "🧙‍♂️");
  const [isOpen, setIsOpen] = useState(false);

  function handleEmojiClick(emojiData: EmojiClickData) {
    onIconClick(emojiData.emoji);
    setSelectedIcon(emojiData.emoji);
    setIsOpen(false);
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.DialogTrigger asChild>
        <Button disabled={disabled} variant="outline" className="w-full">
          {selectedIcon}
        </Button>
      </Dialog.DialogTrigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80" />

        <Dialog.Content className="fixed left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2 border-0 p-0 shadow-md">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            emojiStyle={EmojiStyle.NATIVE}
            skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default IconPicker;
