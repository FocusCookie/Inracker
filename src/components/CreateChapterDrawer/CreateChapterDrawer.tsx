import { storeImage } from "@/lib/utils";
import { Chapter } from "@/types/chapters";
import { Party } from "@/types/party";
import { Prettify } from "@/types/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
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

type Props = {
  isCreating: boolean;
  open: boolean;
  partyId: Party["id"];
  onOpenChange: (state: boolean) => void;
  onCreate: (chapter: Prettify<Omit<Chapter, "id">>) => void;
};

function CreateChapterDrawer({
  onCreate,
  isCreating,
  partyId,
  open,
  onOpenChange,
}: Props) {
  const { t } = useTranslation("ComponentCreateChapterDrawer");
  const [refreshKey, setRefreshKey] = useState<number>(0); // to reset the input type file path after a reset
  const [picturePreview, setPicturePreview] = useState<string>("");

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("nameValidation"),
    }),
    description: z.string(),
    icon: z.string().emoji(),
    battlemap: z.instanceof(File).or(z.string()),
    encounters: z.array(z.number()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "🧙",
      battlemap: "",
      encounters: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, description, icon, battlemap, encounters } = values;
    let battlemapFilePath: string | null = null;

    if (!!battlemap) {
      battlemapFilePath = await storeImage(battlemap, "battlemaps");
    }

    onCreate({
      name,
      icon,
      description,
      battlemap: battlemapFilePath,
      state: "draft",
      party: partyId,
      encounters,
    });

    form.reset();
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

  return (
    <Drawer
      description={t("titleDescription")}
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      actions={
        <Button
          loading={isCreating}
          disabled={isCreating}
          onClick={form.handleSubmit(onSubmit)}
        >
          {t("create")}
        </Button>
      }
      cancelTrigger={
        <Button disabled={isCreating} variant="ghost">
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
                initialIcon={form.getValues("icon")}
                disabled={isCreating}
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
                      disabled={isCreating}
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
                  <Textarea disabled={isCreating} placeholder="" {...field} />
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

export default CreateChapterDrawer;
