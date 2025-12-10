import React, { useState } from "react";
import defaultDb from "@/lib/database";
import { Input } from "../ui/input";
import { Effect } from "@/types/effect";
import { useTranslation } from "react-i18next";
import SettingEffectCard from "../SettingEffectCard/SettingEffectCard";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { TypographyH1 } from "../ui/typographyH1";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  useCreateEffect,
  useDeleteEffect,
  useEffects,
  useUpdateEffect,
} from "@/hooks/useEffects";

type Props = {
  database: typeof defaultDb;
};

function SettingsCategoryEffects({ database = defaultDb }: Props) {
  const { t } = useTranslation("ComponentSettingsCategoryEffects");
  const openOverlay = useOverlayStore((s) => s.open);
  const [search, setSearch] = useState<string>("");

  const effects = useEffects(database);
  const createEffect = useCreateEffect(database);
  const editEffect = useUpdateEffect(database);
  const deleteEffect = useDeleteEffect(database);

  function handleOpenCreateEffect() {
    openOverlay("effect.create", {
      onCreate: (effect) => createEffect.mutateAsync(effect),
      onComplete: (effect) => {
        toast({
          variant: "default",
          title: `Created ${effect.icon} ${effect.name}`,
        });
      },
    });
  }

  function handleEffectSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  function handleOpenEditEffect(effect: Effect) {
    openOverlay("effect.edit", {
      effect,
      onEdit: (effect) => editEffect.mutateAsync(effect),
    });
  }

  async function handleDeleteEffect(effectId: Effect["id"]) {
    const effect = await deleteEffect.mutateAsync(effectId);

    toast({
      title: `Deleted ${effect.icon} ${effect.name} successfully`,
    });
  }

  return (
    <>
      <div className="flex justify-between gap-4">
        <TypographyH1>{t("effects")}</TypographyH1>

        {effects.data && effects.data.length > 0 && (
          <Button onClick={handleOpenCreateEffect} className="mt-2">
            {t("createEffect")}
          </Button>
        )}
      </div>

      {!effects.data ||
        (effects.data.length === 0 && (
          <Alert>
            <MoonIcon />
            <AlertTitle>{t("noEffects")}</AlertTitle>
            <AlertDescription>
              {t("noEffectsDescription")}
              <div className="flex w-full justify-center">
                <Button onClick={handleOpenCreateEffect} className="mt-2">
                  {t("createEffect")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}

      {effects.data && effects.data.length > 0 && (
        <>
          <Input
            className="mt-4"
            placeholder={t("searchPlaceholder")}
            onChange={handleEffectSearchTerm}
          />

          <div className="scrollable-y h-full overflow-y-scroll p-0.5">
            <div className="flex h-full max-h-96 flex-col gap-4">
              {effects.data
                .filter((effect) =>
                  effect.name.toLowerCase().includes(search.toLowerCase()),
                )

                .map((effect) => (
                  <SettingEffectCard
                    key={effect.id}
                    effect={effect}
                    onDelete={() => handleDeleteEffect(effect.id)}
                    onEdit={() => handleOpenEditEffect(effect)}
                  />
                ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SettingsCategoryEffects;
