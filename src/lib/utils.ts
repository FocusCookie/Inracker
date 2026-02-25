import { BaseDirectory, mkdir, remove, writeFile } from "@tauri-apps/plugin-fs";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_IMAGE_FOLDERS = [
  "players",
  "battlemaps",
  "chapters",
  "others",
  "opponents",
] as const;

export async function createTauriAppDataSubfolders() {
  for (const folder of DEFAULT_IMAGE_FOLDERS) {
    await mkdir(`images/${folder}`, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  }
  await mkdir("audio", {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  });
}

export async function createFolder(folderName: string) {
  await mkdir(`images/${folderName}`, {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  });
}

export async function deleteFolder(folderName: string) {
  await remove(`images/${folderName}`, {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  });
}

export async function storeAudio(audio: File) {
  if (audio instanceof File) {
    try {
      const fileName = `${Date.now()}-${audio.name}`;
      const filePath = `audio/${fileName}`;
      const buffer = await audio.arrayBuffer();

      await writeFile(filePath, new Uint8Array(buffer), {
        baseDir: BaseDirectory.AppData,
      });

      const appDataDirPath = await appDataDir();
      const appFilePath = await join(appDataDirPath, filePath);
      const assetUrl = convertFileSrc(appFilePath);

      return assetUrl;
    } catch (error) {
      console.error("Error saving audio file:", error);
    }
  }

  return null;
}

export async function storeImage(picture: File | string, folder: string) {
  if (picture instanceof File) {
    try {
      const fileName = `${Date.now()}-${picture.name}`;
      const filePath = `images/${folder}/${fileName}`;
      const buffer = await picture.arrayBuffer();

      await writeFile(filePath, new Uint8Array(buffer), {
        baseDir: BaseDirectory.AppData,
      });

      const appDataDirPath = await appDataDir();
      const appFilePath = await join(appDataDirPath, filePath);
      const assetUrl = convertFileSrc(appFilePath);

      return assetUrl;
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }

  return null;
}

export async function deleteImage(fileName: string, folder: string) {
  try {
    const appDataDirPath = await appDataDir();
    const imagePath = await join(appDataDirPath, "images", folder, fileName); // Construct the correct path

    await remove(imagePath, { baseDir: BaseDirectory.AppData });

    return true;
  } catch (error) {
    console.error(`Failed to delete image ${fileName} from ${folder}:`, error);
    return false;
  }
}

export function getSoundCloudEmbedUrl(input: string): string | null {
  if (!input) return null;

  // Handle iframe code
  if (input.includes("<iframe")) {
    const srcMatch = input.match(/src="([^"]+)"/);
    return srcMatch ? srcMatch[1] : null;
  }

  // Handle SoundCloud URL (https://soundcloud.com/...)
  if (input.includes("soundcloud.com") && !input.includes("w.soundcloud.com/player")) {
     const encodedUrl = encodeURIComponent(input);
     return `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
  }
  
  // Handle widget URL directly
  if (input.includes("w.soundcloud.com/player")) {
      return input;
  }

  return null;
}

export function getModifierKey(): string {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMac = userAgent.includes("mac");
  return isMac ? "⌘" : "Ctrl";
}
