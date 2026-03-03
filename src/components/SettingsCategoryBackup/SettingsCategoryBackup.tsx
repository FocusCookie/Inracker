import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettingsBackup } from "@/hooks/useSettingsBackup";
import Loader from "@/components/Loader/Loader";
import { Download, Upload, AlertTriangle, ListFilter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TypographyH1 } from "../ui/typographyH1";
import { SelectableExportDialog } from "./SelectableExportDialog";
import { useAllPlayers } from "@/hooks/usePlayers";
import { useChapters } from "@/hooks/useChapters";
import { useOpponents } from "@/hooks/useOpponents";
import { useEffects } from "@/hooks/useEffects";
import { useWeaknesses } from "@/hooks/useWeaknesses";
import { useImmunities } from "@/hooks/useImmunities";
import { useResistances } from "@/hooks/useResistances";

function SettingsCategoryBackup() {
  const { t } = useTranslation("ComponentSettingsCategoryBackup");
  const {
    handleExport,
    handleImport,
    handleExportCategory,
    handleImportCategory,
    getAssets,
    isLoading,
    conflicts,
    setConflicts,
  } = useSettingsBackup();

  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectionItems, setSelectionItems] = useState<any[]>([]);

  const players = useAllPlayers();
  const chapters = useChapters();
  const opponents = useOpponents();
  const effects = useEffects();
  const weaknesses = useWeaknesses();
  const immunities = useImmunities();
  const resistances = useResistances();

  const categories = [
    {
      id: "players",
      label: t("exportPlayers"),
      data: players.data,
      map: (p: any) => ({
        id: p.id,
        label: p.name,
        icon: p.icon,
        sublabel: p.role,
      }),
    },
    {
      id: "chapters",
      label: t("exportChapters"),
      data: chapters.data,
      map: (c: any) => ({
        id: c.id,
        label: c.name,
        icon: c.icon,
        sublabel: c.description,
      }),
    },
    {
      id: "opponents",
      label: t("exportOpponents"),
      data: opponents.data,
      map: (o: any) => ({
        id: o.id,
        label: o.name,
        icon: o.icon,
        sublabel: `Level ${o.level}`,
      }),
    },
    {
      id: "effects",
      label: t("exportEffects"),
      data: effects.data,
      map: (e: any) => ({
        id: e.id,
        label: e.name,
        icon: e.icon,
        sublabel: e.type,
      }),
    },
    {
      id: "weaknesses",
      label: t("exportWeaknesses"),
      data: weaknesses.data,
      map: (w: any) => ({ id: w.id, label: w.name, icon: w.icon }),
    },
    {
      id: "immunities",
      label: t("exportImmunities"),
      data: immunities.data,
      map: (i: any) => ({ id: i.id, label: i.name, icon: i.icon }),
    },
    {
      id: "resistances",
      label: t("exportResistances"),
      data: resistances.data,
      map: (r: any) => ({ id: r.id, label: r.name, icon: r.icon }),
    },
    { id: "images", label: t("exportImages"), isAsset: true },
    { id: "audio", label: t("exportAudio"), isAsset: true },
  ];

  const handleOpenSelection = async (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;

    setActiveCategory(catId);
    if (cat.isAsset) {
      const assets = await getAssets(catId as "images" | "audio");
      setSelectionItems(assets.map((a) => ({ id: a, label: a })));
    } else {
      setSelectionItems((cat.data || []).map(cat.map!));
    }
    setSelectionDialogOpen(true);
  };

  const downloadConflicts = () => {
    if (!conflicts) return;
    const blob = new Blob([JSON.stringify(conflicts, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conflicts.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <Loader />
        <p className="text-muted-foreground">{t("processing")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-1 pb-10">
      <TypographyH1>{t("import-export")}</TypographyH1>

      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
        <CardContent className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t("backupFolderNotice", { folderName: "inracker-backup" })}
          </p>
        </CardContent>
      </Card>

      <Card className="flex flex-col gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t("export")}
          </CardTitle>
          <CardDescription>{t("exportDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} className="w-full">
            {t("export")}
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />

            {t("categorizedBackup")}
          </CardTitle>

          <CardDescription>{t("categorizedExportDescription")}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-2 rounded-lg border p-3"
              >
                <span className="text-sm font-semibold">{category.label}</span>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleExportCategory(category.id)}
                  >
                    {t("export")} (Full)
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenSelection(category.id)}
                  >
                    <ListFilter className="mr-1 h-3 w-3" />

                    {t("selectSpecific")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SelectableExportDialog
        open={selectionDialogOpen}
        onOpenChange={setSelectionDialogOpen}
        title={categories.find((c) => c.id === activeCategory)?.label || ""}
        items={selectionItems}
        onExport={(ids) => handleExportCategory(activeCategory, ids)}
        isLoading={isLoading}
      />

      <Card className="flex flex-col gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t("import")}
          </CardTitle>
          <CardDescription>{t("importDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleImport("restore")}
              variant="destructive"
              className="w-full"
            >
              {t("restore")}
            </Button>
            <p className="text-muted-foreground text-xs">
              {t("restoreDescription")}
            </p>
          </div>

          <div className="bg-muted h-px w-full" />

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleImport("merge")}
              variant="secondary"
              className="w-full"
            >
              {t("merge")}
            </Button>
            <p className="text-muted-foreground text-xs">
              {t("mergeDescription")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t("categorizedImport")}
          </CardTitle>
          <CardDescription>{t("categorizedImportDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button
            onClick={() => handleImportCategory("restore")}
            variant="destructive"
            className="w-full"
          >
            {t("restore")}
          </Button>
          <Button
            onClick={() => handleImportCategory("merge")}
            variant="secondary"
            className="w-full"
          >
            {t("merge")}
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={!!conflicts}
        onOpenChange={(open) => !open && setConflicts(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              {t("conflictsDetected")}
            </DialogTitle>
            <DialogDescription>{t("conflictsDescription")}</DialogDescription>
          </DialogHeader>
          <div className="bg-muted max-h-60 overflow-y-auto rounded-md p-4">
            <pre className="text-xs">{JSON.stringify(conflicts, null, 2)}</pre>
          </div>
          <DialogFooter className="flex gap-4">
            <Button onClick={downloadConflicts} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t("downloadConflicts")}
            </Button>

            <Button onClick={() => setConflicts(null)}>{t("close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SettingsCategoryBackup;
