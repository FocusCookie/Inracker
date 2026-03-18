import { TrashIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
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
  form: any;
  children: React.ReactNode;
};

type CreateNPCDrawerCompound = React.FC<Props> & {
  Immunities: React.FC<{ children: React.ReactNode }>;
  Resistances: React.FC<{ children: React.ReactNode }>;
  Weaknesses: React.FC<{ children: React.ReactNode }>;
  Effects: React.FC<{ children: React.ReactNode }>;
};

const CreateNPCForm: CreateNPCDrawerCompound = ({
  disabled,
  form,
  children,
}) => {
  const { t } = useTranslation("ComponentCreateNPCDrawer");
  const [picturePreview, setPicturePreview] = useState<string>("");
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState<number>(0); // to reset the input type file path after a reset
  const childrenArray = React.Children.toArray(children);

  React.useEffect(() => {
    const image = form.getValues("image");
    if (typeof image === "string" && image) {
      setPicturePreview(image);
    }
  }, [form]);

  const immunitiesChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) &&
      child.type === CreateNPCForm.Immunities,
  );

  const resistancesChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) &&
      child.type === CreateNPCForm.Resistances,
  );

  const weaknessesChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) &&
      child.type === CreateNPCForm.Weaknesses,
  );

  const effectsChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === CreateNPCForm.Effects,
  );

  function handleResetPicture() {
    form.setValue("image", "");
    setRefreshKey((c) => c + 1);
    setPicturePreview("");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    const file = event.target.files[0];

    if (file) {
      setPicturePreview(URL.createObjectURL(file));
      form.setValue("image", file);
    }
  }

  function handleImageSelect(path: string) {
    setPicturePreview(path);
    form.setValue("image", path);
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
              <FormLabel>{t("icon")}</FormLabel>
              <IconPicker
                initialIcon={form.getValues("icon")}
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
                  <FormLabel>{t("maxHealth")}</FormLabel>
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
              <AvatarFallback>{form.watch("name").slice(0, 2)}</AvatarFallback>
            </Avatar>

            <FormItem className="mb-1.5 w-full px-0.5">
              <FormLabel>{t("npcPicture")}</FormLabel>
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

          <FormField
            control={form.control}
            name="details"
            render={({ field }: { field: any }) => (
              <FormItem className="flex flex-col gap-1 px-0.5">
                <FormLabel>{t("details")}</FormLabel>
                <FormDescription>{t("detailsDescription")}</FormDescription>

                <FormControl className="rounded-md border">
                  <MarkdownEditor
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

        {weaknessesChild}

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

CreateNPCForm.Immunities = ({ children }) => {
  return <>{children}</>;
};
CreateNPCForm.Immunities.displayName = "NPCForm.Immunities";

CreateNPCForm.Resistances = ({ children }) => {
  return <>{children}</>;
};
CreateNPCForm.Resistances.displayName = "NPCForm.Resistances";

CreateNPCForm.Weaknesses = ({ children }) => {
  return <>{children}</>;
};
CreateNPCForm.Weaknesses.displayName = "NPCForm.Weaknesses";

CreateNPCForm.Effects = ({ children }) => {
  return <>{children}</>;
};
CreateNPCForm.Effects.displayName = "NPCForm.Effects";

export default CreateNPCForm;
