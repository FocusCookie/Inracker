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

  const checkForUpdates = useCallback(async (notifyIfNoUpdate = false) => {
    try {
      const update = await check();

      if (update) {
        toast({
          title: t("HookUseAppUpdates:availableTitle", "Update Available"),
          description: (
            <div className="mt-1 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              <p className="font-semibold">
                {t("HookUseAppUpdates:availableDescription", {
                  version: update.version,
                  defaultValue: `A new version (${update.version}) is available.`,
                })}
              </p>
              {update.body && (
                <div className="text-xs bg-muted p-2 rounded-md whitespace-pre-wrap font-mono border">
                  {update.body}
                </div>
              )}
              <button
                onClick={async () => {
                  const url =
                    "https://github.com/FocusCookie/Inracker/releases";
                  await open(url);
                }}
                className="text-primary text-left text-xs hover:underline"
              >
                {t(
                  "HookUseAppUpdates:viewChangelog",
                  "View changelog in repository",
                )}
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
  }, [toast, t]);

  return { checkForUpdates };
}
