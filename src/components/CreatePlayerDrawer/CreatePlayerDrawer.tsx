import { ImageFolder } from "@/lib/utils";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import { Player } from "@/types/player";
import { Prettify } from "@/types/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { TypographyH2 } from "../ui/typographyh2";

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
  onCreatImmunity: (immunity: Immunity) => void;
  isCreatingImmunity: boolean;
};

function CreatePlayerDrawer({
  isCreating,
  open,
  immunities,
  isCreatingImmunity,
  onCreatImmunity,
  onStorePlayerImage,
  onCreate,
  onOpenChange,
}: Props) {
  const [picturePreview, setPicturePreview] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0); // to reset the input type file path after a reset
  const [isCreateImmunityDrawerOpen, setIsCreateImmunityDrawerOpen] =
    useState<boolean>(false);
  const [immunitySearchTerm, setImmunitySearchTerm] = useState<string>("");
  const [selectedImmunites, setSelectedImmunites] = useState<DBImmunity[]>([]);

  const formSchema = z.object({
    armor: z.number(),
    attributes: z.object({
      constitution: z.number(),
      charisma: z.number(),
      dexterity: z.number(),
      intelligence: z.number(),
      strength: z.number(),
      wisdom: z.number(),
    }),
    classSg: z.number(),
    ep: z.number(),
    description: z.string(),
    health: z.number(),
    maxHealth: z.number(),
    icon: z.string().emoji(),
    immunities: z.array(z.number()),
    level: z.number(),
    movement: z.object({
      air: z.number(),
      ground: z.number(),
      highJump: z.number(),
      water: z.number(),
      wideJump: z.number(),
    }),
    name: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    perception: z.number(),
    role: z.string().min(3, {
      message: "The role or class must be at least 3 characters.",
    }),
    savingThrows: z.object({
      reflex: z.number(),
      will: z.number(),
      thoughness: z.number(),
    }),
    shield: z.object({
      value: z.number(),
      health: z.number(),
    }),
    picture: z.instanceof(File).or(z.string()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      armor: 10,
      attributes: {
        charisma: 10,
        constitution: 10,
        dexterity: 10,
        intelligence: 10,
        strength: 10,
        wisdom: 10,
      },
      classSg: 10,
      description: "",
      ep: 0,
      health: 10,
      level: 1,
      maxHealth: 10,
      movement: { air: 0, ground: 8, highJump: 1.5, water: 6, wideJump: 1.5 },
      name: "",
      icon: "🧙",
      immunities: [],
      perception: 10,
      picture: "",
      role: "",
      savingThrows: { reflex: 10, thoughness: 10, will: 10 },
      shield: { health: 0, value: 0 },
    },
  });

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  function handleOpen() {
    onOpenChange(true);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    const file = event.target.files[0];

    if (file) {
      setPicturePreview(URL.createObjectURL(file));
      form.setValue("picture", file);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { picture } = values;
    let pictureFilePath: undefined | string = undefined;

    if (!!picture) {
      pictureFilePath = await onStorePlayerImage(picture, "players");
    }

    console.log({ values });
    console.log({ pictureFilePath });

    onCreate(values);
  }

  function handleResetPicture() {
    form.setValue("picture", "");
    setRefreshKey((c) => c + 1);
    setPicturePreview("");
  }

  function handleAddImmunity(immunity: DBImmunity) {
    setSelectedImmunites((c) => [...c, immunity]);
  }

  function handleRemoveImmunity(id: DBImmunity["id"]) {
    setSelectedImmunites((c) => c.filter((immunity) => immunity.id !== id));
  }

  return (
    <Drawer
      description="Create a new player and add the player to the group."
      open={open}
      onOpenChange={onOpenChange}
      title={"Add player to Party"}
      createTrigger={
        <Button onClick={handleOpen} variant="ghost" size="iconLarge">
          <RiUserAddFill />
        </Button>
      }
      cancelTrigger={<Button variant="ghost">Cancel</Button>}
      actions={
        <Button
          loading={isCreating}
          disabled={isCreating}
          onClick={form.handleSubmit(onSubmit)}
        >
          create player
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
                  <FormLabel>Icon</FormLabel>
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
                      <FormLabel>Name</FormLabel>
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
                      <FormLabel>Role/Class</FormLabel>
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
                    alt="Profile picture of the player"
                  />
                  <AvatarFallback>
                    {form.watch("name").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <FormItem className="mb-1.5 w-full px-0.5">
                  <FormLabel>Player Picture</FormLabel>
                  <FormControl>
                    <div className="flex w-full gap-2">
                      <Input
                        key={`refresh-key-${refreshKey}`}
                        className="flex-grow"
                        onChange={handleFileChange}
                        type="file"
                        disabled={isCreating}
                        placeholder="Upload picture"
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea disabled={isCreating} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-4">
              <TypographyH2>Attributes</TypographyH2>
              <FormField
                control={form.control}
                name="attributes.charisma"
                render={({ field }) => (
                  <FormItem className="w-full px-0.5">
                    <FormLabel>Charisma</FormLabel>
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
                    <FormLabel>Constitution</FormLabel>
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
                    <FormLabel>Dexterity</FormLabel>
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
                    <FormLabel>Intelligence</FormLabel>
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
                    <FormLabel>Strenght</FormLabel>
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
                    <FormLabel>Wisdom</FormLabel>
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
                      <FormLabel>Armor</FormLabel>
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
                      <FormLabel>Class SG</FormLabel>
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
                      <FormLabel>Experience</FormLabel>
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
                      <FormLabel>Level</FormLabel>
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
                      <FormLabel>Max. Health</FormLabel>
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
                      <FormLabel>Perception</FormLabel>
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
                      <FormLabel>Air Movement</FormLabel>
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
                      <FormLabel>Ground Movement</FormLabel>
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
                      <FormLabel>Water Movement</FormLabel>
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
                      <FormLabel>High Jump Range</FormLabel>
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
                      <FormLabel>Wide Jump Range</FormLabel>
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
                      <FormLabel>Reflex Saving</FormLabel>
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
                      <FormLabel>Reflex Thoughness</FormLabel>
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
                      <FormLabel>Reflex Will</FormLabel>
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
                      <FormLabel>Shield Max. Health</FormLabel>
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
                      <FormLabel>Shield Health</FormLabel>
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
                <TypographyH2>Immunities</TypographyH2>
                <div className="flex gap-2">
                  <Button
                    disabled={isCreatingImmunity}
                    onClick={() => setIsCreateImmunityDrawerOpen((c) => !c)}
                  >
                    Create
                  </Button>

                  <CreateImmunityDrawer
                    open={isCreateImmunityDrawerOpen}
                    onOpenChange={setIsCreateImmunityDrawerOpen}
                    isCreating={isCreatingImmunity}
                    onCreate={onCreatImmunity}
                  />

                  {immunities.length > 0 && (
                    <Catalog
                      disabled={isCreatingImmunity}
                      triggerName="add"
                      title={"Immunities"}
                      description={
                        "Select some existing immunities for the character."
                      }
                      onSearchChange={setImmunitySearchTerm}
                      children={
                        <ScrollArea className="h-full">
                          <div className="flex h-full flex-col gap-4 p-0.5 pr-4">
                            {immunities
                              .filter((immunity) =>
                                immunity.name
                                  .toLowerCase()
                                  .includes(immunitySearchTerm.toLowerCase()),
                              )
                              .filter(
                                (immunity) =>
                                  !selectedImmunites.some(
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
              {selectedImmunites.map((immunity) => (
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
              <TypographyH2>Resistances</TypographyH2>
              to enter
            </div>

            <div className="flex flex-col gap-4">
              <TypographyH2>Skills</TypographyH2>
              to enter
            </div>
          </form>
        </Form>
      </ScrollArea>
    </Drawer>
  );
}

export default CreatePlayerDrawer;
