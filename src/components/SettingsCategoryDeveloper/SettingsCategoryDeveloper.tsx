import { useTranslation } from "react-i18next";
import { TypographyH1 } from "../ui/typographyH1";
import { Button } from "../ui/button";
import { useSettingsGeneral } from "@/hooks/useSettingsGeneral";
import { Separator } from "@/components/ui/separator";

function SettingsCategoryDeveloper() {
  const { t } = useTranslation("ComponentSettingsCategoryDeveloper");
  const { testErrorMutation, setTriggerQueryError } = useSettingsGeneral();

  function handleTriggerTestError() {
    testErrorMutation.mutate();
  }

  function handleTriggerTestQueryError() {
    setTriggerQueryError(true);
  }

  return (
    <div className="flex flex-col gap-4 pb-10">
      <TypographyH1>{t("title")}</TypographyH1>
      
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            className="w-fit"
            onClick={handleTriggerTestError}
            disabled={testErrorMutation.isPending}
          >
            {t("triggerMutationError")}
          </Button>
          <Button
            variant="outline"
            className="w-fit"
            onClick={handleTriggerTestQueryError}
          >
            {t("triggerQueryError")}
          </Button>
        </div>
      </div>

      <Separator className="my-4" />
      
      <p className="text-xs text-muted-foreground italic">
        {t("warning")}
      </p>
    </div>
  );
}

export default SettingsCategoryDeveloper;
