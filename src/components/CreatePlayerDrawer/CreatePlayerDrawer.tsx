import { ImageFolder } from "@/lib/utils";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import { Player } from "@/types/player";
import { Prettify } from "@/types/utils";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { TypographyH2 } from "../ui/typographyh2";
import { ScrollArea } from "../ui/scroll-area";
import { useTranslation } from "react-i18next";
import { createPlayerSchema } from "@/schemas/createPlayer";
import { useCreatePlayer } from "@/hooks/useCreatePlayer";
import { Skills } from "@/types/skills";

type Props = {
  /**
   * disabels the inputs and sets the create button to loading and disables other buttons
   */
  isCreating: boolean;
  open: boolean;
  immunities: DBImmunity[];
  /**
   * A function to store a player image, which takes a picture and a folder and returns the saved file path.
   */
  onStorePlayerImage: (
    picture: File | string,
    folder: ImageFolder,
  ) => Promise<string | undefined>;
  onCreate: (player: Prettify<Omit<Player, "id">>) => void;
  onOpenChange: (state: boolean) => void;
  onCreateImmunity: (immunity: Immunity) => void;
  isCreatingImmunity: boolean;
};

const SKILL_KEYS: (keyof Skills)[] = [
  "acrobatics",
  "arcane",
  "athletics",
  "craftmanship",
  "deception",
  "diplomacy",
  "healing",
  "intimidation",
  "nature",
  "occultism",
  "performance",
  "religion",
  "social",
  "stealth",
  "thievery",
  "survival",
].sort();

function CreatePlayerDrawer({
  isCreating,
  open,
  immunities,
  isCreatingImmunity,
  onCreateImmunity,
  onStorePlayerImage,
  onCreate,
  onOpenChange,
}: Props) {
  const { t } = useTranslation("ComponentCreatePlayerDrawer");
  const {
    form,
    picturePreview,
    refreshKey,
    handleFileChange,
    handleResetPicture,
    selectedImmunities,
    immunitySearch,
    handleAddImmunity,
    handleRemoveImmunity,
    setImmunitySearch,
  } = useCreatePlayer();
  const [isCreateImmunityDrawerOpen, setIsCreateImmunityDrawerOpen] =
    useState<boolean>(false);

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  function handleOpen() {
    onOpenChange(true);
  }

  async function onSubmit(values: z.infer<typeof createPlayerSchema>) {
    const { picture } = values;
    let pictureFilePath: undefined | string = undefined;

    if (!!picture) {
      pictureFilePath = await onStorePlayerImage(picture, "players");
    }

    console.log({ values });
    console.log({ pictureFilePath });

    // @ts-ignore
    onCreate(values);
  }

  return (
    <Drawer
      description={t("descriptionText")}
      open={open}
      onOpenChange={onOpenChange}
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
                <div className="flex flex-col gap-3 pl-0.5 pt-1.5">
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
                        <Input disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
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
                        className="flex-grow"
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
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full px-0.5">
                    <FormLabel>{t("description")}</FormLabel>
                    <FormControl>
                      <Textarea disabled={isCreating} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-4">
              <TypographyH2>{t("attributes")}</TypographyH2>

              <FormField
                control={form.control}
                name="attributes.charisma"
                render={({ field }) => (
                  <FormItem className="w-full px-0.5">
                    <FormLabel>{t("charisma")}</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={isCreating} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attributes.constitution"
                render={({ field }) => (
                  <FormItem className="w-full px-0.5">
                    <FormLabel>{t("constitution")}</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={isCreating} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attributes.dexterity"
                render={({ field }) => (
                  <FormItem className="w-full px-0.5">
                    <FormLabel>{t("dexterity")}</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={isCreating} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attributes.intelligence"
                render={({ field }) => (
                  <FormItem className="w-full px-0.5">
                    <FormLabel>{t("intelligence")}</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={isCreating} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attributes.strength"
                render={({ field }) => (
                  <FormItem className="w-full px-0.5">
                    <FormLabel>{t("strenght")}</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={isCreating} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attributes.wisdom"
                render={({ field }) => (
                  <FormItem className="w-full px-0.5">
                    <FormLabel>{t("wisdom")}</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={isCreating} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-4">
              <TypographyH2>Charakterwerte/Stats</TypographyH2>
              <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                <FormField
                  control={form.control}
                  name="armor"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("armor")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classSg"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("classSg")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ep"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("experience")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
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
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("maxHealth")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perception"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("perception")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movement.air"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("airMovement")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movement.ground"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("groundMovement")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movement.water"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("waterMovement")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movement.highJump"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("highJump")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movement.wideJump"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("wideJump")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span></span>
                <FormField
                  control={form.control}
                  name="savingThrows.reflex"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("reflexSaving")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="savingThrows.thoughness"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("reflexThoughness")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="savingThrows.will"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("reflexWill")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shield.health"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("shieldMaxHealth")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shield.value"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("shieldHealth")}</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isCreating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

            <div className="flex flex-col pb-1">
              <TypographyH2>{t("skills")}</TypographyH2>

              <div className="flex flex-col gap-2">
                {SKILL_KEYS.map((skill, index) => (
                  <FormField
                    key={`skill-${skill}-${index}`}
                    control={form.control}
                    // @ts-expect-error
                    name={`skills.${skill}`}
                    render={({ field }) => (
                      <FormItem className="flex w-full items-center justify-start gap-4 space-y-0 px-0.5">
                        <FormControl>
                          {/*  @ts-expect-error  */}
                          <Input
                            className="w-20"
                            type="number"
                            disabled={isCreating}
                            {...field}
                          />
                        </FormControl>
                        <FormLabel className="mt-0 text-base">
                          {/* @ts-expect-error */}
                          {t(`skillKeys.${skill}`)}
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <div className="mt-4 flex gap-4">
                  <FormField
                    control={form.control}
                    name="custom_skill_1_name"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col px-0.5">
                        <FormLabel className="mt-0 text-base">
                          {t("customName")}
                        </FormLabel>

                        <FormControl>
                          <Input
                            placeholder="Custom"
                            type="text"
                            disabled={isCreating}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills.custom_1"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col px-0.5">
                        <FormLabel className="mt-0 text-base">
                          {t("customValue")}
                        </FormLabel>

                        <FormControl>
                          <Input
                            type="number"
                            disabled={isCreating}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 flex gap-4">
                  <FormField
                    control={form.control}
                    name="custom_skill_2_name"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col px-0.5">
                        <FormLabel className="mt-0 text-base">
                          {t("customName")}
                        </FormLabel>

                        <FormControl>
                          <Input
                            placeholder="Custom"
                            type="text"
                            disabled={isCreating}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills.custom_2"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col px-0.5">
                        <FormLabel className="mt-0 text-base">
                          {t("customValue")}
                        </FormLabel>

                        <FormControl>
                          <Input
                            type="number"
                            disabled={isCreating}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </ScrollArea>
    </Drawer>
  );
}

export default CreatePlayerDrawer;
