import { Effect } from "@/types/effect";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { Textarea } from "../ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { CancelReason, OverlayMap } from "@/types/overlay";

type OverlayProps = OverlayMap["effect.edit"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void; // host removes after exit
};

type Props = OverlayProps & RuntimeProps;

function EditEffectDrawer({
  effect,
  open,
  onEdit,
  onOpenChange,
  onCancel,
  onComplete,
  onExitComplete,
}: Props) {
  const { t } = useTranslation("ComponentEditEffectDrawer");
  const [isLoading, setIsLoading] = useState(false);
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);
  const [durationType, setDurationType] = useState<Effect["durationType"]>(
    effect.durationType,
  );

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("validation.minNameLength"),
    }),
    description: z.string(),
    icon: z.string().emoji(),
    type: z.enum(["positive", "negative"]),
    duration: z.coerce.number().min(1, {
      message: t("validation.minDuration"),
    }),
    durationType: z.enum(["rounds", "time", "long", "short"]),
    value: z.coerce.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: effect.name,
      description: effect.description,
      icon: effect.icon,
      type: effect.type,
      duration: effect.duration,
      durationType: effect.durationType,
      value: effect.value,
    },
  });

  useEffect(() => {
    form.reset({
      name: effect.name,
      description: effect.description,
      icon: effect.icon,
      type: effect.type,
      duration: effect.duration,
      durationType: effect.durationType,
      value: Math.abs(effect.value),
    });
  }, [effect, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const { name, description, icon, duration, durationType, type, value } =
        values;

      const updatedEffect = await onEdit({
        id: effect.id,
        name,
        icon,
        description,
        duration,
        durationType,
        type,
        value,
      });

      onComplete?.(updatedEffect);
      setClosingReason("success");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.log("Error while updating an effect");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  function handleTypeChange(value: "positive" | "negative") {
    form.setValue("type", value);
  }

  function handleDurationTypeChange(value: "rounds" | "time") {
    form.setValue("durationType", value);
    setDurationType(value);
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

  return (
    <Drawer
      onExitComplete={onExitComplete}
      description={t("descriptionText")}
      open={open}
      onOpenChange={handleOpenChange}
      title={t("title")}
      actions={
        <Button onClick={form.handleSubmit(onSubmit)}>{t("edit")}</Button>
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
      children={
        <Form {...form} key={effect.id}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-4"
          >
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
                  <FormLabel>{t("icon")}</FormLabel>

                  <IconPicker
                    initialIcon={effect.icon}
                    disabled={isLoading}
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
                          disabled={isLoading}
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
                      <Textarea
                        readOnly={isLoading}
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
                  <Tabs
                    // @ts-ignore
                    onValueChange={handleTypeChange}
                    // @ts-ignore
                    defaultValue={effect.type}
                  >
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
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex w-full gap-2">
                <div className="flex h-full w-2/3 flex-col gap-[0.25rem+1px] pt-1.5">
                  <FormLabel>{t("durationType")}</FormLabel>
                  <Tabs
                    // @ts-ignore
                    onValueChange={handleDurationTypeChange}
                    // @ts-ignore
                    defaultValue={effect.durationType}
                  >
                    <TabsList className="mt-px grid h-9 w-full grid-cols-2 gap-2">
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
                    </TabsList>
                  </Tabs>
                </div>

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-col gap-0.5 px-0.5">
                      <div className="flex h-[1.3125rem] gap-2 pt-1.5">
                        <FormLabel>
                          {t("duration")}{" "}
                          {durationType === "time" && t("timeUnit")}
                        </FormLabel>
                      </div>

                      <FormControl>
                        <Input
                          type="number"
                          className="mt-0.5"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
      }
    />
  );
}

export default EditEffectDrawer;
