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
import { useForm } from "react-hook-form";
import { z } from "zod";
import Drawer from "../Drawer/Drawer";
import IconPicker from "../IconPicker/IconPicker";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

type Props = {};

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  description: z.string(),
  icon: z.string().emoji(),
});

function PartyCreateDrawer({}: Props) {
  const { t } = useTranslation("ComponentPartyCreateDrawer");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  //TODO: refactor to use drawer in order to have a good accesibility!!!

  return (
    <Drawer
      title={t("createAParty")}
      trigger={<Button>{t("createAParty")}</Button>}
      actions={
        <Button onClick={form.handleSubmit(onSubmit)}>{t("create")}</Button>
      }
    >
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-3 pl-0.5 pt-1.5">
              <FormLabel>{t("icon")}</FormLabel>
              <IconPicker onIconClick={handleIconSelect} />
              <FormMessage />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full px-0.5">
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="The greedy Adventurer" {...field} />
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
                  <Textarea placeholder="" {...field} />
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

export default PartyCreateDrawer;
