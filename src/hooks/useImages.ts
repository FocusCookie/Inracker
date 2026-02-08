import { useState, useEffect, useCallback } from "react";
import { BaseDirectory, readDir, DirEntry } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";

export type ImageFile = {
  name: string;
  path: string;
  folder: string;
  assetUrl: string;
};

export function useImages() {
  const [images, setImages] = useState<Record<string, ImageFile[]>>({});
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    const newImages: Record<string, ImageFile[]> = {};
    const discoveredFolders: string[] = [];

    try {
      const appDataPath = await appDataDir();

      // 1. Discover folders
      let rootEntries: DirEntry[];
      try {
        rootEntries = await readDir("images", {
          baseDir: BaseDirectory.AppData,
        });
      } catch (e) {
        // images folder might not exist yet
        rootEntries = [];
      }

      for (const rootEntry of rootEntries) {
        if (rootEntry.isDirectory) {
          discoveredFolders.push(rootEntry.name);
          newImages[rootEntry.name] = [];

          try {
            const entries = await readDir(`images/${rootEntry.name}`, {
              baseDir: BaseDirectory.AppData,
            });

            for (const entry of entries) {
              if (entry.isFile) {
                const filePath = await join(
                  appDataPath,
                  "images",
                  rootEntry.name,
                  entry.name,
                );
                const assetUrl = convertFileSrc(filePath);

                newImages[rootEntry.name].push({
                  name: entry.name,
                  path: filePath,
                  folder: rootEntry.name,
                  assetUrl: assetUrl,
                });
              }
            }
          } catch (e) {
            console.warn(`Could not read directory images/${rootEntry.name}`, e);
          }
        }
      }
      setImages(newImages);
      setFolders(discoveredFolders);
    } catch (e) {
      console.error("Failed to list images", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return { images, folders, loading, refresh: fetchImages };
}
