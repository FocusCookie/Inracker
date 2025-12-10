import { useState, useEffect, useCallback } from "react";
import { BaseDirectory, readDir } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { IMAGE_FOLDERS, ImageFolder } from "@/lib/utils";

export type ImageFile = {
  name: string;
  path: string;
  folder: ImageFolder;
  assetUrl: string;
};

export function useImages() {
  const [images, setImages] = useState<Record<ImageFolder, ImageFile[]>>({
    players: [],
    battlemaps: [],
    chapters: [],
    others: [],
    opponents: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    const newImages: Record<ImageFolder, ImageFile[]> = {
      players: [],
      battlemaps: [],
      chapters: [],
      others: [],
      opponents: [],
    };

    try {
      const appDataPath = await appDataDir();

      for (const folder of IMAGE_FOLDERS) {
        try {
          const entries = await readDir(`images/${folder}`, {
            baseDir: BaseDirectory.AppData,
          });

          for (const entry of entries) {
            if (entry.isFile) {
              const filePath = await join(
                appDataPath,
                "images",
                folder,
                entry.name,
              );
              const assetUrl = convertFileSrc(filePath);

              newImages[folder].push({
                name: entry.name,
                path: filePath,
                folder: folder,
                assetUrl: assetUrl,
              });
            }
          }
        } catch (e) {
          // Folder might not exist yet, ignore
          console.warn(`Could not read directory images/${folder}`, e);
        }
      }
      setImages(newImages);
    } catch (e) {
      console.error("Failed to list images", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return { images, loading, refresh: fetchImages };
}
