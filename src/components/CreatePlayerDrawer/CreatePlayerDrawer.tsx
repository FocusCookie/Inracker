import { useCreatePlayer } from "@/hooks/useCreatePlayer";
import { ImageFolder } from "@/lib/utils";
import { createPlayerSchema } from "@/schemas/createPlayer";
import { TrashIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import Drawer from "../Drawer/Drawer";
import IconPicker from "../IconPicker/IconPicker";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
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
import { TypographyH2 } from "../ui/typographyh2";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import { TCreatePlayer } from "@/types/player";
import { Textarea } from "../ui/textarea";

type ImmunitiesRenderProps = {
  selectedImmunities: DBImmunity[];
  isCreating: boolean;
  onAddImmunity: (immunity: DBImmunity) => void;
  onRemoveImmunity: (id: number) => void;
};

type ResistanceRenderProps = {
  selectedResistances: DBResistance[];
  isCreating: boolean;
  onAddResistance: (resistance: DBResistance) => void;
  onRemoveResistance: (id: number) => void;
};

type Props = {
  isCreating: boolean;
  open: boolean;
  isStoringImage: boolean;
  renderImmunitiesCatalog: (props: ImmunitiesRenderProps) => React.ReactNode;
  renderResistancesCatalog: (props: ResistanceRenderProps) => React.ReactNode;
  onCreate: (player: TCreatePlayer) => void;
  onOpenChange: (state: boolean) => void;
  onStoringImage: (
    picture: File | string,
    folder: ImageFolder,
  ) => Promise<string | null>;
};

function CreatePlayerDrawer({
  open,
  isCreating,
  renderImmunitiesCatalog,
  renderResistancesCatalog,
  isStoringImage,
  onCreate,
  onStoringImage,
  onOpenChange,
}: Props) {
  const { t } = useTranslation("ComponentCreatePlayerDrawer");

  const {
    form,
    picturePreview,
    refreshKey,
    selectedImmunities,
    selectedResistances,
    templates,
    handleRemoveResistance: onRemoveResistance,
    handleAddResistance: onAddResistance,
    handleFileChange,
    handleResetPicture,
    handleAddImmunity: onAddImmunity,
    handleRemoveImmunity: onRemoveImmunity,
  } = useCreatePlayer();

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  async function onSubmit(values: z.infer<typeof createPlayerSchema>) {
    const { picture, health } = values;
    let pictureFilePath: null | string = null;

    if (!!picture) {
      pictureFilePath = await onStoringImage(picture, "players");
      console.log({ pictureFilePath });
    }

    onCreate({
      ...values,
      max_health: health,
      effects: [],
      image: pictureFilePath,
    });
  }

  return (
    <Drawer
      description={t("descriptionText")}
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      cancelTrigger={
        <Button disabled={isCreating || isStoringImage} variant="ghost">
          {t("cancel")}
        </Button>
      }
      actions={
        <Button
          loading={isCreating || isStoringImage}
          onClick={form.handleSubmit(onSubmit)}
        >
          {t("create")}
        </Button>
      }
    >
      <ScrollArea>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4">
              <TypographyH2>{t("overview")}</TypographyH2>

              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
                  <FormLabel>{t("icon")}</FormLabel>
                  <IconPicker
                    initialIcon={form.getValues("icon")}
                    disabled={isCreating || isStoringImage}
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
                          disabled={isCreating || isStoringImage}
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
                          disabled={isCreating || isStoringImage}
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
                          disabled={isCreating || isStoringImage}
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
                          disabled={isCreating || isStoringImage}
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
                  <AvatarFallback>
                    {form.watch("name").slice(0, 2)}
                  </AvatarFallback>
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
                        disabled={isCreating || isStoringImage}
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
                        readOnly={isCreating}
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
                        readOnly={isCreating}
                        {...field}
                        placeholder="Enter some description"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between gap-2">
                <TypographyH2>{t("immunities")}</TypographyH2>
                <div className="flex gap-2">
                  {renderImmunitiesCatalog({
                    selectedImmunities,
                    isCreating,
                    onAddImmunity,
                    onRemoveImmunity,
                  })}
                </div>
              </div>
              {selectedImmunities.map((immunity) => (
                <ImmunityCard
                  key={immunity.id}
                  immunity={immunity}
                  actions={
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onRemoveImmunity(immunity.id)}
                    >
                      <TrashIcon />
                    </Button>
                  }
                />
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between gap-2">
                <TypographyH2>{t("resistances")}</TypographyH2>
                <div className="flex gap-2">
                  {renderResistancesCatalog({
                    selectedResistances,
                    isCreating,
                    onAddResistance,
                    onRemoveResistance,
                  })}
                </div>
              </div>

              {selectedResistances.map((resistance) => (
                <ResistanceCard
                  key={resistance.id}
                  resistance={resistance}
                  actions={
                    <Button
                      size="icon"
                      onClick={() => onRemoveResistance(resistance.id)}
                    >
                      <TrashIcon />
                    </Button>
                  }
                />
              ))}
            </div>
          </form>
        </Form>
      </ScrollArea>
    </Drawer>
  );
}

export default CreatePlayerDrawer;
