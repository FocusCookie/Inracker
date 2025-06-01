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
import { z } from "zod";
import { Button } from "../ui/button";
import { Encounter } from "@/types/encounter";
import { CanvasElement } from "../Canvas/Canvas";
import { AnimatePresence, motion } from "framer-motion";
import { TypographyH1 } from "../ui/typographyH1";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import { useEncounterStore } from "@/stores/useEncounterStore";
import { useShallow } from "zustand/shallow";
import IconPicker from "../IconPicker/IconPicker";
import OpponentCard from "../OpponentCard/OpponentCard";
import { EncounterOpponent, Opponent } from "@/types/opponents";

type Props = {
  element: CanvasElement | null;
  isCreating: boolean;
  open: boolean;
  form: { form: any; schema: any }; //TODO: Better types
  opponents: Opponent[];
  selectedOpponents: EncounterOpponent[];
  onCreate: (encounter: Omit<Encounter, "id">) => void;
  onOpenChange: (state: boolean) => void;
  onCreateOpponent: () => void;
  onOpenOpponentsCatalog: () => void;
  onRemoveOpponent?: (opponentId: Opponent["id"]) => void;
};

function CreateEncounterDrawer({
  isCreating,
  open,
  element,
  form,
  selectedOpponents,
  onOpenChange,
  onCreate,
  onCreateOpponent,
  onOpenOpponentsCatalog,
  onRemoveOpponent,
}: Props) {
  const { t } = useTranslation("ComponentCreateEncounterDrawer");
  const [type, setType] = useState<Encounter["type"]>("note");
  const { setCurrentIcon, setCurrentColor, setResetCount, setCurrentElement } =
    useEncounterStore(
      useShallow((state) => ({
        setCurrentColor: state.setCurrentColor,
        setCurrentIcon: state.setCurrentIcon,
        setResetCount: state.setResetCount,
        setCurrentElement: state.setCurrentElement,
      })),
    );

  const elementColorInput = form.form.watch("color");

  const { fields, remove, append } = useFieldArray({
    control: form.form.control,
    name: "difficulties",
  });

  useEffect(() => {
    // necessary because with the first load of the global modals and the first state there is no element set
    if (element) form.form.setValue("element", element);
  }, [element]);

  useEffect(() => {
    setCurrentColor(elementColorInput);
  }, [elementColorInput]);

  useEffect(() => {
    window.addEventListener("keydown", closeOnEscDown);

    return () => {
      window.removeEventListener("keydown", closeOnEscDown);
    };
  }, []);

  function closeOnEscDown(event: KeyboardEvent) {
    if (event.code === "Escape") {
      // onOpenChange(false);
    }
  }

  function handleIconSelect(icon: string) {
    form.form.setValue("icon", icon);
    setCurrentIcon(icon);
  }

  function onSubmit(values: z.infer<typeof form.schema>) {
    //TODO: Implement the save to DB in globalModals

    const {
      name,
      description,
      experience,
      icon,
      color,
      dice,
      difficulties,
      element,
      images,
      opponents,
      passed,
      skill,
      type,
    } = values;

    onCreate({
      name,
      description,
      color,
      dice,
      difficulties,
      element: { ...element, color, icon },
      experience,
      images: [],
      opponents,
      passed,
      skill,
      type,
    });
  }

  function handleCancelation() {
    onOpenChange(false);
    setResetCount(Date.now());
    setCurrentColor("#ffffff");
    setCurrentIcon("📝");
    setCurrentElement(null);
    form.form.reset();
  }

  function handleAddDifficulty() {
    append({ description: "New Difficulty", value: 99 });
  }

  function handleTypeChange(value: "roll" | "note" | "fight") {
    form.form.setValue("type", value);
    setType(value);
  }

  const handleRemoveOpponent = (id: EncounterOpponent["id"]) => {
    const currentOpponents = form.form.getValues("opponents");
    const updatedOpponents = currentOpponents.filter(
      (opponentId: number) => opponentId !== id,
    );

    if (onRemoveOpponent) {
      onRemoveOpponent(id);
      form.form.setValue("opponents", updatedOpponents);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "tween", duration: 0.2 }}
          className="fixed top-2 right-0 bottom-2 flex w-full max-w-[640px] flex-col items-start gap-4 rounded-l-md bg-white p-4 pr-0.5 shadow-xl"
        >
          <TypographyH1>{t("title")}</TypographyH1>

          <div className="scrollable-y w-full grow overflow-y-scroll pr-0.5">
            <div className="flex w-full grow flex-col gap-4 overflow-hidden">
              <Form {...form.form}>
                <form
                  onSubmit={form.form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="flex w-full gap-2 px-0.5">
                    <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
                      <FormLabel>{t("icon")}</FormLabel>
                      <IconPicker
                        initialIcon={form.form.getValues("icon")}
                        disabled={isCreating}
                        onIconClick={handleIconSelect}
                      />
                      <FormMessage />
                    </div>

                    <FormField
                      control={form.form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="w-full grow px-0.5">
                          <FormLabel>{t("name")}</FormLabel>
                          <FormControl>
                            <Input
                              disabled={isCreating}
                              placeholder={t("namePlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex w-full gap-2 px-0.5">
                    <FormField
                      control={form.form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem className="flex grow flex-col gap-1 pt-1.5">
                          <FormLabel>{t("color")}</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(val) => field.onChange(val)} // string → number
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
                        control={form.form.control}
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
                    control={form.form.control}
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
                      // @ts-ignore
                      onValueChange={handleTypeChange}
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
                              control={form.form.control}
                              name="dice"
                              render={({ field }) => (
                                <FormItem className="flex flex-col gap-1 px-0.5">
                                  <FormControl>
                                    <Select
                                      value={field.value.toString()} // current numeric value → string
                                      onValueChange={(val) =>
                                        field.onChange(+val)
                                      } // string → number
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
                                        <SelectItem value="100">
                                          D100
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.form.control}
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
                                control={form.form.control}
                                name={`difficulties.${index}.value`}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    min={1}
                                    max={100}
                                    className="w-20"
                                  />
                                )}
                              />

                              <Controller
                                control={form.form.control}
                                name={`difficulties.${index}.description`}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    className="grow"
                                  />
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
                                onClick={onCreateOpponent}
                              >
                                {t("create")}
                              </Button>

                              <Button
                                type="button"
                                onClick={onOpenOpponentsCatalog}
                              >
                                {t("catalog")}
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-4">
                            {selectedOpponents.map(
                              (
                                opponent: Omit<EncounterOpponent, "blueprint">,
                              ) => (
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

          <div className="flex gap-4">
            <Button
              loading={isCreating}
              disabled={isCreating}
              onClick={() => form.form.handleSubmit(onSubmit)()}
            >
              {t("create")}
            </Button>

            <Button
              disabled={isCreating}
              variant="ghost"
              onClick={handleCancelation}
            >
              {t("cancel")}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CreateEncounterDrawer;
