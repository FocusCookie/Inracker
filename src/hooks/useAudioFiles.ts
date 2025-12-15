import { useState, useEffect, useCallback } from "react";
import { BaseDirectory, readDir } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";

export type AudioFile = {
  name: string;
  path: string;
  assetUrl: string;
};

export function useAudioFiles() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudioFiles = useCallback(async () => {
    setLoading(true);
    const files: AudioFile[] = [];

    try {
      const appDataPath = await appDataDir();

      try {
        const entries = await readDir("audio", {
          baseDir: BaseDirectory.AppData,
        });

        for (const entry of entries) {
          if (entry.isFile) {
            const filePath = await join(appDataPath, "audio", entry.name);
            const assetUrl = convertFileSrc(filePath);

            files.push({
              name: entry.name,
              path: filePath,
              assetUrl: assetUrl,
            });
          }
        }
      } catch (e) {
        console.warn("Could not read directory audio", e);
      }
      setAudioFiles(files);
    } catch (e) {
      console.error("Failed to list audio files", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudioFiles();
  }, [fetchAudioFiles]);

  return { audioFiles, loading, refresh: fetchAudioFiles };
}
