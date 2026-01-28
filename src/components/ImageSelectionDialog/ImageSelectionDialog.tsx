import { useTranslation } from "react-i18next";
import { useImages } from "@/hooks/useImages";
import { storeImage } from "@/lib/utils";
import { Loader2, Image as ImageIcon, PlusIcon } from "lucide-react";
import Drawer from "../Drawer/Drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imagePath: string) => void;
  onExitComplete?: () => void;
};

export function ImageSelectionDialog({
  open,
  onOpenChange,
  onSelect,
  onExitComplete = () => {},
}: Props) {
  const { t } = useTranslation("ComponentSettingsCategoryImages");
  const { images, folders, loading, refresh: fetchImages } = useImages();
  const [currentTab, setCurrentTab] = useState<string>("others");
  const [uploadFolder, setUploadFolder] = useState<string>("others");

  useEffect(() => {
    if (folders.length > 0 && !folders.includes(currentTab)) {
      setCurrentTab(folders[0]);
    } else if (folders.length === 0 && !loading) {
      setCurrentTab("others");
    }
  }, [folders, loading]);

  useEffect(() => {
    if (folders.includes(currentTab)) {
      setUploadFolder(currentTab);
    }
  }, [currentTab, folders]);

  const handleSelect = (assetUrl: string) => {
    onSelect(assetUrl);
    onOpenChange(false);
  };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    await storeImage(file, uploadFolder);
    await fetchImages();
    setCurrentTab(uploadFolder);
  }

  const currentImages = images[currentTab] || [];

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      onExitComplete={onExitComplete}
      title={t("selectImage") as string}
      description={t("selectImageDescription") as string}
      cancelTrigger={<Button variant="ghost">{t("cancel") as string}</Button>}
      actions={
        <div className="flex w-full flex-1 items-center gap-2">
          <div className="w-full grow">
            <Select value={uploadFolder} onValueChange={setUploadFolder}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t("selectFolder")} />
              </SelectTrigger>

              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem
                    key={folder}
                    value={folder}
                    className="capitalize"
                  >
                    {t(`folders.${folder}` as any) || folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            type="file"
            accept="image/*"
            className="hidden"
            id="dialog-image-upload"
            onChange={handleUpload}
          />

          <Button asChild variant="outline">
            <label htmlFor="dialog-image-upload" className="cursor-pointer">
              <PlusIcon className="mr-2 h-4 w-4" /> {t("uploadImage")}
            </label>
          </Button>
        </div>
      }
    >
      <div className="flex h-[600px] gap-4 pr-1">
        <div className="flex h-fit w-1/3 flex-col gap-1 rounded-md bg-neutral-50 p-4">
          {folders.map((folder) => (
            <Button
              key={folder}
              variant={currentTab === folder ? "default" : "ghost"}
              className={cn(
                "w-full justify-start capitalize",
                currentTab === folder ? "" : "text-neutral-600",
              )}
              onClick={() => setCurrentTab(folder)}
            >
              {t(`folders.${folder}` as any) || folder} (
              {images[folder]?.length || 0})
            </Button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : currentImages.length === 0 ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center">
              <ImageIcon className="mb-2 h-12 w-12 opacity-20" />
              <p>
                No images found in{" "}
                {t(`folders.${currentTab}` as any) || currentTab}.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap content-start gap-2">
              {currentImages.map((file) => (
                <button
                  key={file.name}
                  className="group bg-muted hover:ring-primary focus-visible:ring-ring relative h-24 w-24 cursor-pointer overflow-hidden rounded-md border transition-all hover:ring-2 focus-visible:ring-2 focus-visible:outline-hidden"
                  onClick={() => handleSelect(file.assetUrl)}
                  type="button"
                >
                  <img
                    src={file.assetUrl}
                    alt={file.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <p className="truncate">{file.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

