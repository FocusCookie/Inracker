import { useSettingsGeneral } from "@/hooks/useSettingsGeneral";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/Loader/Loader";
import { TypographyH1 } from "../ui/typographyH1";

function SettingsCategoryGeneral() {
  const { t } = useTranslation("ComponentSettingsCategoryGeneral");
  const { form, mutation, isLoading } = useSettingsGeneral();

  function onSubmit(values: any) {
    mutation.mutate(values);
  }

  if (isLoading) {
    return (
      <div className="flex w-full justify-center p-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-10">
      <TypographyH1>{t("general")}</TypographyH1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="secondsPerRound"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("secondsPerRound")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("language")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("language")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">{t("en")}</SelectItem>
                      <SelectItem value="de">{t("de")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              {t("save")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SettingsCategoryGeneral;
