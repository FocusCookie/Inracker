import { Player } from "@/types/player";
import { TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Textarea } from "../ui/textarea";

type Props = {
  disabled: boolean;
  player: Player;
  form: any; //TODO: Better type
};

function EditPlayerForm({ disabled, player, form }: Props) {
  const { t } = useTranslation("ComponentEditPlayerDrawer");
  const [picturePreview, setPicturePreview] = useState<string>(
    player?.image || "",
  );
  const [refreshKey, setRefreshKey] = useState<number>(0); // to reset the input type file path after a reset

  useEffect(() => {
    if (!!player) {
      form.reset(player);
    }
  }, [player]);

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

  console.log({ player });

  return (
    <Form {...form} id="test">
      <form className="scroll flex flex-col gap-6 pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
              <FormLabel>{t("icon")}</FormLabel>
              <IconPicker
                initialIcon={player.icon}
                disabled={disabled}
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
                    <Input disabled={disabled} {...field} />
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
                    <Input type="text" disabled={disabled} {...field} />
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
                    <Input type="number" disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_health"
              render={({ field }: { field: any }) => (
                <FormItem className="w-full px-0.5">
                  <FormLabel>{t("health")}</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-start gap-2 pl-1">
            <Avatar className="mt-5">
              <AvatarImage src={picturePreview} alt={t("profilePictureAlt")} />
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
                    disabled={disabled}
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
                <FormDescription>{t("overviewDescription")}</FormDescription>

                <FormControl className="rounded-md border">
                  <Textarea
                    className="scrollable-y overflow-y-scroll rounded pr-0.5"
                    readOnly={disabled}
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
                    className="scrollable-y overflow-y-scroll rounded pr-0.5"
                    readOnly={disabled}
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
  );
}

export default EditPlayerForm;
