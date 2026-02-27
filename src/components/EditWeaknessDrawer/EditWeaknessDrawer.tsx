import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { CancelReason, OverlayMap } from "@/types/overlay";

type OverlayProps = OverlayMap["weakness.edit"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void; // host removes after exit
};

type Props = OverlayProps & RuntimeProps;

function EditWeaknessDrawer({
  weakness,
  open,
  onEdit,
  onOpenChange,
  onCancel,
  onComplete,
  onExitComplete,
}: Props) {
  const { t } = useTranslation("ComponentEditWeaknessDrawer");
  const [isLoading, setIsLoading] = useState(false);
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("minName"),
    }),
    description: z.string(),
    icon: z.string().emoji(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: weakness.name,
      description: weakness.description,
      icon: weakness.icon,
    },
  });

  useEffect(() => {
    form.reset({
      name: weakness.name,
      description: weakness.description,
      icon: weakness.icon,
    });
  }, [weakness, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const { name, description, icon } = values;

      const updatedWeakness = await onEdit({
        id: weakness.id,
        name,
        icon,
        description,
      });

      onComplete?.(updatedWeakness);
      setClosingReason("success");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.log("Error while updating an weakness");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
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
        <Button disabled={isLoading} onClick={form.handleSubmit(onSubmit)}>
          {t("edit")}
        </Button>
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
        <Form {...form} key={weakness.id}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-4 pr-4"
          >
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
                <FormLabel>{t("icon")}</FormLabel>

                <IconPicker
                  initialIcon={weakness.icon}
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
                    <MarkdownEditor
                      disabled={isLoading}
                      {...field}
                      placeholder="Type your message here."
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      }
    />
  );
}

export default EditWeaknessDrawer;
