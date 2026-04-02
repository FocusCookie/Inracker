import { useEffect, useState, useCallback } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import MarkdownPreview from "@uiw/react-markdown-preview";

export default function SettingsCategoryUpdate() {
  const { t } = useTranslation("ComponentSettingsCategoryUpdate");
  const [currentVersion, setCurrentVersion] = useState<string>("");
  const [update, setUpdate] = useState<Update | null>(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchVersion = useCallback(async () => {
    try {
      const version = await getVersion();
      setCurrentVersion(version);
    } catch (err) {
      console.error("Failed to get version:", err);
    }
  }, []);

  const checkForUpdates = useCallback(async (manual = false) => {
    setChecking(true);
    setError(null);
    try {
      const result = await check();
      setUpdate(result);
    } catch (err) {
      console.error("Failed to check for updates:", err);
      if (manual) {
        setError(t("errorCheck", "Failed to check for updates."));
      }
    } finally {
      setChecking(false);
    }
  }, [t]);

  useEffect(() => {
    fetchVersion();
    checkForUpdates();
  }, [fetchVersion, checkForUpdates]);

  const handleUpdate = async () => {
    if (!update) return;

    setDownloading(true);
    setError(null);
    let downloaded = 0;
    let contentLength: number | undefined = 0;

    try {
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (contentLength) {
              setDownloadProgress(Math.round((downloaded / contentLength) * 100));
            }
            break;
          case "Finished":
            // App will restart automatically via relaunch() or plugin behavior
            break;
        }
      });
      await relaunch();
    } catch (err) {
      console.error("Update failed:", err);
      setError(t("errorUpdate", "Failed to download and install the update."));
      setDownloading(false);
    }
  };

  const openChangelog = async () => {
    await open("https://github.com/FocusCookie/Inracker/releases");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">{t("title", "App Update")}</h2>
        <p className="text-muted-foreground">
          {t("description", "Manage app versions and check for updates.")}
        </p>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">{t("currentVersion", "Current Version")}</span>
            <span className="text-lg font-mono font-semibold">{currentVersion || "..."}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => checkForUpdates(true)} 
            disabled={checking || downloading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            {t("checkBtn", "Check for Updates")}
          </Button>
        </div>

        {update ? (
          <div className="flex flex-col gap-4 p-4 border rounded-lg border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-primary">{t("updateAvailable", "New Version Available!")}</span>
                <span className="text-lg font-mono font-semibold">{update.version}</span>
              </div>
              <Button 
                onClick={handleUpdate} 
                disabled={downloading}
              >
                {downloading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                )}
                {downloading ? t("downloading", "Downloading...") : t("updateBtn", "Update Now")}
              </Button>
            </div>

            {downloading && (
              <div className="flex flex-col gap-2">
                <Progress value={downloadProgress} className="h-2" />
                <span className="text-xs text-right text-muted-foreground">{downloadProgress}%</span>
              </div>
            )}

            {update.body && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">{t("changelog", "What's New:")}</span>
                <ScrollArea className="h-[200px] w-full rounded-md border bg-background p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownPreview 
                      source={update.body} 
                      style={{ backgroundColor: 'transparent', color: 'inherit' }}
                    />
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        ) : !checking && (
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/30 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>{t("upToDate", "Inracker is up to date.")}</span>
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <Button variant="link" onClick={openChangelog} className="text-xs">
            {t("fullHistory", "View Full Release History on GitHub")}
          </Button>
        </div>
      </div>
    </div>
  );
}
