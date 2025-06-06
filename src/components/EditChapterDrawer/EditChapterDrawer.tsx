import { storeImage } from "@/lib/utils";
import { Chapter } from "@/types/chapters";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import Drawer from "../Drawer/Drawer";
import IconPicker from "../IconPicker/IconPicker";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
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

type Props = {
  chapter: Chapter | null;
  loading: boolean;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onSave: (chapter: Chapter) => void;
  onDelete: (chapterId: Chapter["id"]) => void;
};

function EditChapterDrawer({
  onSave,
  chapter,
  loading,
  open,
  onOpenChange,
  onDelete,
}: Props) {
  const { t } = useTranslation("ComponentEditChapterDrawer");
  const [refreshKey, setRefreshKey] = useState<number>(0); // to reset the input type file path after a reset
  const [picturePreview, setPicturePreview] = useState<string>(
    chapter?.battlemap || "",
  );

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("nameValidation"),
    }),
    description: z.string(),
    icon: z.string().emoji(),
    battlemap: z.instanceof(File).or(z.string()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "🧙",
      battlemap: "",
    },
  });

  useEffect(() => {
    if (chapter) {
      form.reset({
        name: chapter.name,
        description: chapter.description || "",
        icon: chapter.icon,
        battlemap: chapter.battlemap || "",
      });

      setPicturePreview(chapter?.battlemap || "");
    }
  }, [chapter, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (chapter) {
      const { name, description, icon, battlemap } = values;
      let battlemapFilePath: string | null = null;

      if (!!battlemap) {
        battlemapFilePath = await storeImage(battlemap, "battlemaps");
      }

      onSave({
        ...chapter,
        name,
        description,
        icon,
        battlemap: battlemapFilePath || chapter.battlemap,
      });

      form.reset();
    }
  }

  function handleResetPicture() {
    form.setValue("battlemap", "");
    setRefreshKey((c) => c + 1);
    setPicturePreview("");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    const file = event.target.files[0];

    if (file) {
      setPicturePreview(URL.createObjectURL(file));
      form.setValue("battlemap", file);
    }
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  function handleDeleteChapter() {
    if (chapter) {
      onDelete(chapter.id);
      form.reset();
      onOpenChange(false);
    }
  }

  return (
    <Drawer
      description={t("titleDescription")}
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      actions={
        <>
          <Button loading={loading} onClick={form.handleSubmit(onSubmit)}>
            {t("save")}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                loading={loading}
                disabled={loading}
              >
                {t("delete")}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteNote")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-4">
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteChapter}>
                  {t("yesDelete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
      cancelTrigger={
        <Button disabled={loading} variant="ghost">
          {t("cancel")}
        </Button>
      }
    >
      <div className="scrollable-y overflow-y-scroll pr-0.5">
        <Form {...form}>
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
              <FormLabel>{t("icon")}</FormLabel>
              <IconPicker
                initialIcon={chapter?.icon}
                disabled={loading}
                onIconClick={handleIconSelect}
              />
              <FormMessage />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full px-0.5">
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder={t("namePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="px-0.5">
                <FormLabel>{t("description")}</FormLabel>

                <FormControl>
                  <Textarea disabled={loading} placeholder="" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem className="mb-1.5 w-full px-0.5">
            <FormLabel>{t("battlemap")}</FormLabel>
            <FormControl>
              <div className="flex w-full gap-2">
                <Input
                  key={`refresh-key-${refreshKey}`}
                  className="grow"
                  onChange={handleFileChange}
                  type="file"
                  disabled={false}
                  placeholder={t("battlemapPlaceholder")}
                  accept="image/*"
                />

                {!!picturePreview && (
                  <Button
                    type="button"
                    onClick={handleResetPicture}
                    variant="destructive"
                    size="icon"
                  >
                    <TrashIcon />
                  </Button>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>

          {picturePreview !== "" && (
            <img
              className="max-h-96 w-full overflow-hidden rounded-md object-cover"
              src={picturePreview}
              alt="battlemap"
            />
          )}
        </Form>
      </div>
    </Drawer>
  );
}

export default EditChapterDrawer;
