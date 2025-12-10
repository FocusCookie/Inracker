import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import Drawer from "../Drawer/Drawer";
import IconPicker from "../IconPicker/IconPicker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { CancelReason, OverlayMap } from "@/types/overlay";
import { Encounter } from "@/types/encounter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TrashIcon, CheckIcon } from "@radix-ui/react-icons";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import { EncounterOpponent, Opponent } from "@/types/opponents";
import OpponentCard from "../OpponentCard/OpponentCard";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { Token } from "@/types/tokens";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { InfoIcon } from "lucide-react";
import {
  useCreateMultipleEncounterOpponents,
  useDeleteEncounterOpponent,
} from "@/hooks/useEncounterOpponents";

type OverlayProps = OverlayMap["encounter.edit"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void; // host removes after exit
};

type Props = OverlayProps & RuntimeProps;

function EditEncounterDrawer({
  encounter,
  open,
  onOpenChange,
  onExitComplete,
  onComplete,
  onCancel,
  onDelete,
  onEdit,
}: Props) {
  const { t } = useTranslation("ComponentEditEncounterDrawer");
  const queryClient = useQueryClient();
  const openOverlay = useOverlayStore((s) => s.open);
  const { chapterId } = useSearch({ from: "/play/" });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [type, setType] = useState<Encounter["type"]>("note");
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);
  const [encounterOpponentsToAttache, setEncounterOpponentsToAttache] =
    useState<Array<Omit<Encounter, "id">>>([]);

  const createMultipleEncounterOpponents =
    useCreateMultipleEncounterOpponents(db);
  const deleteEncounterOpponent = useDeleteEncounterOpponent(db);

  const opponentsQuery = useQueryWithToast({
    queryKey: ["opponents"],
    queryFn: () => db.opponents.getAllDetailed(),
  });

  const encounterOpponentsQuery = useQueryWithToast({
    queryKey: ["encounter-opponents"],
    queryFn: () => db.encounterOpponents.getAllDetailed(),
  });

  const formSchema = z.object({
    name: z.string().min(2, { message: t("nameValidation") }),
    description: z.string(),
    icon: z.string().emoji(),
    color: z.string(),
    type: z.enum(["note", "roll", "fight"]),
    experience: z.number().optional(),
    dice: z.number().optional(),
    skill: z.string().optional(),
    difficulties: z
      .array(z.object({ value: z.number(), description: z.string() }))
      .optional(),
    opponents: z.array(z.number()).optional(),
    completed: z.boolean().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: encounter.name,
      description: encounter.description || "",
      icon: encounter.element.icon,
      color: encounter.element.color,
      type: encounter.type,
      experience: encounter.experience || 0,
      dice: encounter.dice || 20,
      skill: encounter.skill || "",
      difficulties: [],
      opponents: [],
      completed: encounter.completed || false,
    },
  });

  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "difficulties",
  });

  useEffect(() => {
    if (encounter) {
      form.reset({
        name: encounter.name,
        description: encounter.description || "",
        icon: encounter.element.icon,
        color: encounter.element.color,
        type: encounter.type,
        experience: encounter.experience || 0,
        dice: encounter.dice || undefined,
        skill: encounter.skill || "",
        difficulties: encounter.difficulties || [],
        opponents: encounter.opponents || [],
        completed: encounter.completed || false,
      });
      setType(encounter.type);
    }
  }, [encounter, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const existingEncounterOpponents = encounter.opponents || [];
      // Map opponents to include blueprint ID
      const opponentsToCreate = encounterOpponentsToAttache.map((opp: any) => ({
        ...opp,
        blueprint: opp.id,
      }));

      const newEncounterOpponents =
        await createMultipleEncounterOpponents.mutateAsync(opponentsToCreate);

      const updatedEncounter = await onEdit({
        ...encounter,
        ...values,
        opponents: [
          ...existingEncounterOpponents,
          //@ts-ignore
          ...newEncounterOpponents.map(
            (encOpp: EncounterOpponent) => encOpp.id,
          ),
        ],
        element: {
          ...encounter.element,
          icon: values.icon,
          color: values.color,
        },
      });

      if (onComplete) onComplete(updatedEncounter);

      setClosingReason("success");
      onOpenChange(false);

      form.reset();
    } catch (error) {
      console.log("Error while updating an encounter", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancelClick() {
    onCancel?.("cancel");
    setClosingReason("cancel");
    onOpenChange(false);
  }

  function handleOpenChange(state: boolean) {
    if (!state && closingReason === null) {
      onCancel?.("dismissed");
      setClosingReason("dismissed");
    }
    onOpenChange(state);
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  async function handleDeleteEncounter() {
    try {
      setIsLoading(true);
      await onDelete(encounter.id);

      if (onComplete) onComplete(encounter);

      setClosingReason("success");
      onOpenChange(false);

      form.reset();
    } catch (error) {
      console.log("Error while deleting encounter", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddDifficulty() {
    append({ description: "New Difficulty", value: 99 });
  }

  function handleTypeChange(value: "roll" | "note" | "fight") {
    form.setValue("type", value);
    setType(value);
  }

  function handleRemoveEncounterOpponentToAttache(index: number) {
    setEncounterOpponentsToAttache((current) =>
      current.filter((_, encOpIndex) => encOpIndex !== index),
    );
  }

  async function handleRemoveOpponent(id: EncounterOpponent["id"]) {
    const currentOpponents = form.getValues("opponents") || [];
    const updatedOpponents = currentOpponents.filter(
      (opponentId: number) => opponentId !== id,
    );

    await deleteEncounterOpponent.mutateAsync(id);

    form.setValue("opponents", updatedOpponents);

    const formValues = form.getValues();

    try {
      setIsLoading(true);

      const updatedEncounter = await onEdit({
        ...encounter,
        ...formValues,
        opponents: updatedOpponents, // Make sure to use the just-updated list
        element: {
          ...encounter.element,
          icon: formValues.icon,
          color: formValues.color,
        },
      });

      if (onComplete) onComplete(updatedEncounter);
    } catch (error) {
      console.error("Failed to remove opponent from encounter", error);
      form.setValue("opponents", currentOpponents); // Revert on error
    } finally {
      setIsLoading(false);
    }
  }

  function handleCreateOpponent() {
    openOverlay("opponent.create", {
      onCreate: async (opponent) => {
        const createdOpponent = await db.opponents.create(opponent);
        const encounterOpponent = await db.encounterOpponents.create({
          ...createdOpponent,
          blueprint: createdOpponent.id,
        });

        if (chapterId === null)
          throw new Error(
            "Chapter id is missing in creating the token for the opponent",
          );

        const token: Omit<Token, "id"> = {
          type: "opponent",
          entity: encounterOpponent.id,
          coordinates: { x: 0, y: 0 },
          chapter: Number(chapterId),
        };

        await db.tokens.create(token);

        return encounterOpponent;
      },
      onComplete: (opponent) => {
        const currentOpponents = form.getValues("opponents") || [];

        form.setValue("opponents", [...currentOpponents, opponent.id]);
        opponentsQuery.refetch();
        queryClient.invalidateQueries({ queryKey: ["opponents"] });
        queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
        queryClient.invalidateQueries({ queryKey: ["tokens"] });
      },
      onCancel: (reason) => {
        console.log("Opponent creation cancelled:", reason);
      },
    });
  }

  const selectedOpponents =
    form
      .watch("opponents")
      ?.map((id: number) =>
        encounterOpponentsQuery.data?.find((op) => op.id === id),
      )
      .filter((opponent): opponent is Opponent => opponent !== undefined) || [];

  function handleOpenOpponentsCatalog() {
    openOverlay("opponent.catalog", {
      database: db,
      onSelect: async (selectedOpponent: Opponent) => {
        setEncounterOpponentsToAttache((current) => [
          ...current,
          selectedOpponent,
        ]);
      },
      onCancel: (reason) => {
        console.log("Opponent catalog cancelled:", reason);
      },
    });
  }

  return (
    <Drawer
      modal={false}
      onExitComplete={onExitComplete}
      description={t("titleDescription")}
      open={open}
      onOpenChange={handleOpenChange}
      title={t("title")}
      actions={
        <>
          <Button onClick={form.handleSubmit(onSubmit)}>{t("save")}</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isLoading}>
                {t("delete")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteNote")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-4">
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEncounter}>
                  {t("yesDelete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
      cancelTrigger={
        <Button
          disabled={isLoading}
          variant="ghost"
          onClick={handleCancelClick}
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
                    disabled={isLoading}
                    onIconClick={handleIconSelect}
                  />
                  <FormMessage />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grow px-0.5">
                      <FormLabel>{t("name")}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder={t("namePlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="completed"
                  render={({ field }) => (
                    <FormItem className="flex w-40 flex-col gap-1 px-0.5 pt-1.5">
                      <FormLabel>{t("completionState")}</FormLabel>
                      <FormControl>
                        <Button
                          type="button"
                          variant={field.value ? "success" : "outline"}
                          className="w-full"
                          onClick={() => field.onChange(!field.value)}
                        >
                          <CheckIcon />
                          {field.value ? t("completed") : t("open")}
                        </Button>
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
                          onValueChange={(val) => field.onChange(val)}
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
                            disabled={isLoading}
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
                        disabled={isLoading}
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
                  value={type}
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
                                disabled={isLoading}
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
                            onClick={handleOpenOpponentsCatalog}
                            type="button"
                          >
                            {t("catalog")}
                          </Button>
                        </div>
                      </div>

                      <Alert>
                        <InfoIcon />
                        <AlertTitle>{t("encounterOpponents")}</AlertTitle>
                        <AlertDescription>
                          {t("encounterOpponentsDescription")}
                        </AlertDescription>
                      </Alert>

                      <div className="flex flex-col gap-4">
                        {selectedOpponents.map(
                          (opponent: EncounterOpponent) => (
                            <div
                              key={`encounter-opponent-${opponent.id}`}
                              className="flex items-center gap-2"
                            >
                              <div className="grow">
                                <OpponentCard
                                  opponent={opponent}
                                  onRemove={handleRemoveOpponent}
                                  onEdit={undefined}
                                />
                              </div>
                            </div>
                          ),
                        )}

                        {encounterOpponentsToAttache.map(
                          (opponent: EncounterOpponent, index: number) => (
                            <div
                              key={`encounter-opponent-to-attache-${index}`}
                              className="flex items-center gap-2"
                            >
                              <div className="grow">
                                <OpponentCard
                                  opponent={opponent}
                                  onRemove={() =>
                                    handleRemoveEncounterOpponentToAttache(
                                      index,
                                    )
                                  }
                                  onEdit={undefined}
                                />
                              </div>
                            </div>
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

export default EditEncounterDrawer;
