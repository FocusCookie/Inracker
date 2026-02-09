import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { open } from "@tauri-apps/plugin-shell";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ToastAction } from "@/components/ui/toast";

export function useAppUpdates() {
  const { toast } = useToast();
  const { t } = useTranslation();

  const checkForUpdates = useCallback(async () => {
    try {
      const update = await check();
      if (update) {
        toast({
          title: t("HookUseAppUpdates:availableTitle", "Update Available"),
          description: (
            <div className="mt-1 flex flex-col gap-2">
              <p>
                {t("HookUseAppUpdates:availableDescription", {
                  version: update.version,
                  defaultValue: `A new version (${update.version}) is available.`,
                })}
              </p>
              <button
                onClick={async () => {
                  const url = "https://github.com/FocusCookie/Inracker/releases";
                  await open(url);
                }}
                className="text-primary hover:underline text-xs text-left"
              >
                {t("HookUseAppUpdates:viewChangelog", "View changelog in repository")}
              </button>
            </div>
          ),
          duration: Infinity,
          action: (
            <ToastAction
              altText={t("HookUseAppUpdates:updateNow", "Update Now")}
              onClick={async () => {
                await update.downloadAndInstall();
                await relaunch();
              }}
            >
              {t("HookUseAppUpdates:updateNow", "Update Now")}
            </ToastAction>
          ),
        });
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    }
  }, [toast, t]);

  return { checkForUpdates };
}
