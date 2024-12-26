import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  SkinTonePickerLocation,
} from "emoji-picker-react";
import { useEffect, useState } from "react";
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

  function handleToggleIsOpen() {
    setIsOpen((c) => !c);
  }

  return (
    <Dialog.Root onOpenChange={handleToggleIsOpen}>
      <Dialog.DialogTrigger asChild>
        <Button disabled={disabled} variant="outline" className="w-full">
          {selectedIcon}
        </Button>
      </Dialog.DialogTrigger>

      <Dialog.Portal>
        {isOpen && (
          <Dialog.Overlay className="fixed inset-0 bg-black/80"></Dialog.Overlay>
        )}

        {isOpen && (
          <Dialog.Content className="fixed left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2 border-0 p-0 shadow-md">
            <Dialog.Title className="hidden">Select an emoji</Dialog.Title>
            <Dialog.Description>Picking an emoji</Dialog.Description>
            <EmojiPicker
              lazyLoadEmojis
              open={isOpen}
              onEmojiClick={handleEmojiClick}
              emojiStyle={EmojiStyle.NATIVE}
              skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
            />
          </Dialog.Content>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default IconPicker;
