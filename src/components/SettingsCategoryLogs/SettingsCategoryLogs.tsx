import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TypographyH1 } from "../ui/typographyH1";
import { Button } from "../ui/button";
import { readTextFile, BaseDirectory, remove } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { Trash2, RefreshCw, FileText } from "lucide-react";
import Loader from "../Loader/Loader";
import { ScrollArea } from "../ui/scroll-area";
import { StandardError } from "@/lib/logger";

function SettingsCategoryLogs() {
  const { t } = useTranslation("ComponentSettingsCategoryLogs");
  const [logs, setLogs] = useState<StandardError[]>([]);
  const [logPath, setLogPath] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadLogs() {
    setIsLoading(true);
    try {
      const appData = await appDataDir();
      const path = await join(appData, "error.log");
      setLogPath(path);

      const content = await readTextFile("error.log", {
        baseDir: BaseDirectory.AppData,
      });

      const parsedLogs = content
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => JSON.parse(line))
        .reverse(); // Newest first

      setLogs(parsedLogs);
    } catch (error) {
      console.error("Failed to load logs:", error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function clearLogs() {
    try {
      await remove("error.log", { baseDir: BaseDirectory.AppData });
      setLogs([]);
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-10 h-full">
      <div className="flex justify-between items-center">
        <TypographyH1>{t("title")}</TypographyH1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refresh")}
          </Button>
          <Button variant="destructive" size="sm" onClick={clearLogs} disabled={logs.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t("clearLogs")}
          </Button>
        </div>
      </div>

      <div className="bg-muted p-3 rounded-md flex items-start gap-3 border">
        <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{t("logFileLocation")}</p>
          <code className="text-xs break-all bg-black/10 p-1 rounded">
            {logPath || "Loading path..."}
          </code>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>{t("noLogs")}</p>
        </div>
      ) : (
        <ScrollArea className="h-[500px] border rounded-md p-4 bg-zinc-950">
          <div className="flex flex-col gap-4">
            {logs.map((log, index) => (
              <div key={index} className="border-b border-white/10 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono text-red-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  {log.code && (
                    <span className="text-[10px] bg-red-900/30 text-red-300 px-1.5 py-0.5 rounded border border-red-900/50">
                      {t("code")} {log.code}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-white mb-1">{log.message}</p>
                {log.route && (
                  <p className="text-xs text-zinc-400 mb-2">
                    <span className="text-zinc-500">{t("route")}</span> {log.route}
                  </p>
                )}
                {log.variables && (
                  <details className="mt-2">
                    <summary className="text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300">
                      {t("viewVariables")}
                    </summary>
                    <pre className="text-[10px] bg-black/50 p-2 rounded mt-1 overflow-x-auto text-zinc-300">
                      {JSON.stringify(log.variables, null, 2)}
                    </pre>
                  </details>
                )}
                {log.stack && (
                  <details className="mt-1">
                    <summary className="text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300">
                      {t("viewStack")}
                    </summary>
                    <pre className="text-[10px] bg-black/50 p-2 rounded mt-1 overflow-x-auto text-zinc-400 leading-relaxed">
                      {log.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export default SettingsCategoryLogs;
