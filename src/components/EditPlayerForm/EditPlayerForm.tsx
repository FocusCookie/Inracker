import { Player } from "@/types/player";
import { TrashIcon } from "@radix-ui/react-icons";
import React, { useEffect, useState } from "react";
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
import { MarkdownEditor } from "../MarkdownEditor/MarkdownEditor";
import { ImageSelectionDialog } from "../ImageSelectionDialog/ImageSelectionDialog";
import { Image as ImageIcon } from "lucide-react";

type Props = {
  disabled: boolean;
  player: Player;
  form: any; //TODO: Better type
  children?: React.ReactNode;
};

type EditPlayerFormCompound = React.FC<Props> & {
  Immunities: React.FC<{ children: React.ReactNode }>;
  Resistances: React.FC<{ children: React.ReactNode }>;
  Effects: React.FC<{ children: React.ReactNode }>;
};

const EditPlayerForm: EditPlayerFormCompound = ({
  disabled,
  player,
  form,
  children,
}) => {
  const { t } = useTranslation("ComponentEditPlayerDrawer");
  const [picturePreview, setPicturePreview] = useState<string>(
    player?.image || "",
  );
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState<number>(0); // to reset the input type file path after a reset

  const childrenArray = React.Children.toArray(children);

  const immunitiesChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === EditPlayerForm.Immunities,
  );

  const resistancesChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === EditPlayerForm.Resistances,
  );

  const effectsChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === EditPlayerForm.Effects,
  );

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

  function handleImageSelect(path: string) {
    setPicturePreview(path);
    form.setValue("picture", path);
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

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
                    <Input
                      type="number"
                      disabled={disabled}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
                    />
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
                    <Input
                      type="number"
                      disabled={disabled}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
                    />
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
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsImageSelectorOpen(true)}
                    title="Select existing image"
                    disabled={disabled}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
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

          <div className="flex items-start gap-2 pl-1">
            <FormField
              control={form.control}
              name="gold"
              render={({ field }: { field: any }) => (
                <FormItem className="w-full px-0.5">
                  <FormLabel>{t("gold")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={disabled}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="silver"
              render={({ field }: { field: any }) => (
                <FormItem className="w-full px-0.5">
                  <FormLabel>{t("silver")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={disabled}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="copper"
              render={({ field }: { field: any }) => (
                <FormItem className="w-full px-0.5">
                  <FormLabel>{t("copper")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={disabled}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
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
              name="hero_points"
              render={({ field }: { field: any }) => (
                <FormItem className="w-full px-0.5">
                  <FormLabel>{t("heroPoints")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={3}
                      disabled={disabled}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="overview"
            render={({ field }: { field: any }) => (
              <FormItem className="flex flex-col gap-1 px-0.5">
                <FormLabel>{t("overview")}</FormLabel>
                <FormDescription>{t("overviewDescription")}</FormDescription>

                <FormControl className="rounded-md border">
                  <MarkdownEditor
                    className="scrollable-y overflow-y-scroll rounded pr-0.5"
                    disabled={disabled}
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
                  <MarkdownEditor
                    className="scrollable-y overflow-y-scroll rounded pr-0.5"
                    disabled={disabled}
                    {...field}
                    placeholder="Enter some description"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {immunitiesChild}

        {resistancesChild}

        {effectsChild}
      </form>
      <ImageSelectionDialog
        open={isImageSelectorOpen}
        onOpenChange={setIsImageSelectorOpen}
        onSelect={handleImageSelect}
      />
    </Form>
  );
};

EditPlayerForm.Immunities = ({ children }) => {
  return <>{children}</>;
};
EditPlayerForm.Immunities.displayName = "EditPlayerForm.Immunities";

EditPlayerForm.Resistances = ({ children }) => {
  return <>{children}</>;
};
EditPlayerForm.Resistances.displayName = "EditPlayerForm.Resistances";

EditPlayerForm.Effects = ({ children }) => {
  return <>{children}</>;
};
EditPlayerForm.Effects.displayName = "EditPlayerForm.Effects";

export default EditPlayerForm;

