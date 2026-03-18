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

  const findBackupInfo = async (selected: string) => {
    // Case 1: selected/data/*.json (The new standard)
    const dataDir = await join(selected, "data");
    if (await exists(dataDir)) {
      const playersPath = await join(dataDir, "players.json");
      if (await exists(playersPath)) {
        return { root: selected, data: dataDir };
      }
    }

    // Case 2: selected/*.json (Older format or user selected the 'data' folder directly)
    const playersPath = await join(selected, "players.json");
    const chaptersPath = await join(selected, "chapters.json");
    if ((await exists(playersPath)) || (await exists(chaptersPath))) {
      return { root: selected, data: selected };
    }

    return null;
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

      const baseDir = selected as string;

      // 1. Export DB Data
      const fullData = await Database.backup.exportAll();
      const dataDir = await join(baseDir, "data");
      
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
      
      const destImages = await join(baseDir, "images");
      const destAudio = await join(baseDir, "audio");

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
      const backupInfo = await findBackupInfo(selected as string);
      if (!backupInfo) {
        throw new Error(t("invalidBackup"));
      }

      const tables = [
        "parties", "players", "effects", "immunities", "resistances",
        "chapters", "encounters", "opponents", "tokens",
        "encounter_opponents", "combats", "combat_participants",
        "combat_effects", "active_effects", "settings", "logs", "weaknesses"
      ];

      const importData: Record<string, any> = {};

      for (const table of tables) {
        const filePath = await join(backupInfo.data, `${table}.json`);
        if (await exists(filePath)) {
          const content = await readTextFile(filePath);
          importData[table] = JSON.parse(content);
        }
      }

      if (Object.keys(importData).length === 0) {
          throw new Error(t("noDataFound"));
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
      
      const sourceImages = await join(backupInfo.root, "images");
      const sourceAudio = await join(backupInfo.root, "audio");

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

  const handleExportCategory = async (category: string, ids?: (number | string)[]) => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t("selectFolder"),
      });

      if (!selected) return;

      setIsLoading(true);

      const baseDir = selected as string;

      // 1. Export DB Data
      const categoryData = await Database.backup.exportCategory(category, ids);
      const dataDir = await join(baseDir, "data");
      
      if (!(await exists(dataDir))) {
        await mkdir(dataDir, { recursive: true });
      }

      for (const [key, value] of Object.entries(categoryData)) {
        const filePath = await join(dataDir, `${key}.json`);
        await writeTextFile(filePath, JSON.stringify(value, null, 2));
      }

      // 2. Export Assets (if needed)
      const appData = await appDataDir();
      const destImages = await join(baseDir, "images");
      const destAudio = await join(baseDir, "audio");

      if (category === "images" || category === "all" || category === "chapters" || category === "players" || category === "opponents") {
          const sourceImages = await join(appData, "images");
          if (await exists(sourceImages)) {
              await copyFolder(sourceImages, destImages);
          }
      }

      if (category === "audio" || category === "all" || category === "chapters") {
          const sourceAudio = await join(appData, "audio");
          if (await exists(sourceAudio)) {
              await copyFolder(sourceAudio, destAudio);
          }
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

  const handleImportCategory = async (mode: "restore" | "merge") => {
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
          const backupInfo = await findBackupInfo(selected as string);
          if (!backupInfo) {
              throw new Error(t("invalidBackup"));
          }

          const tables = [
              "parties", "players", "effects", "immunities", "resistances",
              "chapters", "encounters", "opponents", "tokens",
              "encounter_opponents", "combats", "combat_participants",
              "combat_effects", "active_effects", "settings", "logs", "weaknesses"
          ];

          const importData: Record<string, any> = {};

          for (const table of tables) {
              const filePath = await join(backupInfo.data, `${table}.json`);
              if (await exists(filePath)) {
                  const content = await readTextFile(filePath);
                  importData[table] = JSON.parse(content);
              }
          }

          if (Object.keys(importData).length === 0) {
              throw new Error(t("noDataFound"));
          }

          const conflictData = await Database.backup.importCategory(importData, mode);
          if (Object.keys(conflictData).length > 0) {
              setConflicts(conflictData);
          }

          // 2. Import Assets
          const appData = await appDataDir();
          const destImages = await join(appData, "images");
          const destAudio = await join(appData, "audio");
          
          const sourceImages = await join(backupInfo.root, "images");
          const sourceAudio = await join(backupInfo.root, "audio");

          if (await exists(sourceImages)) {
              await copyFolder(sourceImages, destImages);
          }
          
          if (await exists(sourceAudio)) {
              await copyFolder(sourceAudio, destAudio);
          }

          queryClient.invalidateQueries();

          toast({
              title: t("importSuccess"),
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

  const getAssets = async (type: "images" | "audio") => {
    try {
      const appData = await appDataDir();
      const folderPath = await join(appData, type);
      
      if (!(await exists(folderPath))) return [];

      const readRecursive = async (dir: string): Promise<string[]> => {
          const entries = await readDir(dir);
          let files: string[] = [];
          for (const entry of entries) {
              const fullPath = await join(dir, entry.name);
              if (entry.isDirectory) {
                  files = [...files, ...(await readRecursive(fullPath))];
              } else {
                  // Get path relative to the base folder (images or audio)
                  const relativePath = fullPath.replace(folderPath, "").replace(/^[\\\/]/, "");
                  files.push(relativePath);
              }
          }
          return files;
      };

      return await readRecursive(folderPath);
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  return {
    handleExport,
    handleImport,
    handleExportCategory,
    handleImportCategory,
    getAssets,
    isLoading,
    conflicts,
    setConflicts
  };
};