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
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { useEffect } from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import { useEncounterStore } from "@/stores/useEncounterStore";
import { useShallow } from "zustand/shallow";
import IconPicker from "../IconPicker/IconPicker";

type Props = {
  element: CanvasElement | null;
  isCreating: boolean;
  open: boolean;
  onCreate: (encounter: Omit<Encounter, "id">) => void;
  onOpenChange: (state: boolean) => void;
};

function CreateEncounterDrawer({
  onCreate,
  isCreating,
  open,
  onOpenChange,
  element,
}: Props) {
  const { t } = useTranslation("ComponentPartyCreateDrawer");
  const { setCurrentIcon, setCurrentColor, setResetCount } = useEncounterStore(
    useShallow((state) => ({
      setCurrentColor: state.setCurrentColor,
      setCurrentIcon: state.setCurrentIcon,
      setResetCount: state.setResetCount,
    })),
  );

  const RollSchema = z.object({
    type: z.literal("roll"),
    name: z.string().min(2),
    icon: z.string().emoji(),
    description: z.string(),
    color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
    element: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    //    images: z.array(z.instanceof(File).or(z.string())),
    dice: z.number().min(2).max(100),
    skill: z.string().min(2),
    difficulties: z.array(
      z.object({
        value: z.number().min(1).max(100),
        description: z.string().min(2),
      }),
    ),
  });

  const FightSchema = z.object({
    type: z.literal("fight"),
    name: z.string().min(2),
    icon: z.string().emoji(),
    description: z.string(),
    color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
    element: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    //    images: z.array(z.instanceof(File).or(z.string())),
    opponents: z.array(z.number()).min(1),
  });

  const NoteSchema = z.object({
    type: z.literal("note"),
    name: z.string().min(2),
    icon: z.string().emoji(),
    description: z.string(),
    color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
    element: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    //    images: z.array(z.instanceof(File).or(z.string())),
  });

  const schemas = [
    RollSchema,
    FightSchema,
    NoteSchema,
  ] as const satisfies readonly [
    typeof RollSchema,
    typeof FightSchema,
    typeof NoteSchema,
  ];

  const formSchema = z.discriminatedUnion("type", schemas);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      element: {
        height: 100,
        width: 100,
        x: 0,
        y: 0,
      },
      icon: "📝",
      name: "",
      type: "roll",
      description: "",
      color: "#ffffff",
      skill: "Perception",
      dice: 20,
      difficulties: [
        { value: 10, description: "crit fail" },
        { value: 15, description: "pass" },
        { value: 20, description: "crit success" },
      ],
    },
  });

  const elementColorInput = form.watch("color");

  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "difficulties",
  });

  const difficulties = useWatch({
    control: form.control,
    name: "difficulties",
  });

  useEffect(() => {
    // necessary because with the first load of the global modals and the first state there is no element set
    if (element) form.setValue("element", element);
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
    console.log({ code: event.code });
    if (event.code === "Escape") {
      onOpenChange(false);
    }
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
    setCurrentIcon(icon);
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("SAVE", values);
    //TODO: Implement the save to DB in globalModals

    // const {
    //   name,
    //   description,
    //   color,
    //   dice,
    //   difficulties,
    //   element,
    //   experience,
    //   images,
    //   opponents,
    //   passed,
    //   skill,
    //   type,
    // } = values;

    // onCreate({
    //   name,
    //   description,
    //   color,
    //   dice,
    //   difficulties,
    //   // @ts-ignore
    //   element: { ...element, color, icon: getTypeIcon(type) },
    //   experience,
    //   images: [],
    //   opponents: [],
    //   passed,
    //   skill,
    //   type,
    // });

    // form.reset();
  }

  function handleCancelation() {
    onOpenChange(false);
    setResetCount(Date.now());
    setCurrentColor("#ffffff");
    setCurrentIcon("📝");
    form.reset();
  }

  function handleAddDifficulty() {
    append({ description: "New Difficulty", value: 99 });
  }

  function handleTypeChange(type: "roll" | "note" | "fight") {
    form.setValue("type", type);
  }

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "tween", duration: 0.2 }}
          className="fixed top-2 right-0 bottom-2 flex w-full max-w-[640px] flex-col items-start gap-4 rounded-l-md bg-white p-4 shadow-xl"
        >
          <TypographyH1>Create Encounter</TypographyH1>

          <div className="flex w-full grow flex-col gap-4 overflow-hidden">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="end flex gap-2 px-0.5">
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
                            placeholder="The big fight..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1 px-0.5 pt-1.5">
                        <FormLabel>{t("color")}</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(val) => field.onChange(val)} // string → number
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="White" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="#ffffff">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-white"></span>
                                  White
                                </div>
                              </SelectItem>

                              <SelectItem value="#f44336">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-red-500"></span>
                                  Red
                                </div>
                              </SelectItem>

                              <SelectItem value="#ff9800">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-orange-500"></span>
                                  Orange
                                </div>
                              </SelectItem>

                              <SelectItem value="#ffc107">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-amber-500"></span>
                                  Amber
                                </div>
                              </SelectItem>

                              <SelectItem value="#ffeb3b">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-yellow-500"></span>
                                  Yellow
                                </div>
                              </SelectItem>

                              <SelectItem value="#cddc39">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-lime-500"></span>
                                  Lime
                                </div>
                              </SelectItem>

                              <SelectItem value="#4caf50">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-green-500"></span>
                                  Green
                                </div>
                              </SelectItem>

                              <SelectItem value="#10b981">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-emerald-500"></span>
                                  Emerald
                                </div>
                              </SelectItem>

                              <SelectItem value="#009688">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-teal-500"></span>
                                  Teal
                                </div>
                              </SelectItem>

                              <SelectItem value="#00bcd4">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-cyan-500"></span>
                                  Cyan
                                </div>
                              </SelectItem>

                              <SelectItem value="#0ea5e9">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-sky-500"></span>
                                  Sky
                                </div>
                              </SelectItem>

                              <SelectItem value="#2196f3">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-blue-500"></span>
                                  Blue
                                </div>
                              </SelectItem>

                              <SelectItem value="#3f51b5">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-indigo-500"></span>
                                  Indigo
                                </div>
                              </SelectItem>

                              <SelectItem value="#8b5cf6">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-violet-500"></span>
                                  Violet
                                </div>
                              </SelectItem>

                              <SelectItem value="#9c27b0">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-purple-500"></span>
                                  Purple
                                </div>
                              </SelectItem>

                              <SelectItem value="#d946ef">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-fuchsia-500"></span>
                                  Fuchsia
                                </div>
                              </SelectItem>

                              <SelectItem value="#e91e63">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-pink-500"></span>
                                  Pink
                                </div>
                              </SelectItem>

                              <SelectItem value="#f43f5e">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-rose-500"></span>
                                  Rose
                                </div>
                              </SelectItem>

                              <SelectItem value="#64748b">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-slate-500"></span>
                                  Slate
                                </div>
                              </SelectItem>

                              <SelectItem value="#9e9e9e">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-4 rounded bg-gray-500"></span>
                                  Gray
                                </div>
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
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="px-0.5">
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isCreating}
                          placeholder=""
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-1 px-0.5">
                  <FormLabel>Type</FormLabel>

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
                        Note
                      </TabsTrigger>

                      <TabsTrigger
                        className="hover:cursor-pointer hover:bg-white/80"
                        value="roll"
                      >
                        Roll
                      </TabsTrigger>

                      <TabsTrigger
                        className="hover:cursor-pointer hover:bg-white/80"
                        value="fight"
                      >
                        Fight
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="roll" className="flex flex-col gap-4">
                      <div className="flex gap-2 px-0.5">
                        <div className="flex flex-col gap-1">
                          <FormLabel>Dice</FormLabel>

                          <FormField
                            control={form.control}
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
                                      <SelectValue placeholder="Select a dice" />
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
                              <FormLabel>Skill</FormLabel>

                              <FormControl>
                                <Input
                                  disabled={isCreating}
                                  placeholder="Perception"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex flex-col items-start gap-2 px-0.5">
                        <FormLabel>Difficulties</FormLabel>

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
                                />
                              )}
                            />

                            <Controller
                              control={form.control}
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
                            Add Difficulty
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="fight">hi fight</TabsContent>
                  </Tabs>
                </div>
              </form>
            </Form>
          </div>

          <div className="flex gap-4">
            <Button
              loading={isCreating}
              disabled={isCreating}
              onClick={() => form.handleSubmit(onSubmit)()}
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
