import { useMemo } from "react";
import defaultDb from "@/lib/database";
import { BaseDirectory, remove } from "@tauri-apps/plugin-fs";
import { useTranslation } from "react-i18next";
import { TypographyH1 } from "../ui/typographyH1";
import { Button } from "../ui/button";
import { Trash2, Music } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

import { useEncounters } from "@/hooks/useEncounters";
import { useAudioFiles, AudioFile } from "@/hooks/useAudioFiles";

type Props = {
  database?: typeof defaultDb;
};

type UsageMap = Record<string, { type: string; name: string }[]>;

function SettingsCategoryAudio({ database = defaultDb }: Props) {
  const { t } = useTranslation("ComponentSettingsCategoryAudio");
  const { audioFiles, loading, refresh: fetchAudioFiles } = useAudioFiles();

  const encounters = useEncounters(database);

  const usageMap: UsageMap = useMemo(() => {
    const map: UsageMap = {};

    const addToMap = (
      audioPath: string | null | undefined,
      type: string,
      name: string,
    ) => {
      if (!audioPath) return;
      if (!map[audioPath]) {
        map[audioPath] = [];
      }
      map[audioPath].push({ type, name });
    };

    encounters.data?.forEach((e) => {
      addToMap(e.musicFile, "Encounter", e.name);
    });

    return map;
  }, [encounters.data]);

  const handleDelete = async (file: AudioFile) => {
    try {
      const relativePath = `audio/${file.name}`;
      await remove(relativePath, { baseDir: BaseDirectory.AppData });
      toast({ title: t("deleteSuccess") });
      fetchAudioFiles();
    } catch (error) {
      console.error("Delete failed", error);
      toast({ variant: "destructive", title: t("deleteError") });
    }
  };

  const unusedFiles = useMemo(() => {
    return audioFiles.filter((file) => {
      const exactUsage = usageMap[file.assetUrl];
      const fuzzyUsage = !exactUsage
        ? Object.keys(usageMap).find((k) => k.endsWith(file.name))
        : null;
      const usage = exactUsage || (fuzzyUsage ? usageMap[fuzzyUsage] : []);
      return !usage || usage.length === 0;
    });
  }, [audioFiles, usageMap]);

  const handleDeleteAllUnused = async () => {
    try {
      let deletedCount = 0;
      for (const file of unusedFiles) {
        const relativePath = `audio/${file.name}`;
        await remove(relativePath, { baseDir: BaseDirectory.AppData });
        deletedCount++;
      }
      toast({ title: t("deleteSuccess") + ` (${deletedCount})` });
      fetchAudioFiles();
    } catch (error) {
      console.error("Delete all failed", error);
      toast({ variant: "destructive", title: t("deleteError") });
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex items-center justify-between">
        <TypographyH1>{t("audioFiles")}</TypographyH1>
        {unusedFiles.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("deleteAllUnused")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("deleteAllUnused")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("confirmDeleteAllUnused")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-4">
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllUnused}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t("delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {audioFiles.map((file) => {
          const exactUsage = usageMap[file.assetUrl];
          const fuzzyUsage = !exactUsage
            ? Object.keys(usageMap).find((k) => k.endsWith(file.name))
            : null;
          const usage = exactUsage || (fuzzyUsage ? usageMap[fuzzyUsage] : []);
          const isUsed = usage && usage.length > 0;

          return (
            <div
              key={file.name}
              className="bg-card text-card-foreground flex items-center gap-4 rounded-md border p-2 shadow-sm"
            >
              <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-md border">
                <Music className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="flex min-w-0 grow flex-col gap-1">
                <p className="truncate text-sm font-medium" title={file.name}>
                  {file.name}
                </p>

                {isUsed ? (
                  <div className="text-muted-foreground text-xs">
                    <span className="font-semibold text-primary">
                      {t("usedBy")}:
                    </span>
                    <ul className="mt-1 list-inside list-disc">
                      {usage.map((u, i) => (
                        <li key={i} className="truncate">
                          {u.type}: {u.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="w-fit rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                    {t("unused")}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isUsed}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("confirmDelete")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-4">
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(file)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t("delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>

      {audioFiles.length === 0 && !loading && (
        <div className="text-muted-foreground mt-8 text-center">
          <Music className="mx-auto mb-2 h-12 w-12 opacity-20" />
          <p>{t("noAudio")}</p>
        </div>
      )}
    </div>
  );
}

export default SettingsCategoryAudio;
