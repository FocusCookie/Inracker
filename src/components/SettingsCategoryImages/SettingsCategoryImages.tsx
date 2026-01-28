import { useMemo, useState } from "react";
import defaultDb from "@/lib/database";
import { BaseDirectory, remove } from "@tauri-apps/plugin-fs";
import { createFolder } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { TypographyH1 } from "../ui/typographyH1";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { Trash2, Image as ImageIcon, PlusIcon } from "lucide-react";
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
import { Input } from "../ui/input";

import { useAllPlayers } from "@/hooks/usePlayers";
import { useOpponents } from "@/hooks/useOpponents";
import { useChapters } from "@/hooks/useChapters";
import { useEncounters } from "@/hooks/useEncounters";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import { useImages, ImageFile } from "@/hooks/useImages";

type Props = {
  database?: typeof defaultDb;
};

type UsageMap = Record<string, { type: string; name: string }[]>;

function SettingsCategoryImages({ database = defaultDb }: Props) {
  const { t } = useTranslation("ComponentSettingsCategoryImages");
  const { images, folders, loading, refresh: fetchImages } = useImages();
  const [newFolderName, setNewFolderName] = useState("");

  const players = useAllPlayers(database);
  const opponents = useOpponents(database);
  const chapters = useChapters(database);
  const encounters = useEncounters(database);

  const encounterOpponents = useQueryWithToast({
    queryKey: ["all-encounter-opponents"],
    queryFn: () => database.encounterOpponents.getAllDetailed(),
  });

  const usageMap: UsageMap = useMemo(() => {
    const map: UsageMap = {};

    const addToMap = (
      imagePath: string | null | undefined,
      type: string,
      name: string,
    ) => {
      if (!imagePath) return;

      if (!map[imagePath]) {
        map[imagePath] = [];
      }
      map[imagePath].push({ type, name });
    };

    players.data?.forEach((p) =>
      addToMap(p.image, t("folders.players" as any), p.name),
    );

    opponents.data?.forEach((o) =>
      addToMap(o.image, t("folders.opponents" as any), o.name),
    );

    chapters.data?.forEach((c) => {
      addToMap(c.battlemap, t("folders.chapters" as any), c.name);
    });

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
      const relativePath = `images/${file.folder}/${file.name}`;

      await remove(relativePath, { baseDir: BaseDirectory.AppData });

      toast({ title: t("deleteSuccess") });
      fetchImages();
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

  async function handleCreateFolder() {
    if (!newFolderName) return;
    try {
      await createFolder(newFolderName);
      toast({ title: t("folderCreated") });
      setNewFolderName("");
      fetchImages();
    } catch (error) {
      console.error("Create folder failed", error);
      toast({ variant: "destructive", title: t("folderCreateError") });
    }
  }

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
              <AlertDialogFooter className="flex gap-4">
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

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder={t("newFolderPlaceholder")}
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
        <Button onClick={handleCreateFolder}>
          <PlusIcon className="mr-2 h-4 w-4" /> {t("createFolder")}
        </Button>
      </div>

      <Accordion type="multiple" className="w-full">
        {folders.map((folder) => {
          const folderImages = images[folder] || [];

          return (
            <AccordionItem value={folder} key={folder}>
              <AccordionTrigger className=" ">
                {t(`folders.${folder}` as any) || folder} ({folderImages.length})
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

                        <div className="flex min-w-0 grow flex-col gap-2">
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
                              <AlertDialogFooter className="flex gap-4">
                                <AlertDialogCancel>
                                  {t("cancel")}
                                </AlertDialogCancel>
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
