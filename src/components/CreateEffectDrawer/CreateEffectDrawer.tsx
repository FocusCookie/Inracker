import { Effect } from "@/types/effect";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import Drawer from "../Drawer/Drawer";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import IconPicker from "../IconPicker/IconPicker";
import { Input } from "../ui/input";
import { MarkdownEditor } from "../MarkdownEditor/MarkdownEditor";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { CancelReason, OverlayMap } from "@/types/overlay";

type OverlayProps = OverlayMap["effect.create"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};

type Props = OverlayProps & RuntimeProps;

function CreateEffectDrawer({
  open,
  onCreate,
  onOpenChange,
  onComplete,
  onExitComplete,
  onCancel,
}: Props) {
  const { t } = useTranslation("ComponentCreateEffectDrawer");
  const [isCreating, setIsCreating] = useState(false);
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);
  const [durationType, setDurationType] =
    useState<Effect["durationType"]>("rounds");
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("validation.name.minLength"),
    }),
    description: z.string(),
    icon: z.string().emoji(),
    type: z.enum(["positive", "negative"]),
    duration: z.coerce.number().min(1, {
      message: t("validation.duration.minValue"),
    }),
    durationType: z.enum(["rounds", "time", "short", "long"]),
    value: z.coerce.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "🪄",
      type: "positive",
      duration: 1,
      durationType: "rounds",
      value: 0,
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsCreating(true);

      const { name, description, icon, duration, durationType, type, value } =
        values;

      const createdEffect = await onCreate({
        name,
        icon,
        description,
        duration, // This is now always rounds or total seconds
        durationType,
        type,
        value: type === "positive" ? value : Math.abs(value) * -1,
      });

      onComplete(createdEffect);

      setClosingReason("success");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.log("Error while creating effect: ", values);
      console.log(error);
    } finally {
      setIsCreating(false);
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

  function handleTypeChange(value: string) {
    form.setValue("type", value as "positive" | "negative");
  }

  function handleDurationTypeChange(
    value: "rounds" | "time" | "short" | "long",
  ) {
    form.setValue("durationType", value);
    setDurationType(value);

    // Default values when switching
    if (value === "time") {
      setMinutes(1);
      setSeconds(60);
      form.setValue("duration", 60);
    } else {
      form.setValue("duration", 1);
    }
  }

  function handleMinutesChange(val: number) {
    setMinutes(val);
    const totalSec = val * 60;
    setSeconds(totalSec);
    form.setValue("duration", totalSec);
  }

  function handleSecondsChange(val: number) {
    setSeconds(val);
    setMinutes(Math.floor(val / 60));
    form.setValue("duration", val);
  }

  return (
    <Drawer
      onExitComplete={onExitComplete}
      description={t("descriptionText")}
      open={open}
      onOpenChange={handleOpenChange}
      title={t("title")}
      actions={
        <Button disabled={isCreating} onClick={form.handleSubmit(handleSubmit)}>
          {t("create")}
        </Button>
      }
      cancelTrigger={
        <Button
          disabled={isCreating}
          variant="ghost"
          onClick={handleCancelClick}
        >
          {t("cancel")}
        </Button>
      }
      children={
        <Form {...form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-4"
          >
            <div className="flex items-start gap-2">
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
                  <FormItem className="w-full px-0.5">
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="px-0.5">
                  <FormLabel>{t("description")}</FormLabel>

                  <FormControl className="rounded-md border">
                    <MarkdownEditor
                      disabled={isCreating}
                      {...field}
                      placeholder={t("descriptionPlaceholder")}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex w-full gap-2">
              <div className="flex h-full w-2/3 flex-col gap-[0.25rem+1px] pt-1.5">
                <FormLabel>{t("type")}</FormLabel>

                <Tabs onValueChange={handleTypeChange} defaultValue="positive">
                  <TabsList className="mt-px grid h-9 w-full grid-cols-2 gap-2">
                    <TabsTrigger
                      className="hover:cursor-pointer hover:bg-white/80"
                      value="positive"
                    >
                      {t("positive")}
                    </TabsTrigger>

                    <TabsTrigger
                      className="hover:cursor-pointer hover:bg-white/80"
                      value="negative"
                    >
                      {t("negative")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <FormField
                control={form.control}
                name="value"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-col gap-0.5 px-0.5">
                    <div className="flex h-[1.3125rem] gap-2 pt-1.5">
                      <FormLabel>{t("value")}</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoCircledIcon />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-2xs">
                            <p>{t("valueTooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <FormControl>
                      <Input
                        type="number"
                        className="mt-0.5"
                        disabled={isCreating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex h-full w-full flex-col gap-[0.25rem+1px] pt-1.5">
              <FormLabel>{t("durationType")}</FormLabel>

              <Tabs
                // @ts-ignore
                onValueChange={handleDurationTypeChange}
                defaultValue="rounds"
              >
                <TabsList className="mt-px grid h-9 w-full grid-cols-4 gap-2">
                  <TabsTrigger
                    className="hover:cursor-pointer hover:bg-white/80"
                    value="rounds"
                  >
                    {t("rounds")}
                  </TabsTrigger>

                  <TabsTrigger
                    className="hover:cursor-pointer hover:bg-white/80"
                    value="time"
                  >
                    {t("time")}
                  </TabsTrigger>

                  <TabsTrigger
                    className="hover:cursor-pointer hover:bg-white/80"
                    value="short"
                  >
                    {t("shortRest")}
                  </TabsTrigger>

                  <TabsTrigger
                    className="hover:cursor-pointer hover:bg-white/80"
                    value="long"
                  >
                    {t("longRest")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {durationType === "rounds" && (
              <FormField
                control={form.control}
                name="duration"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-col gap-0.5 px-0.5">
                    <FormLabel>{t("durationRounds")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="mt-0.5"
                        disabled={isCreating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {durationType === "time" && (
              <div className="grid grid-cols-2 gap-4 px-0.5">
                <FormItem className="flex flex-col gap-0.5">
                  <FormLabel>{t("durationMinutes")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={minutes}
                      onChange={(e) =>
                        handleMinutesChange(Number(e.target.value))
                      }
                      disabled={isCreating}
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="flex flex-col gap-0.5">
                  <FormLabel>{t("durationSeconds")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={seconds}
                      onChange={(e) =>
                        handleSecondsChange(Number(e.target.value))
                      }
                      disabled={isCreating}
                    />
                  </FormControl>
                </FormItem>
              </div>
            )}
          </form>
        </Form>
      }
    />
  );
}

export default CreateEffectDrawer;
