import { useCreatePlayer } from "@/hooks/useCreatePlayer";
import { ImageFolder } from "@/lib/utils";
import { createPlayerSchema } from "@/schemas/createPlayer";
import { useImmunityStore } from "@/stores/ImmunitiesState";
import { usePlayerStore } from "@/stores/PlayersState";
import { useResistancesStore } from "@/stores/ResistancesState";
import "@/styles/markdownEditor.css";
import "@mdxeditor/editor/style.css";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RiUserAddFill } from "react-icons/ri";
import { z } from "zod";
import Catalog from "../Catalog/Catalog";
import CreateImmunityDrawer from "../CreateImmunityDrawer/CreateImmunityDrawer";
import CreateResistanceDrawer from "../CreateResistanceDrawer/CreateResistanceDrawer";
import Drawer from "../Drawer/Drawer";
import IconPicker from "../IconPicker/IconPicker";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import MarkdownEditor from "../MarkdownEditor/MarkdownEditor";
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

type Props = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
};

function CreatePlayerDrawer({ open, onOpenChange }: Props) {
  const { t } = useTranslation("ComponentCreatePlayerDrawer");
  const { createPlayer, setIsCreateDrawerOpen, storePlayerImage } =
    usePlayerStore();
  const isCreating = usePlayerStore((state) => state.isCreating);
  const isStoringImage = usePlayerStore((state) => state.isStoringImage);
  //TODO: change to single selection with state.prop
  const {
    immunities,
    isCreating: isCreatingImmunity,
    isCreateDrawerOpen: isCreateImmunityDrawerOpen,
    setIsCreateDrawerOpen: setIsCreateImmunityDrawerOpen,
    getAllImmunities,
  } = useImmunityStore();

  const {
    resistances,
    isCreating: isCreatingResistance,
    isCreateDrawerOpen: isCreateResistanceDrawerOpen,
    setIsCreateDrawerOpen: setIsCreateResistanceDrawerOpen,
    getAllResistances,
  } = useResistancesStore();

  const {
    form,
    picturePreview,
    refreshKey,
    immunitySearch,
    selectedImmunities,
    resistanceSearch,
    selectedResistances,
    templates,
    handleRemoveResistance,
    handleAddResistance,
    setResistanceSearch,
    handleFileChange,
    handleResetPicture,
    handleAddImmunity,
    handleRemoveImmunity,
    setImmunitySearch,
  } = useCreatePlayer();

  useEffect(() => {
    getAllImmunities();
    getAllResistances();
  }, []);

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  function handleOpen() {
    setIsCreateDrawerOpen(true);
  }

  async function onSubmit(values: z.infer<typeof createPlayerSchema>) {
    const { picture, health } = values;
    let pictureFilePath: undefined | string = undefined;

    if (!!picture) {
      pictureFilePath = await storePlayerImage(picture, "players");
    }

    createPlayer({
      ...values,
      max_health: health,
      effects: [],
      image: pictureFilePath || null,
    });
  }

  return (
    <Drawer
      description={t("descriptionText")}
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      cancelTrigger={
        <Button disabled={isCreating || isCreatingImmunity} variant="ghost">
          {t("cancel")}
        </Button>
      }
      actions={
        <Button
          loading={isCreating}
          disabled={isCreatingImmunity}
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
                      <MarkdownEditor
                        readonly={isCreating}
                        {...field}
                        markdown={templates.overview}
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
                  <Button
                    variant="secondary"
                    disabled={isCreating || isCreatingImmunity}
                    loading={isCreatingImmunity}
                    onClick={() =>
                      setIsCreateImmunityDrawerOpen(!isCreateImmunityDrawerOpen)
                    }
                  >
                    {t("create")}
                  </Button>

                  <CreateImmunityDrawer />

                  {immunities.length > 0 && (
                    <Catalog
                      placeholder={t("immunityCatalog.placeholder")}
                      trigger={<Button>{t("select")}</Button>}
                      title={t("immunityCatalog.title")}
                      description={t("immunityCatalog.descriptionText")}
                      onSearchChange={setImmunitySearch}
                    >
                      {immunities
                        .filter((immunity) =>
                          immunity.name
                            .toLowerCase()
                            .includes(immunitySearch.toLowerCase()),
                        )
                        .filter(
                          (immunity) =>
                            !selectedImmunities.some(
                              (selected) => selected.id === immunity.id,
                            ),
                        )
                        .map((immunity) => (
                          <ImmunityCard
                            key={immunity.id}
                            immunity={immunity}
                            actions={
                              <Button
                                size="icon"
                                onClick={() => handleAddImmunity(immunity)}
                              >
                                <PlusIcon />
                              </Button>
                            }
                          />
                        ))}
                    </Catalog>
                  )}
                </div>
              </div>

              {selectedImmunities.map((immunity) => (
                <ImmunityCard
                  key={immunity.id}
                  immunity={immunity}
                  actions={
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImmunity(immunity.id)}
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
                  <Button
                    variant="secondary"
                    disabled={isCreating || isCreatingResistance}
                    loading={isCreatingResistance}
                    onClick={() =>
                      setIsCreateResistanceDrawerOpen(
                        !isCreateResistanceDrawerOpen,
                      )
                    }
                  >
                    {t("create")}
                  </Button>

                  <CreateResistanceDrawer />

                  {resistances.length > 0 && (
                    <Catalog
                      placeholder={t("resistanceCatalog.placeholder")}
                      trigger={<Button>{t("select")}</Button>}
                      title={t("resistanceCatalog.title")}
                      description={t("resistanceCatalog.descriptionText")}
                      onSearchChange={setResistanceSearch}
                    >
                      {resistances
                        .filter((resistance) =>
                          resistance.name
                            .toLowerCase()
                            .includes(resistanceSearch.toLowerCase()),
                        )
                        .filter(
                          (resistance) =>
                            !selectedResistances.some(
                              (selected) => selected.id === resistance.id,
                            ),
                        )
                        .map((resistance) => (
                          <ResistanceCard
                            key={resistance.id}
                            resistance={resistance}
                            actions={
                              <Button
                                size="icon"
                                onClick={() => handleAddResistance(resistance)}
                              >
                                <PlusIcon />
                              </Button>
                            }
                          />
                        ))}
                    </Catalog>
                  )}
                </div>
              </div>

              {selectedResistances.map((resistance) => (
                <ResistanceCard
                  key={resistance.id}
                  resistance={resistance}
                  actions={
                    <Button
                      size="icon"
                      onClick={() => handleRemoveResistance(resistance.id)}
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
