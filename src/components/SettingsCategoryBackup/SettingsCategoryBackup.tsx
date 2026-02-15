import { useTranslation } from "react-i18next";
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
import { Download, Upload, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TypographyH1 } from "../ui/typographyH1";

function SettingsCategoryBackup() {
  const { t } = useTranslation("ComponentSettingsCategoryBackup");
  const { handleExport, handleImport, isLoading, conflicts, setConflicts } =
    useSettingsBackup();

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
    <div className="flex flex-col gap-4 p-1">
      <TypographyH1>{t("import-export")}</TypographyH1>
      <Card>
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

      <Card>
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
          <DialogFooter>
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
