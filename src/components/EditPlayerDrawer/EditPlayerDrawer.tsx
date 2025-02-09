import { ImageFolder } from "@/lib/utils";
import { editPlayerSchema } from "@/schemas/editPlayer";
import { Player } from "@/types/player";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import Drawer from "../Drawer/Drawer";
import IconPicker from "../IconPicker/IconPicker";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";

type Props = {
  player: Player;
  isUpdating: boolean;
  open: boolean;
  isStoringImage: boolean;
  onUpdate: (player: Player) => void;
  onOpenChange: (state: boolean) => void;
  onStoringImage: (
    picture: File | string,
    folder: ImageFolder,
  ) => Promise<string | null>;
};

function EditPlayerDrawer({
  player,
  open,
  isUpdating,
  isStoringImage,
  onUpdate,
  onStoringImage,
  onOpenChange,
}: Props) {
  const { t } = useTranslation("ComponentEditPlayerDrawer");
  const [picturePreview, setPicturePreview] = useState<string>(
    player?.image || "",
  );
  const [refreshKey, setRefreshKey] = useState<number>(0); // to reset the input type file path after a reset

  const formSchema = editPlayerSchema;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...player, maxHealth: player.max_health },
  });

  function handleResetPicture() {
    form.setValue("picture", "");
    setRefreshKey((c) => c + 1);
    setPicturePreview("");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    const file = event.target.files[0];

    if (file) {
      setPicturePreview(URL.createObjectURL(file));
      form.setValue("picture", file);
    }
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  async function onSubmit(values: z.infer<typeof editPlayerSchema>) {
    if (player) {
      const {
        picture,
        health,
        details,
        ep,
        icon,
        id,
        level,
        name,
        overview,
        role,
      } = values;
      let pictureFilePath: null | string = null;

      //TODO: Delete the old picture file if it exists

      if (!!picture) {
        pictureFilePath = await onStoringImage(picture, "players");
        console.log({ pictureFilePath });
      }

      onUpdate({
        ...player,
        details,
        ep,
        icon,
        id,
        level,
        name,
        overview,
        role,
        max_health: health,
        image: pictureFilePath,
      });
    }
  }

  console.log({ player });

  return (
    <Drawer
      description="Edit the player as you need."
      open={open}
      onOpenChange={onOpenChange}
      title={`${t("update")} ${player?.name}`}
      cancelTrigger={
        <Button disabled={isUpdating || isStoringImage} variant="ghost">
          {t("cancel")}
        </Button>
      }
      actions={
        <Button
          loading={isUpdating || isStoringImage}
          onClick={form.handleSubmit(onSubmit)}
        >
          {t("save")}
        </Button>
      }
    >
      <ScrollArea>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6 pt-4"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
                  <FormLabel>{t("icon")}</FormLabel>
                  <IconPicker
                    initialIcon={form.getValues("icon")}
                    disabled={isUpdating || isStoringImage}
                    onIconClick={handleIconSelect}
                  />
                  <FormMessage />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("name")}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isUpdating || isStoringImage}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("role")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isUpdating || isStoringImage}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-start gap-2 pl-1">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("level")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isUpdating || isStoringImage}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxHealth"
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("health")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isUpdating || isStoringImage}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-start gap-2 pl-1">
                <Avatar className="mt-5">
                  <AvatarImage
                    src={picturePreview}
                    alt={t("profilePictureAlt")}
                  />
                  <AvatarFallback>{form.watch("name")}</AvatarFallback>
                </Avatar>

                <FormItem className="mb-1.5 w-full px-0.5">
                  <FormLabel>{t("playerPicture")}</FormLabel>
                  <FormControl>
                    <div className="flex w-full gap-2">
                      <Input
                        key={`refresh-key-${refreshKey}`}
                        className="grow"
                        onChange={handleFileChange}
                        type="file"
                        disabled={isUpdating || isStoringImage}
                        placeholder={t("picturePlaceholder")}
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
              </div>

              <FormField
                control={form.control}
                name="overview"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-col gap-1 px-0.5">
                    <FormLabel>{t("overview")}</FormLabel>
                    <FormDescription>
                      {t("overviewDescription")}
                    </FormDescription>

                    <FormControl className="rounded-md border">
                      <Textarea
                        readOnly={isUpdating}
                        {...field}
                        placeholder="Enter some Overview"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="details"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-col gap-1 px-0.5">
                    <FormLabel>{t("details")}</FormLabel>
                    <FormDescription>{t("detailsDescription")}</FormDescription>

                    <FormControl className="rounded-md border">
                      <Textarea
                        readOnly={isUpdating}
                        {...field}
                        placeholder="Enter some description"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </ScrollArea>
    </Drawer>
  );
}

export default EditPlayerDrawer;
