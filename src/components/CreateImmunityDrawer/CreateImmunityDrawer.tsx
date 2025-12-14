import { Immunity } from "@/types/immunitiy";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { MarkdownEditor } from "../MarkdownEditor/MarkdownEditor";
import { useState } from "react";
import type { CancelReason, OverlayMap } from "@/types/overlay";

type OverlayProps = OverlayMap["immunity.create"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};

type Props = OverlayProps & RuntimeProps;

export default function CreateImmunityDrawer({
  open,
  onCreate,
  onComplete,
  onCancel,
  onOpenChange,
  onExitComplete,
}: Props) {
  const { t } = useTranslation("ComponentCreateImmunityDrawer");
  const [isCreating, setIsCreating] = useState(false);
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("validation.name.minLength"),
    }),
    description: z.string(),
    icon: z.string().emoji({ message: t("validation.icon.emoji") }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "🔥",
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsCreating(true);

      const input: Immunity = {
        name: values.name,
        icon: values.icon,
        description: values.description,
      };

      const createdImmunity = await onCreate(input);

      onComplete(createdImmunity);

      setClosingReason("success");
      onOpenChange(false);
      form.reset();
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

  return (
    <Drawer
      description={t("descriptionText")}
      open={open}
      onOpenChange={handleOpenChange}
      onExitComplete={onExitComplete}
      title={t("title")}
      actions={
        <Button disabled={isCreating} onClick={form.handleSubmit(handleSubmit)}>
          {t("create")}
        </Button>
      }
      cancelTrigger={
        <Button
          onClick={handleCancelClick}
          disabled={isCreating}
          variant="ghost"
        >
          {t("cancel")}
        </Button>
      }
    >
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-4 pr-2"
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
              render={({ field }: { field: any }) => (
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
            render={({ field }: { field: any }) => (
              <FormItem className="px-0.5">
                <FormLabel>{t("description")}</FormLabel>
                <FormControl>
                  <MarkdownEditor
                    disabled={isCreating}
                    placeholder={t("descriptionPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Drawer>
  );
}
