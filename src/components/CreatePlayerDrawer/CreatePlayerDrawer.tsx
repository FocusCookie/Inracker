import { ImageFolder } from "@/lib/utils";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { RiUserAddFill } from "react-icons/ri";
import { z } from "zod";
import Catalog from "../Catalog/Catalog";
import CreateImmunityDrawer from "../CreateImmunityDrawer/CreateImmunityDrawer";
import Drawer from "../Drawer/Drawer";
import IconPicker from "../IconPicker/IconPicker";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
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
import { TypographyH2 } from "../ui/typographyh2";
import { ScrollArea } from "../ui/scroll-area";
import { useTranslation } from "react-i18next";
import { createPlayerSchema } from "@/schemas/createPlayer";
import { useCreatePlayer } from "@/hooks/useCreatePlayer";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  headingsPlugin,
  imagePlugin,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { DBResistance, Resistance } from "@/types/resistances";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import CreateResistanceDrawer from "../CreateResistanceDrawer/CreateResistanceDrawer";
import { usePlayerStore } from "@/stores/PlayerState";

type Props = {
  immunities: DBImmunity[];
  resistances: DBResistance[];
  isCreatingImmunity: boolean;
  isCreatingResistance: boolean;
  /**
   * A function to store a player image, which takes a picture and a folder and returns the saved file path.
   */
  onStorePlayerImage: (
    picture: File | string,
    folder: ImageFolder,
  ) => Promise<string | undefined>;
  onCreateImmunity: (immunity: Immunity) => void;
  onCreateResistance: (resistance: Resistance) => void;
};

