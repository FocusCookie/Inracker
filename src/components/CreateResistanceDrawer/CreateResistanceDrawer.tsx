import { Resistance } from "@/types/resistances";
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
import { Textarea } from "../ui/textarea";

type Props = {
  isCreating: boolean;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onCreate: (Immunity: Omit<Resistance, "id">) => void;
};

function CreateResistanceDrawer({
  isCreating,
  onCreate,
  onOpenChange,
  open,
}: Props) {
  const { t } = useTranslation("ComponentCreateResistanceDrawer");

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
      name: "",
      description: "",
      icon: "🔥",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, description, icon } = values;

    onCreate({
      name,
      icon,
      description,
    });
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  return (
    <Drawer
      description={t("descriptionText")}
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      actions={
        <Button loading={isCreating} onClick={form.handleSubmit(onSubmit)}>
          {t("create")}
        </Button>
      }
      cancelTrigger={
        <Button disabled={isCreating} variant="ghost">
          {t("cancel")}
        </Button>
      }
      children={
        <Form {...form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-4 p-0.5"
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
                  <FormItem className="w-full">
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
                    <Textarea
                      readOnly={isCreating}
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
      }
    />
  );
}

export default CreateResistanceDrawer;
