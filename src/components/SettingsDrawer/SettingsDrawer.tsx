import defaultDb from "@/lib/database";
import { SidebarProvider } from "../ui/sidebar";
import SettingsSidebar, {
  SettingsCategory,
} from "../SettingsSidebar/SettingsSidebar";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { CancelReason, OverlayMap } from "@/types/overlay";
import { useState } from "react";
import SettingsCategoryGeneral from "../SettingsCategoryGeneral/SettingsCategoryGeneral";
import SettingsCategoryPlayers from "../SettingsCategoryPlayers/SettingsCategoryPlayers";
import SettingsCategoryEffects from "../SettingsCategoryEffects/SettingsCategoryEffects";
import SettingsCategoryImmunities from "../SettingsCategoryImmunities/SettingsCategoryImmunities";
import SettingsCategoryResistances from "../SettingsCategoryResistances/SettingsCategoryResistances";
import SettingsCategoryOpponents from "../SettingsCategoryOpponents/SettingsCategoryOpponents";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";

type OverlayProps = OverlayMap["settings"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};

type Props = OverlayProps & RuntimeProps & { database?: typeof defaultDb };

function SettingsDrawer({ open, onOpenChange, onExitComplete, database = defaultDb }: Props) {
  const [activeCategory, setActiveCategory] =
    useState<SettingsCategory>("general");
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);

  const immunities = useQueryWithToast({
    queryKey: ["immunities"],
    queryFn: () => database.immunitites.getAll(),
  });

  const resistances = useQueryWithToast({
    queryKey: ["resistances"],
    queryFn: () => database.resistances.getAll(),
  });

  const effects = useQueryWithToast({
    queryKey: ["effects"],
    queryFn: () => database.effects.getAll(),
  });

  function handleCloseDrawer() {
    setClosingReason("closed");
    onOpenChange(false);
  }

  function handleOpenChange(state: boolean) {
    if (!state && closingReason === null) {
      setClosingReason("dismissed");
    }

    onOpenChange(state);
  }

  function showSettingsCategory(category: SettingsCategory) {
    switch (category) {
      case "general":
        return <SettingsCategoryGeneral />;

      case "players":
        return <SettingsCategoryPlayers database={database} />;

      case "effects":
        return <SettingsCategoryEffects />;

      case "immunities":
        return <SettingsCategoryImmunities />;

      case "resistances":
        return <SettingsCategoryResistances />;

      case "opponents":
        return <SettingsCategoryOpponents />;

      default:
        return <SettingsCategoryGeneral />;
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
        {open && (
          <Dialog.Portal
            container={document.getElementById("drawer-portal")}
            forceMount
          >
            <Dialog.Title>Settings</Dialog.Title>
            <Dialog.DialogDescription>App settings</Dialog.DialogDescription>

            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              />
            </Dialog.Overlay>

            <Dialog.Content>
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-0 right-0 bottom-0 flex h-full w-full flex-col items-start gap-4 bg-white px-0.5 shadow-xl"
              >
                <div className="flex h-full w-full grow flex-col">
                  <SidebarProvider>
                    <SettingsSidebar
                      activeItem={activeCategory}
                      onSelect={setActiveCategory}
                      onClose={handleCloseDrawer}
                    />

                    <main className="flex h-full w-full justify-center">
                      <div className="scrollable-y flex w-full max-w-[1024px] flex-col gap-4 overflow-y-scroll p-4">
                        {showSettingsCategory(activeCategory)}
                      </div>
                    </main>
                  </SidebarProvider>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default SettingsDrawer;
