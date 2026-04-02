import { check } from "@tauri-apps/plugin-updater";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ToastAction } from "@/components/ui/toast";
import { useOverlayStore } from "@/stores/useOverlayStore";

export function useAppUpdates() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const openOverlay = useOverlayStore((s) => s.open);

  const checkForUpdates = useCallback(
    async (notifyIfNoUpdate = false) => {
      try {
        const update = await check();

        if (update) {
          toast({
            title: t("HookUseAppUpdates:availableTitle", "Update Available"),
            description: t("HookUseAppUpdates:availableDescriptionShort", {
              version: update.version,
              defaultValue: `A new version (v${update.version}) is available.`,
            }),
            duration: Infinity,
            action: (
              <ToastAction
                altText={t("HookUseAppUpdates:viewUpdate", "View Update")}
                onClick={() => {
                  openOverlay("settings", { initialCategory: "update" });
                }}
              >
                {t("HookUseAppUpdates:viewUpdate", "View Update")}
              </ToastAction>
            ),
          });
        } else if (notifyIfNoUpdate) {
          toast({
            title: t("HookUseAppUpdates:upToDateTitle", "Up to Date"),
            description: t(
              "HookUseAppUpdates:upToDateDescription",
              "You are already using the latest version.",
            ),
          });
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
        if (notifyIfNoUpdate) {
          toast({
            title: t("HookUseAppUpdates:errorTitle", "Check Failed"),
            description: t(
              "HookUseAppUpdates:errorDescription",
              "Failed to check for updates. Please try again later.",
            ),
            variant: "destructive",
          });
        }
      }
    },
    [toast, t, openOverlay],
  );

  return { checkForUpdates };
}
