import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  readTextFile,
  writeTextFile,
  readDir,
  copyFile,
  mkdir,
  exists,
} from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import Database from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

export const useSettingsBackup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [conflicts, setConflicts] = useState<Record<string, any[]> | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation("ComponentSettingsCategoryBackup");
  const queryClient = useQueryClient();

  const copyFolder = async (source: string, destination: string) => {
    // Ensure destination exists
    if (!(await exists(destination))) {
      await mkdir(destination, { recursive: true });
    }

    const entries = await readDir(source);

    for (const entry of entries) {
      const srcPath = await join(source, entry.name);
      const destPath = await join(destination, entry.name);

      if (entry.isDirectory) {
        await copyFolder(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  };

  const handleExport = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t("selectFolder"),
      });

      if (!selected) return;

      setIsLoading(true);

      // 1. Export DB Data
      const fullData = await Database.backup.exportAll();
      const dataDir = await join(selected as string, "data");
      
      if (!(await exists(dataDir))) {
        await mkdir(dataDir, { recursive: true });
      }

      // Write separate files for each table
      for (const [key, value] of Object.entries(fullData)) {
        const filePath = await join(dataDir, `${key}.json`);
        await writeTextFile(filePath, JSON.stringify(value, null, 2));
      }

      // 2. Export Assets
      const appData = await appDataDir();
      const sourceImages = await join(appData, "images");
      const sourceAudio = await join(appData, "audio");
      
      const destImages = await join(selected as string, "images");
      const destAudio = await join(selected as string, "audio");

      if (await exists(sourceImages)) {
        await copyFolder(sourceImages, destImages);
      }
      
      if (await exists(sourceAudio)) {
        await copyFolder(sourceAudio, destAudio);
      }

      toast({
        title: t("exportSuccess"),
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t("error"),
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (mode: "restore" | "merge") => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t("selectFolder"),
      });

      if (!selected) return;

      setIsLoading(true);
      setConflicts(null);

      // 1. Import DB Data
      const dataDir = await join(selected as string, "data");
      if (!(await exists(dataDir))) {
        throw new Error("Data folder not found in selected directory");
      }

      const tables = [
        "parties", "players", "effects", "immunities", "resistances",
        "chapters", "encounters", "opponents", "tokens",
        "encounter_opponents", "combats", "combat_participants",
        "combat_effects", "active_effects", "settings", "logs"
      ];

      const importData: Record<string, any> = {};

      for (const table of tables) {
        const filePath = await join(dataDir, `${table}.json`);
        if (await exists(filePath)) {
          const content = await readTextFile(filePath);
          importData[table] = JSON.parse(content);
        }
      }

      if (mode === "restore") {
         await Database.backup.importAll(importData);
      } else {
         const conflictData = await Database.backup.mergeAll(importData);
         if (Object.keys(conflictData).length > 0) {
            setConflicts(conflictData);
         }
      }

      // 2. Import Assets
      const appData = await appDataDir();
      const destImages = await join(appData, "images");
      const destAudio = await join(appData, "audio");
      
      const sourceImages = await join(selected as string, "images");
      const sourceAudio = await join(selected as string, "audio");

      if (await exists(sourceImages)) {
        await copyFolder(sourceImages, destImages);
      }
      
      if (await exists(sourceAudio)) {
        await copyFolder(sourceAudio, destAudio);
      }

      // Invalidate all queries to refresh UI
      queryClient.invalidateQueries();

      if (mode === "restore" || !conflicts) {
          toast({
            title: t("importSuccess"),
            variant: "default",
          });
      } else {
          toast({
            title: t("importSuccessWithConflicts"),
            variant: "default",
          });
      }
      
    } catch (error) {
      console.error(error);
      toast({
        title: t("error"),
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleExport,
    handleImport,
    isLoading,
    conflicts,
    setConflicts
  };
};