function CreatePlayerDrawer({
  immunities,
  isCreatingImmunity,
  resistances,
  isCreatingResistance,
  onCreateResistance,
  onCreateImmunity,
  onStorePlayerImage,
}: Props) {
  const { t } = useTranslation("ComponentCreatePlayerDrawer");
  const {
    createPlayer,
    isCreateDrawerOpen,
    isCreating,
    setIsCreateDrawerOpen,
  } = usePlayerStore();

  const {
    form,
    picturePreview,
    refreshKey,
    immunitySearch,
    selectedImmunities,
    details,
    overview,
    resistanceSearch,
    selectedResistances,
    handleRemoveResistance,
    handleAddResistance,
    setResistanceSearch,
    handleDetailsChange,
    handleOverviewChange,
    handleFileChange,
    handleResetPicture,
    handleAddImmunity,
    handleRemoveImmunity,
    setImmunitySearch,
  } = useCreatePlayer();
  const [isCreateImmunityDrawerOpen, setIsCreateImmunityDrawerOpen] =
    useState<boolean>(false);
  const [isCreateResistanceDrawerOpen, setIsCreateResistanceDrawerOpen] =
    useState<boolean>(false);

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
      pictureFilePath = await onStorePlayerImage(picture, "players");
    }

    createPlayer({
      ...values,
      maxHealth: health,
      effects: [],
      image: pictureFilePath || null,
    });
  }

  return (
    <Drawer
      description={t("descriptionText")}
      open={isCreateDrawerOpen}
      onOpenChange={setIsCreateDrawerOpen}
      title={t("title")}
      createTrigger={
        <Button onClick={handleOpen} variant="ghost" size="iconLarge">
          <RiUserAddFill />
        </Button>
      }
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-4">
              <TypographyH2>Overview</TypographyH2>

              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-3 pt-1.5 pl-0.5">
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
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("name")}</FormLabel>
                      <FormControl>
                        <Input disabled={isCreating} {...field} />
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
                        <Input type="text" disabled={isCreating} {...field} />
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
                        <Input type="number" disabled={isCreating} {...field} />
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
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-start gap-2 pl-1">
                <Avatar className="mt-6">
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
                        disabled={isCreating}
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
                  <FormItem className="px-0.5">
                    <FormLabel>{t("overview")}</FormLabel>
                    <FormDescription>
                      {t("overviewDescription")}
                    </FormDescription>

                    <FormControl className="rounded-md border">
                      <MDXEditor
                        disabled={isCreating}
                        {...field}
                        contentEditableClassName="prose"
                        markdown={overview}
                        onChange={handleOverviewChange}
                        plugins={[
                          linkPlugin(),
                          linkDialogPlugin(),
                          imagePlugin(),
                          listsPlugin(),
                          thematicBreakPlugin(),
                          headingsPlugin(),
                          tablePlugin(),
                          toolbarPlugin({
                            toolbarContents: () => (
                              <>
                                <UndoRedo />
                                <BlockTypeSelect />
                                <BoldItalicUnderlineToggles />
                                <CreateLink />
                                <InsertImage />
                                <ListsToggle />
                                <InsertThematicBreak />
                                <InsertTable />
                              </>
                            ),
                          }),
                          markdownShortcutPlugin(),
                        ]}
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
                  <FormItem className="px-0.5">
                    <FormLabel>Details</FormLabel>
                    <FormDescription>
                      {t("overviewDescription")}
                    </FormDescription>

                    <FormControl className="rounded-md border">
                      <MDXEditor
                        disabled={isCreating}
                        {...field}
                        contentEditableClassName="prose"
                        markdown={details}
                        onChange={handleDetailsChange}
                        plugins={[
                          linkPlugin(),
                          linkDialogPlugin(),
                          imagePlugin(),
                          listsPlugin(),
                          thematicBreakPlugin(),
                          headingsPlugin(),
                          tablePlugin(),
                          toolbarPlugin({
                            toolbarContents: () => (
                              <>
                                <UndoRedo />
                                <BlockTypeSelect />
                                <BoldItalicUnderlineToggles />
                                <CreateLink />
                                <InsertImage />
                                <ListsToggle />
                                <InsertThematicBreak />
                                <InsertTable />
                              </>
                            ),
                          }),
                          markdownShortcutPlugin(),
                        ]}
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
                    disabled={isCreating || isCreatingImmunity}
                    loading={isCreatingImmunity}
                    onClick={() => setIsCreateImmunityDrawerOpen((c) => !c)}
                  >
                    {t("create")}
                  </Button>

                  <CreateImmunityDrawer
                    open={isCreateImmunityDrawerOpen}
                    onOpenChange={setIsCreateImmunityDrawerOpen}
                    isCreating={isCreatingImmunity}
                    onCreate={onCreateImmunity}
                  />

                  {immunities.length > 0 && (
                    <Catalog
                      disabled={isCreatingImmunity}
                      triggerName={t("add")}
                      title={t("immunityCatalog.title")}
                      description={t("immunityCatalog.descriptionText")}
                      onSearchChange={setImmunitySearch}
                      children={
                        <ScrollArea className="h-full">
                          <div className="flex h-full flex-col gap-4 p-0.5 pr-4">
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
                                      onClick={() =>
                                        handleAddImmunity(immunity)
                                      }
                                    >
                                      <PlusIcon />
                                    </Button>
                                  }
                                />
                              ))}
                          </div>
                        </ScrollArea>
                      }
                    />
                  )}
                </div>
              </div>

              {selectedImmunities.map((immunity) => (
                <ImmunityCard
                  key={immunity.id}
                  immunity={immunity}
                  actions={
                    <Button
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
                    disabled={isCreating || isCreatingResistance}
                    loading={isCreatingResistance}
                    onClick={() => setIsCreateResistanceDrawerOpen((c) => !c)}
                  >
                    {t("create")}
                  </Button>

                  <CreateResistanceDrawer
                    open={isCreateResistanceDrawerOpen}
                    onOpenChange={setIsCreateResistanceDrawerOpen}
                    isCreating={isCreatingResistance}
                    onCreate={onCreateResistance}
                  />

                  {resistances.length > 0 && (
                    <Catalog
                      disabled={isCreatingResistance}
                      triggerName={t("add")}
                      title={t("resistanceCatalog.title")}
                      description={t("resistanceCatalog.descriptionText")}
                      onSearchChange={setResistanceSearch}
                      children={
                        <ScrollArea className="h-full">
                          <div className="flex h-full flex-col gap-4 p-0.5 pr-4">
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
                                      onClick={() =>
                                        handleAddResistance(resistance)
                                      }
                                    >
                                      <PlusIcon />
                                    </Button>
                                  }
                                />
                              ))}
                          </div>
                        </ScrollArea>
                      }
                    />
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
