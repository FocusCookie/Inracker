import { BaseDirectory, mkdir, remove, writeFile } from "@tauri-apps/plugin-fs";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const IMAGE_FOLDERS = ["players", "battlemaps", "chapters", "others"] as const;
export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

export async function createTauriAppDataSubfolders() {
  for (const folder of IMAGE_FOLDERS) {
    await mkdir(`images/${folder}`, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  }
}

export async function storeImage(picture: File | string, folder: ImageFolder) {
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

export async function deleteImage(fileName: string, folder: ImageFolder) {
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
