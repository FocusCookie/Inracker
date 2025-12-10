import { useEffect, useState, useMemo } from "react";
import defaultDb from "@/lib/database";
import { BaseDirectory, readDir, remove } from "@tauri-apps/plugin-fs";
import { IMAGE_FOLDERS, ImageFolder } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { TypographyH1 } from "../ui/typographyH1";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { Trash2, Image as ImageIcon } from "lucide-react";
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
import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";

import { useAllPlayers } from "@/hooks/usePlayers";
import { useOpponents } from "@/hooks/useOpponents";
import { useChapters } from "@/hooks/useChapters";
import { useEncounters } from "@/hooks/useEncounters";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast"; // For encounter opponents if needed or use existing hook

type Props = {
  database?: typeof defaultDb;
};

type ImageFile = {
  name: string;
  path: string;
  folder: ImageFolder;
  assetUrl: string;
};

type UsageMap = Record<string, { type: string; name: string }[]>;

function SettingsCategoryImages({ database = defaultDb }: Props) {
  const { t } = useTranslation("ComponentSettingsCategoryImages");
  const [images, setImages] = useState<Record<ImageFolder, ImageFile[]>>({
    players: [],
    battlemaps: [],
    chapters: [],
    others: [],
    opponents: [],
  });
  const [loading, setLoading] = useState(true);

  const players = useAllPlayers(database);
  const opponents = useOpponents(database);
  const chapters = useChapters(database);
  const encounters = useEncounters(database);

  const encounterOpponents = useQueryWithToast({
    queryKey: ["all-encounter-opponents"],
    queryFn: () => database.encounterOpponents.getAllDetailed(),
  });

  const fetchImages = async () => {
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
              // Construct asset URL for display
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
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const usageMap: UsageMap = useMemo(() => {
    const map: UsageMap = {};

    const addToMap = (
      imagePath: string | null | undefined,
      type: string,
      name: string,
    ) => {
      if (!imagePath) return;
      // The DB stores the full asset URL. We need to match it against our file's assetUrl or name.
      // Usually the DB stores what `storeImage` returns, which is `convertFileSrc(appFilePath)`.
      // So exact match on assetUrl should work.
      // However, let's normalize by checking if the DB string contains the filename.

      // A safer approach: The DB string is the key. But we want to look up by OUR image file.
      // So we reverse it.

      // Let's iterate our images and see if they appear in the entities.
      // BUT that is O(N*M).

      // Better: Map DB Image String -> Usage List.
      // Then for each File, check if its Asset URL matches the DB Image String.

      if (!map[imagePath]) {
        map[imagePath] = [];
      }
      map[imagePath].push({ type, name });
    };

    players.data?.forEach((p) =>
      addToMap(p.image, t("folders.players"), p.name),
    );
    opponents.data?.forEach((o) =>
      addToMap(o.image, t("folders.opponents"), o.name),
    );
    chapters.data?.forEach((c) => {
      addToMap(c.battlemap, t("folders.chapters"), c.name);
      // Check tokens in chapter? Tokens usually reference players/opponents, so image is on entity.
    });
    // Encounters images
    encounters.data?.forEach((e) => {
      if (e.images) {
        e.images.forEach((img) => addToMap(img, "Encounter", e.name));
      }
    });

    encounterOpponents.data?.forEach((eo) =>
      addToMap(eo.image, "Encounter Opponent", eo.name),
    );

    return map;
  }, [
    players.data,
    opponents.data,
    chapters.data,
    encounters.data,
    encounterOpponents.data,
    t,
  ]);

  const handleDelete = async (file: ImageFile) => {
    try {
      // Path relative to AppData for remove() with BaseDirectory.AppData
      // file.folder is "players", file.name is "xyz.png"
      // path should be "images/players/xyz.png"
      const relativePath = `images/${file.folder}/${file.name}`;

      await remove(relativePath, { baseDir: BaseDirectory.AppData });

      toast({ title: t("deleteSuccess") });
      fetchImages(); // Refresh list
    } catch (error) {
      console.error("Delete failed", error);
      toast({ variant: "destructive", title: t("deleteError") });
    }
  };

  const unusedImages = useMemo(() => {
    const allImages = Object.values(images).flat();
    return allImages.filter((file) => {
      const exactUsage = usageMap[file.assetUrl];
      const fuzzyUsage = !exactUsage
        ? Object.keys(usageMap).find((k) => k.endsWith(file.name))
        : null;
      const usage = exactUsage || (fuzzyUsage ? usageMap[fuzzyUsage] : []);
      return !usage || usage.length === 0;
    });
  }, [images, usageMap]);

  const handleDeleteAllUnused = async () => {
    try {
      let deletedCount = 0;
      for (const file of unusedImages) {
        const relativePath = `images/${file.folder}/${file.name}`;
        await remove(relativePath, { baseDir: BaseDirectory.AppData });
        deletedCount++;
      }
      toast({ title: t("deleteSuccess") + ` (${deletedCount})` });
      fetchImages();
    } catch (error) {
      console.error("Delete all failed", error);
      toast({ variant: "destructive", title: t("deleteError") });
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex items-center justify-between">
        <TypographyH1>{t("images")}</TypographyH1>
        {unusedImages.length > 0 && (
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
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
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

      <Accordion
        type="multiple"
        defaultValue={IMAGE_FOLDERS as unknown as string[]}
        className="w-full"
      >
        {IMAGE_FOLDERS.map((folder) => {
          const folderImages = images[folder];
          if (folderImages.length === 0) return null;

          return (
            <AccordionItem value={folder} key={folder}>
              <AccordionTrigger className=" ">
                {t(`folders.${folder}`)} ({folderImages.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {folderImages.map((file) => {
                    const exactUsage = usageMap[file.assetUrl];
                    const fuzzyUsage = !exactUsage
                      ? Object.keys(usageMap).find((k) => k.endsWith(file.name))
                      : null;

                    const usage =
                      exactUsage || (fuzzyUsage ? usageMap[fuzzyUsage] : []);
                    const isUsed = usage && usage.length > 0;

                    return (
                      <div
                        key={file.name}
                        className="bg-card text-card-foreground flex items-start gap-4 rounded-md border p-2 shadow-sm"
                      >
                        <div className="bg-muted relative h-24 w-24 shrink-0 overflow-hidden rounded-md border">
                          <img
                            src={file.assetUrl}
                            alt={file.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <div className="flex min-w-0 flex-grow flex-col gap-2">
                          <p
                            className="truncate text-sm font-medium"
                            title={file.name}
                          >
                            {file.name}
                          </p>

                          {isUsed ? (
                            <div className="text-muted-foreground text-xs">
                              <span className="text-primary font-semibold">
                                {t("usedBy")}:
                              </span>
                              <ul className="mt-1 max-h-20 list-inside list-disc overflow-y-auto">
                                {usage.map((u, i) => (
                                  <li key={i} className="truncate">
                                    {u.type}: {u.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="w-fit rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
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
                                <AlertDialogTitle>
                                  {t("delete")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("confirmDelete")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
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
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {Object.values(images).flat().length === 0 && !loading && (
        <div className="text-muted-foreground mt-8 text-center">
          <ImageIcon className="mx-auto mb-2 h-12 w-12 opacity-20" />
          <p>{t("noImages")}</p>
          <p className="text-sm">{t("noImagesDescription")}</p>
        </div>
      )}
    </div>
  );
}

export default SettingsCategoryImages;
