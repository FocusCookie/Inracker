import { DBResistance } from "@/types/resistances";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { Textarea } from "../ui/textarea";

type Props = {
  resistance: DBResistance | null;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onEdit: (resistance: DBResistance) => void;
};

function EditResistanceDrawer({
  resistance,
  isLoading,
  open,
  onEdit,
  onOpenChange,
}: Props) {
  const { t } = useTranslation("ComponentEditResistanceDrawer");

  useEffect(() => {
    if (resistance) {
      form.reset(resistance);
    }
  }, [resistance]);

  const formSchema = z.object({
    name: z.string().min(3, {
      message: t("minNameChars"),
    }),
    description: z.string(),
    icon: z.string().emoji(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: resistance ? resistance.name : "",
      description: resistance ? resistance.description : "",
      icon: resistance ? resistance.icon : "🔥",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, description, icon } = values;

    if (resistance) {
      onEdit({
        id: resistance.id,
        name,
        icon,
        description,
      });
    }
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  return (
    <Drawer
      description={t("descriptionText")}
      open={open && !!resistance}
      onOpenChange={onOpenChange}
      title={t("title")}
      actions={
        <Button loading={isLoading} onClick={form.handleSubmit(onSubmit)}>
          {t("edit")}
        </Button>
      }
      cancelTrigger={
        <Button disabled={isLoading} variant="ghost">
          {t("cancel")}
        </Button>
      }
      children={
        !!resistance && (
          <Form {...form}>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-4 p-0.5"
            >
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
                  <FormLabel>{t("icon")}</FormLabel>
                  <IconPicker
                    initialIcon={resistance.icon}
                    disabled={isLoading}
                    onIconClick={handleIconSelect}
                  />
                  <FormMessage />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
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
                        placeholder="enter a description"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }
    />
  );
}

export default EditResistanceDrawer;
