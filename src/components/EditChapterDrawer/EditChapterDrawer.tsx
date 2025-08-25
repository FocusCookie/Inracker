import { storeImage } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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

import { CancelReason, OverlayMap } from "@/types/overlay";

type OverlayProps = OverlayMap["chapter.edit"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void; // host removes after exit
};

type Props = OverlayProps & RuntimeProps;

function EditChapterDrawer({
  chapter,
  open,
  onOpenChange,
  onExitComplete,
  onComplete,
  onCancel,
  onDelete,
  onEdit,
}: Props) {
  const { t } = useTranslation("ComponentEditChapterDrawer");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0); // to reset the input type file path after a reset
  const [picturePreview, setPicturePreview] = useState<string>(
    chapter?.battlemap || "",
  );
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("nameValidation"),
    }),
    description: z.string(),
    icon: z.string().emoji(),
    battlemap: z.instanceof(File).or(z.string()),
    state: z.enum(["draft", "ongoing", "completed"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "🧙",
      battlemap: "",
      state: "draft",
    },
  });

  useEffect(() => {
    if (chapter) {
      form.reset({
        name: chapter.name,
        description: chapter.description || "",
        icon: chapter.icon,
        battlemap: chapter.battlemap || "",
        state: chapter.state,
      });

      setPicturePreview(chapter?.battlemap || "");
    }
  }, [chapter, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const { name, description, icon, battlemap, state } = values;
      let battlemapFilePath: string | null = null;

      if (!!battlemap) {
        battlemapFilePath = await storeImage(battlemap, "battlemaps");
      }

      const updatedChapter = await onEdit({
        ...chapter,
        name,
        description,
        icon,
        battlemap: battlemapFilePath || chapter.battlemap,
        state,
      });

      form.reset();

      onComplete(updatedChapter);

      setClosingReason("success");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.log("Error while updating a chapter");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancelClick() {
    onCancel?.("cancel");
    setClosingReason("cancel");
    onOpenChange(false);
  }

  function handleOpenChange(state: boolean) {
    if (!state && closingReason === null) {
      onCancel?.("dismissed");
      setClosingReason("dismissed");
    }

    onOpenChange(state);
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

  async function handleDeleteChapter() {
    try {
      await onDelete(chapter.id);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.log("Error while deleting chapter");
    }
  }

  return (
    <Drawer
      onExitComplete={onExitComplete}
      description={t("titleDescription")}
      open={open}
      onOpenChange={handleOpenChange}
      title={t("title")}
      actions={
        <>
          <Button loading={isLoading} onClick={form.handleSubmit(onSubmit)}>
            {t("save")}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                loading={isLoading}
                disabled={isLoading}
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
        <Button
          disabled={isLoading}
          variant="ghost"
          onClick={handleCancelClick}
        >
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
                disabled={isLoading}
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
                      disabled={isLoading}
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
            name="state"
            render={({ field }) => (
              <FormItem className="px-0.5">
                <FormLabel>{t("status")}</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("statusPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">{t("draft")}</SelectItem>
                    <SelectItem value="ongoing">{t("ongoing")}</SelectItem>
                    <SelectItem value="completed">{t("completed")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="px-0.5">
                <FormLabel>{t("description")}</FormLabel>

                <FormControl>
                  <Textarea disabled={isLoading} placeholder="" {...field} />
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

