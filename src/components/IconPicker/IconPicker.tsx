import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  SkinTonePickerLocation,
} from "emoji-picker-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
  onIconClick: (icon: string) => void;
  initialIcon?: string;
  disabled: boolean;
};

function DeferredEmojiPicker(props: React.ComponentProps<typeof EmojiPicker>) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Defer rendering to allow Popover animation to start/finish
    const timer = requestAnimationFrame(() => {
      setShouldRender(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!shouldRender) {
    return (
      <div className="flex h-[450px] w-[350px] items-center justify-center bg-muted/20 text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <EmojiPicker {...props} />;
}

function IconPicker({ initialIcon, disabled, onIconClick }: Props) {
  const [selectedIcon, setSelectedIcon] = useState(initialIcon || "🧙‍♂️");
  const [isOpen, setIsOpen] = useState(false);

  function handleEmojiClick(emojiData: EmojiClickData) {
    onIconClick(emojiData.emoji);
    setSelectedIcon(emojiData.emoji);
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button disabled={disabled} variant="outline" className="w-full">
          {selectedIcon}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 border-none shadow-none">
        <DeferredEmojiPicker
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
