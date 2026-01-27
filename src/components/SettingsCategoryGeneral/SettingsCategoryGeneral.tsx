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
import Loader from "@/components/Loader/Loader";

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
          <Button type="submit" disabled={mutation.isPending}>
            {t("save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default SettingsCategoryGeneral;
