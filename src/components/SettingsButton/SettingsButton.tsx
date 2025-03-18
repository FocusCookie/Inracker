import { useSettingsStore } from "@/stores/useSettingsStore";
import { HiMiniCog6Tooth } from "react-icons/hi2";
import { useShallow } from "zustand/shallow";

type Props = {};

function SettingsButton({}: Props) {
  const { openSettingsDialog } = useSettingsStore(
    useShallow((state) => ({
      openSettingsDialog: state.openSettingsDialog,
    })),
  );

  return (
    <button
      onClick={openSettingsDialog}
      className="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground absolute right-1 bottom-1 flex h-12 w-12 items-center justify-center rounded-full border-8 border-black bg-white text-sm font-medium ring-offset-1 transition-colors hover:cursor-pointer focus-visible:ring-1 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none"
    >
      <HiMiniCog6Tooth />
    </button>
  );
}

export default SettingsButton;
