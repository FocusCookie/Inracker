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
import { Textarea } from "../ui/textarea";
import { TypographyH2 } from "../ui/typographyh2";
import LabelInput from "../LabelInput/LabelInput";

type Props = {
  disabled: boolean;
  form: any;
  children: React.ReactNode;
};

type CreateOpponentDrawerCompound = React.FC<Props> & {
  Immunities: React.FC<{ children: React.ReactNode }>;
  Resistances: React.FC<{ children: React.ReactNode }>;
};

const CreateOpponentForm: CreateOpponentDrawerCompound = ({
  disabled,
  form,
  children,
}) => {
  const { t } = useTranslation("ComponentCreateOpponentForm");
  const [picturePreview, setPicturePreview] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0); // to reset the input type file path after a reset
  const childrenArray = React.Children.toArray(children);

  const immunitiesChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) &&
      child.type === CreateOpponentForm.Immunities,
  );

  const resistancesChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) &&
      child.type === CreateOpponentForm.Resistances,
  );

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

  return (
    <div className="scrollable-y overflow-y-scroll pb-2">
      <Form {...form}>
        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <TypographyH2>{t("createOpponent")}</TypographyH2>
            <div className="flex w-full items-start gap-2">
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
            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="level"
                render={({ field }: { field: any }) => (
                  <FormItem className="w-1/2 px-0.5">
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
                name="maxHealth"
                render={({ field }: { field: any }) => (
                  <FormItem className="w-1/2 px-0.5">
                    <FormLabel>{t("health")}</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={disabled} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="labels"
              render={() => (
                <FormItem className="mb-1.5 w-full px-0.5">
                  <FormControl>
                    <LabelInput
                      control={form.control}
                      name="labels"
                      label={t("labels")}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-start gap-2 pl-1">
              <Avatar className="mt-5">
                <AvatarImage
                  src={picturePreview}
                  alt={t("profilePictureAlt")}
                />
                <AvatarFallback>
                  {form.watch("name").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <FormItem className="mb-1.5 w-full px-0.5">
                <FormLabel>{t("picture")}</FormLabel>
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
              name="details"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-col gap-1 px-0.5">
                  <FormLabel>{t("details")}</FormLabel>
                  <FormDescription>{t("detailsDescription")}</FormDescription>
                  <FormControl className="rounded-md border">
                    <Textarea
                      readOnly={disabled}
                      {...field}
                      placeholder={t("detailsPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {immunitiesChild}
          {resistancesChild}
        </form>
      </Form>
    </div>
  );
};

CreateOpponentForm.Immunities = ({ children }) => {
  return <>{children}</>;
};
CreateOpponentForm.Immunities.displayName = "ChapterLayout.Immunities";

CreateOpponentForm.Resistances = ({ children }) => {
  return <>{children}</>;
};
CreateOpponentForm.Resistances.displayName = "ChapterLayout.Resistances";

export default CreateOpponentForm;
