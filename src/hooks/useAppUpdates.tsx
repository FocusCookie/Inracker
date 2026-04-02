import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { open } from "@tauri-apps/plugin-shell";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ToastAction } from "@/components/ui/toast";
import { Progress } from "@/components/ui/progress";

export function useAppUpdates() {
  const { toast } = useToast();
  const { t } = useTranslation();

  const checkForUpdates = useCallback(
    async (notifyIfNoUpdate = false) => {
      try {
        const update = await check();

        if (update) {
          const { update: updateToast } = toast({
            title: t("HookUseAppUpdates:availableTitle", "Update Available"),
            description: (
              <div className="mt-1 flex flex-col gap-2 max-h-[300px] overflow-y-auto text-sm">
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
                  let downloaded = 0;
                  let contentLength: number | undefined = 0;

                  // Update toast to show progress state
                  updateToast({
                    id: "", // id will be ignored by update function in use-toast.ts but required by type
                    title: t(
                      "HookUseAppUpdates:downloadingTitle",
                      "Downloading Update...",
                    ),
                    description: (
                      <div className="mt-2 flex flex-col gap-2 w-full">
                        <Progress value={0} className="h-2 w-full" />
                        <p className="text-xs text-muted-foreground">0%</p>
                      </div>
                    ),
                    action: <div />, // Remove the button while downloading
                  });

                  try {
                    await update.downloadAndInstall((event) => {
                      switch (event.event) {
                        case "Started":
                          contentLength = event.data.contentLength;
                          break;
                        case "Progress":
                          downloaded += event.data.chunkLength;
                          if (contentLength) {
                            const progress = Math.round(
                              (downloaded / contentLength) * 100,
                            );
                            updateToast({
                              id: "",
                              title: t(
                                "HookUseAppUpdates:downloadingTitle",
                                "Downloading Update...",
                              ),
                              description: (
                                <div className="mt-2 flex flex-col gap-2 w-full">
                                  <Progress
                                    value={progress}
                                    className="h-2 w-full"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    {progress}%
                                  </p>
                                </div>
                              ),
                              action: <div />,
                            });
                          }
                          break;
                        case "Finished":
                          updateToast({
                            id: "",
                            title: t(
                              "HookUseAppUpdates:installingTitle",
                              "Installing...",
                            ),
                            description: t(
                              "HookUseAppUpdates:installingDescription",
                              "The app will restart automatically.",
                            ),
                            action: <div />,
                          });
                          break;
                      }
                    });

                    // If it hasn't relaunched yet, trigger it
                    await relaunch();
                  } catch (e) {
                    console.error("Update failed:", e);
                    updateToast({
                      id: "",
                      title: t("HookUseAppUpdates:errorTitle", "Update Failed"),
                      description: t(
                        "HookUseAppUpdates:errorDescription",
                        "Failed to download and install the update.",
                      ),
                      variant: "destructive",
                    });
                  }
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
    },
    [toast, t],
  );

  return { checkForUpdates };
}
