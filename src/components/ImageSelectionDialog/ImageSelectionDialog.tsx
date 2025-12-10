import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useImages } from "@/hooks/useImages";
import { IMAGE_FOLDERS } from "@/lib/utils";
import { Loader2, Image as ImageIcon } from "lucide-react";
import Drawer from "../Drawer/Drawer";
import { Button } from "../ui/button";

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
  const { images, loading } = useImages();

  const handleSelect = (assetUrl: string) => {
    onSelect(assetUrl);
    onOpenChange(false);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      onExitComplete={onExitComplete}
      title={t("selectImage") as string}
      description={t("selectImageDescription") as string}
      cancelTrigger={<Button variant="ghost">{t("cancel") as string}</Button>}
    >
      <div className="pr-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Tabs
            defaultValue={IMAGE_FOLDERS[0]}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <TabsList className="mb-2 flex h-auto w-full justify-start">
              {IMAGE_FOLDERS.map((folder) => (
                <TabsTrigger key={folder} value={folder} className="capitalize">
                  {t(`folders.${folder}`) || folder} ({images[folder].length})
                </TabsTrigger>
              ))}
            </TabsList>

            {IMAGE_FOLDERS.map((folder) => {
              const folderImages = images[folder];
              return (
                <TabsContent
                  key={folder}
                  value={folder}
                  className="mt-0 flex-1 overflow-y-auto pr-4"
                  tabIndex={-1}
                >
                  {folderImages.length === 0 ? (
                    <div className="text-muted-foreground mt-8 text-center">
                      <ImageIcon className="mx-auto mb-2 h-12 w-12 opacity-20" />
                      <p>
                        No images found in {t(`folders.${folder}`) || folder}.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 p-1 md:grid-cols-4 lg:grid-cols-5">
                      {folderImages.map((file) => (
                        <button
                          key={file.name}
                          className="group bg-muted hover:ring-primary focus-visible:ring-ring relative cursor-pointer overflow-hidden rounded-md border transition-all hover:ring-2 focus-visible:ring-2 focus-visible:outline-hidden"
                          onClick={() => handleSelect(file.assetUrl)}
                          type="button"
                        >
                          <img
                            src={file.assetUrl}
                            alt={file.name}
                            className="h-32 w-full object-cover object-right transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            <p className="truncate">{file.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </Drawer>
  );
}
