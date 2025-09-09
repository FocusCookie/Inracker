import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Encounter } from "@/types/encounter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ChangeEvent, useState } from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import IconPicker from "../IconPicker/IconPicker";
import OpponentCard from "../OpponentCard/OpponentCard";
import { EncounterOpponent, Opponent } from "@/types/opponents";
import type { CancelReason, OverlayMap } from "@/types/overlay";
import { useCreateEncounter } from "@/hooks/useCreateEncounter";
import Drawer from "../Drawer/Drawer";
import db from "@/lib/database";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import { TCreateEncounter } from "@/schemas/createEncounter";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { Token } from "@/types/tokens";
import { useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEncounterStore } from "@/stores/useEncounterStore";
import { useShallow } from "zustand/shallow";

type OverlayProps = OverlayMap["encounter.create"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};
type Props = OverlayProps & RuntimeProps;

function CreateEncounterDrawer({
  open,
  onOpenChange,
  onExitComplete,
  onCreate,
  onComplete,
  onCancel,
}: Props) {
  const { t } = useTranslation("ComponentCreateEncounterDrawer");
  const queryClient = useQueryClient();
  const openOverlay = useOverlayStore((s) => s.open);
  const [type, setType] = useState<Encounter["type"]>("note");
  const [isCreating, setIsCreating] = useState(false);
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);
  const form = useCreateEncounter();
  const { chapterId } = useSearch({ from: "/play/" });

  const { setCurrentColor, setCurrentIcon, setCurrenTitle } = useEncounterStore(
    useShallow((state) => ({
      setCurrentColor: state.setCurrentColor,
      setCurrentIcon: state.setCurrentIcon,
      setCurrenTitle: state.setCurrentTitle,
    })),
  );

  const opponents = useQueryWithToast({
    queryKey: ["opponents"],
    queryFn: () => db.opponents.getAllDetailed(),
  });

  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "difficulties",
  });

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
    setCurrentIcon(icon);
  }

  async function onSubmit(values: TCreateEncounter) {
    try {
      setIsCreating(true);

      //TODO: fix the ts issue because here the color and icon is only to pass it to the parent which makes use of it for the element
      // @ts-ignore
      const created = await onCreate(values);

      onComplete(created);
      setClosingReason("success");
      onOpenChange(false);

      form.reset();
    } finally {
      setIsCreating(false);
    }
  }

  function handleCancelation() {
    setClosingReason("cancel");
    onCancel?.("cancel");
    onOpenChange(false);
    form.reset();
  }

  function handleOpenChange(state: boolean) {
    if (!state && closingReason === null) {
      onCancel?.("dismissed");
      setClosingReason("dismissed");
    }

    onOpenChange(state);
  }

  function handleAddDifficulty() {
    append({ description: "New Difficulty", value: 99 });
  }

  function handleTypeChange(value: "roll" | "note" | "fight") {
    form.setValue("type", value);
    setType(value);
  }

  const handleRemoveOpponent = (id: EncounterOpponent["id"]) => {
    const currentOpponents = form.getValues("opponents") || [];
    const updatedOpponents = currentOpponents.filter(
      (opponentId: number) => opponentId !== id,
    );
    form.setValue("opponents", updatedOpponents);
  };

  function handleCreateOpponent() {
    openOverlay("opponent.create", {
      onCreate: async (opponent) => {
        const createdOpponent = await db.opponents.create(opponent);

        if (chapterId === null)
          throw new Error(
            "Chapter id is missing in creating the token for the opponent",
          );

        const token: Omit<Token, "id"> = {
          type: "opponent",
          // @ts-ignore
          entity: createdOpponent.id,
          coordinates: { x: 0, y: 0 },
          chapter: chapterId,
        };

        await db.tokens.create(token);

        return createdOpponent;
      },
      onComplete: (opponent) => {
        const currentOpponents = form.getValues("opponents") || [];
        form.setValue("opponents", [...currentOpponents, opponent.id]);
        opponents.refetch();

        queryClient.invalidateQueries({ queryKey: ["opponents"] });
        queryClient.invalidateQueries({ queryKey: ["tokens"] });
      },
      onCancel: (reason) => {
        console.log("Opponent creation cancelled:", reason);
      },
    });
  }

  /*
  function handleOpenOpponentsCatalog() {
    openOverlay("opponent.catalog", {
      onSelect: async (opponent) => {
        const currentOpponents = form.getValues("opponents") || [];
        form.setValue("opponents", [...currentOpponents, opponent.id]);
      },
      onCancel: (reason) => {
        console.log("Opponent catalog cancelled:", reason);
      },
    });
  }
  */

  const selectedOpponents =
    form
      .watch("opponents")
      ?.map((id: number) => opponents.data?.find((op) => op.id === id))
      .filter((opponent): opponent is Opponent => opponent !== undefined) || [];

  function handleColorChange(value: string) {
    form.setValue("color", value);
    setCurrentColor(value);
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    console.log({ value });

    form.setValue("name", value);
    setCurrenTitle(value);
  }

  return (
    <Drawer
      open={open}
      noBackgdrop
      onOpenChange={handleOpenChange}
      onExitComplete={onExitComplete}
      title={t("title")}
      description={t("drawerDescription")}
      actions={
        <Button disabled={isCreating} onClick={form.handleSubmit(onSubmit)}>
          {t("createButton")}
        </Button>
      }
      cancelTrigger={
        <Button
          disabled={isCreating}
          variant="ghost"
          onClick={handleCancelation}
        >
          {t("cancel")}
        </Button>
      }
    >
      <div className="scrollable-y grow overflow-y-scroll pr-0.5">
        <div className="flex w-full grow flex-col gap-4 overflow-hidden">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="flex w-full gap-2 px-0.5">
                <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
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
                    <FormItem className="w-full grow px-0.5">
                      <FormLabel>{t("name")}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isCreating}
                          placeholder={t("namePlaceholder")}
                          {...field}
                          onChange={handleTitleChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex w-full gap-2 px-0.5">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="flex grow flex-col gap-1 pt-1.5">
                      <FormLabel>{t("color")}</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={handleColorChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("white")} />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="#ffffff">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-white"></span>
                                {t("white")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#f44336">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-red-500"></span>
                                {t("red")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#ff9800">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-orange-500"></span>
                                {t("orange")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#ffc107">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-amber-500"></span>
                                {t("amber")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#ffeb3b">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-yellow-500"></span>
                                {t("yellow")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#cddc39">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-lime-500"></span>
                                {t("lime")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#4caf50">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-green-500"></span>
                                {t("green")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#10b981">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-emerald-500"></span>
                                {t("emerald")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#009688">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-teal-500"></span>
                                {t("teal")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#00bcd4">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-cyan-500"></span>
                                {t("cyan")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#0ea5e9">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-sky-500"></span>
                                {t("sky")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#2196f3">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-blue-500"></span>
                                {t("blue")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#3f51b5">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-indigo-500"></span>
                                {t("indigo")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#8b5cf6">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-violet-500"></span>
                                {t("violet")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#9c27b0">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-purple-500"></span>
                                {t("purple")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#d946ef">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-fuchsia-500"></span>
                                {t("fuchsia")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#e91e63">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-pink-500"></span>
                                {t("pink")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#f43f5e">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-rose-500"></span>
                                {t("rose")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#64748b">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-slate-500"></span>
                                {t("slate")}
                              </div>
                            </SelectItem>

                            <SelectItem value="#9e9e9e">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded bg-gray-500"></span>
                                {t("gray")}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(type === "roll" || type === "fight") && (
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel>{t("experience")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={isCreating}
                            {...field}
                            onChange={(e) => {
                              const parsedValue = e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined;
                              field.onChange(parsedValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full px-0.5">
                    <FormLabel>{t("description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isCreating}
                        placeholder={t("descriptionPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-1">
                <FormLabel>{t("type")}</FormLabel>

                <Tabs
                  onValueChange={(v) =>
                    handleTypeChange(v as "roll" | "note" | "fight")
                  }
                  defaultValue="note"
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 gap-2">
                    <TabsTrigger
                      className="hover:cursor-pointer hover:bg-white/80"
                      value="note"
                    >
                      {t("note")}
                    </TabsTrigger>

                    <TabsTrigger
                      className="hover:cursor-pointer hover:bg-white/80"
                      value="roll"
                    >
                      {t("roll")}
                    </TabsTrigger>

                    <TabsTrigger
                      className="hover:cursor-pointer hover:bg-white/80"
                      value="fight"
                    >
                      {t("fight")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="roll"
                    className="flex flex-col gap-4 py-4"
                  >
                    <div className="flex gap-2 px-0.5">
                      <div className="flex flex-col gap-1">
                        <FormLabel>{t("dice")}</FormLabel>

                        <FormField
                          control={form.control}
                          name="dice"
                          render={({ field }) => (
                            <FormItem className="flex flex-col gap-1 px-0.5">
                              <FormControl>
                                <Select
                                  value={field.value?.toString()}
                                  onValueChange={(val) =>
                                    field.onChange(val ? +val : undefined)
                                  }
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue
                                      placeholder={t("selectDice")}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="2">D2</SelectItem>
                                    <SelectItem value="4">D4</SelectItem>
                                    <SelectItem value="6">D6</SelectItem>
                                    <SelectItem value="8">D8</SelectItem>
                                    <SelectItem value="10">D10</SelectItem>
                                    <SelectItem value="12">D12</SelectItem>
                                    <SelectItem value="20">D20</SelectItem>
                                    <SelectItem value="100">D100</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="skill"
                        render={({ field }) => (
                          <FormItem className="flex w-full flex-col gap-1 px-0.5">
                            <FormLabel>{t("skill")}</FormLabel>

                            <FormControl>
                              <Input
                                disabled={isCreating}
                                placeholder={t("skillPlaceholder")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-col items-start gap-2 px-0.5">
                      <FormLabel>{t("difficulties")}</FormLabel>

                      {fields.map((field, index) => (
                        <div className="flex w-full gap-2" key={field.id}>
                          <Controller
                            control={form.control}
                            name={`difficulties.${index}.value`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min={1}
                                max={100}
                                className="w-20"
                                onChange={(e) =>
                                  field.onChange(e.target.valueAsNumber)
                                }
                              />
                            )}
                          />

                          <Controller
                            control={form.control}
                            name={`difficulties.${index}.description`}
                            render={({ field }) => (
                              <Input {...field} type="text" className="grow" />
                            )}
                          />

                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <TrashIcon />
                          </Button>
                        </div>
                      ))}
                      <div className="flex w-full justify-center">
                        <Button
                          type="button"
                          onClick={handleAddDifficulty}
                          variant="secondary"
                        >
                          {t("addDifficulty")}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="fight">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2 pt-4">
                        <FormLabel>{t("opponents")}</FormLabel>
                        <div className="flex gap-4 p-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCreateOpponent}
                          >
                            {t("createOpponent")}
                          </Button>

                          <Button
                            type="button"
                            // onClick={handleOpenOpponentsCatalog}
                          >
                            {t("catalog")}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        {selectedOpponents.map(
                          (opponent: EncounterOpponent) => (
                            <OpponentCard
                              key={`encounter-opponent-${opponent.id}`}
                              opponent={opponent}
                              onRemove={handleRemoveOpponent}
                              onEdit={undefined}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Drawer>
  );
}

export default CreateEncounterDrawer;
