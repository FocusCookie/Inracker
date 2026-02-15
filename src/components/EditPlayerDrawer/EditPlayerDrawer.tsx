import { useEffect, useState } from "react";
import Drawer from "../Drawer/Drawer";
import { Button } from "../ui/button";
import EditPlayerForm from "../EditPlayerForm/EditPlayerForm";
import { storeImage } from "@/lib/utils";
import { useEditPlayer } from "@/hooks/useEditPlayer";
import { CancelReason, OverlayMap } from "@/types/overlay";
import { useTranslation } from "react-i18next";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { TypographyH2 } from "../ui/typographyh2";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import EffectCard from "../EffectCard/EffectCard";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import { useEffects } from "@/hooks/useEffects";
import { Player } from "@/types/player";

type OverlayProps = OverlayMap["player.edit"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void; // host removes after exit
  onExitComplete: () => void;
};

type Props = OverlayProps & RuntimeProps;

function EditPlayerDrawer({
  player,
  open,
  onOpenChange,
  onExitComplete,
  onComplete,
  onCancel,
  onEdit,
}: Props) {
  const form = useEditPlayer();
  const { t } = useTranslation("ComponentEditPlayerDrawer");
  const openOverlay = useOverlayStore((s) => s.open);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);

  const immunities = useQueryWithToast({
    queryKey: ["immunities"],
    queryFn: () => db.immunities.getAll(),
  });

  const resistances = useQueryWithToast({
    queryKey: ["resistances"],
    queryFn: () => db.resistances.getAll(),
  });

  const effects = useEffects(db);

  useEffect(() => {
    if (!!player) {
      form.reset({
        ...player,
        // @ts-ignore
        picture: player.image || "",
        immunities: player.immunities.map((i) => i.id),
        resistances: player.resistances.map((r) => r.id),
        effects: player.effects.map((e) => e.id),
      });
    }
  }, [player]);

  async function handleSavePlayer() {
    try {
      setIsLoading(true);

      const values = form.getValues();
      const { picture, resistances: resIds, immunities: immIds, effects: effIds, ...update } = values;
      
      let pictureFilePath: string | null = player?.image || null;

      if (!!picture) {
        if (picture instanceof File) {
          pictureFilePath = await storeImage(picture, "players");
        } else {
          pictureFilePath = picture;
        }
      }

      const input: Player = {
        ...update,
        id: player.id,
        image: pictureFilePath,
        immunities: (immIds || [])
          .map((id: number) => immunities.data?.find((i) => i.id === id))
          .filter((i): i is DBImmunity => !!i),
        resistances: (resIds || [])
          .map((id: number) => resistances.data?.find((r) => r.id === id))
          .filter((r): r is DBResistance => !!r),
        effects: (effIds || [])
          .map((id: number) => effects.data?.find((e) => e.id === id))
          .filter((e): e is any => !!e),
      };

      const updatedPlayer = await onEdit(input);

      onComplete(updatedPlayer);

      setClosingReason("success");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.log("Error while updating a player");
      console.log(error);
    } finally {
      setIsLoading(false);
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

  function handleCreateImmunity() {
    openOverlay("immunity.create", {
      onCreate: async (immunity) => {
        const createdImmunity = await db.immunities.create(immunity);
        return createdImmunity;
      },
      onComplete: (immunity) => {
        const currentImmunities = form.getValues("immunities") || [];
        form.setValue("immunities", [...currentImmunities, immunity.id]);
        immunities.refetch();
      },
      onCancel: (reason) => {
        console.log("Immunity creation cancelled:", reason);
      },
    });
  }

  function handleCreateResistance() {
    openOverlay("resistance.create", {
      onCreate: async (resistance) => {
        const created = await db.resistances.create(resistance);
        return created;
      },
      onComplete: (resistance) => {
        const currentResistances = form.getValues("resistances") || [];
        form.setValue("resistances", [...currentResistances, resistance.id]);
        resistances.refetch();
      },
      onCancel: (reason) => {
        console.log("Resistance creation cancelled:", reason);
      },
    });
  }

  function handleOpenImmunityCatalog() {
    openOverlay("immunity.catalog", {
      onSelect: async (immunity) => {
        const currentImmunities = form.getValues("immunities") || [];
        form.setValue("immunities", [...currentImmunities, immunity.id]);
      },
      onCancel: (reason) => {
        console.log("Immunity catalog cancelled:", reason);
      },
    });
  }

  function handleOpenResistanceCatalog() {
    openOverlay("resistance.catalog", {
      onSelect: async (resistance) => {
        const currentResistances = form.getValues("resistances") || [];
        form.setValue("resistances", [...currentResistances, resistance.id]);
      },
      onCancel: (reason) => {
        console.log("Resistance catalog cancelled:", reason);
      },
    });
  }

  function handleOpenEffectCatalog() {
    openOverlay("effect.catalog", {
      onSelect: async (effect) => {
        const currentEffects = form.getValues("effects") || [];
        form.setValue("effects", [...currentEffects, effect.id]);
      },
      onCancel: (reason) => {
        console.log("Effect catalog cancelled:", reason);
      },
    });
  }

  function handleCreateEffect() {
    openOverlay("effect.create", {
      onCreate: async (effect) => {
        const createdEffect = await db.effects.create(effect);
        return createdEffect;
      },
      onComplete: (effect) => {
        const currentEffects = form.getValues("effects") || [];
        form.setValue("effects", [...currentEffects, effect.id]);
        effects.refetch();
      },
      onCancel: (reason) => {
        console.log("Effect creation cancelled:", reason);
      },
    });
  }

  function handleRemoveImmunity(id: number) {
    const currentImmunities = form.getValues("immunities") || [];
    form.setValue(
      "immunities",
      currentImmunities.filter((immunityId) => immunityId !== id),
    );
  }

  function handleRemoveResistance(id: number) {
    const currentResistances = form.getValues("resistances") || [];
    form.setValue(
      "resistances",
      currentResistances.filter((resistanceId) => resistanceId !== id),
    );
  }

  function handleRemoveEffect(id: number) {
    const currentEffects = form.getValues("effects") || [];
    form.setValue(
      "effects",
      currentEffects.filter((effectId) => effectId !== id),
    );
  }

  return (
    <Drawer
      onExitComplete={onExitComplete}
      open={open}
      onOpenChange={handleOpenChange}
      description={""}
      title={t("editPlayer")}
      cancelTrigger={
        <Button
          disabled={isLoading}
          variant="ghost"
          onClick={handleCancelClick}
        >
          {t("cancel")}
        </Button>
      }
      actions={
        <Button disabled={isLoading} onClick={handleSavePlayer}>
          {t("save")}
        </Button>
      }
    >
      <div className="scrollable-y overflow-y-scroll pr-0.5 pb-10">
        <EditPlayerForm form={form} disabled={isLoading} player={player!}>
          <EditPlayerForm.Immunities>
            <div className="mt-4 flex flex-col gap-2 px-1">
              <div className="flex justify-between gap-4">
                <TypographyH2>{t("immunities")}</TypographyH2>
                <div className="flex grow justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCreateImmunity}
                  >
                    {t("create")}
                  </Button>

                  <Button type="button" onClick={handleOpenImmunityCatalog}>
                    {t("catalog")}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {(form.watch("immunities") || [])
                  .map((id: number) =>
                    immunities.data?.find((im) => im.id === id),
                  )
                  .filter((i): i is DBImmunity => !!i)
                  .map((immunity: DBImmunity) => (
                    <ImmunityCard
                      key={`immunity-${immunity.id}`}
                      immunity={immunity}
                      onDelete={() => handleRemoveImmunity(immunity.id)}
                    />
                  ))}
              </div>
            </div>
          </EditPlayerForm.Immunities>

          <EditPlayerForm.Resistances>
            <div className="mt-4 flex flex-col gap-2 px-1">
              <div className="flex justify-between gap-4">
                <TypographyH2> {t("resistances")}</TypographyH2>
                <div className="flex grow justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCreateResistance}
                  >
                    {t("create")}
                  </Button>

                  <Button type="button" onClick={handleOpenResistanceCatalog}>
                    {t("catalog")}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {(form.watch("resistances") || [])
                  .map((id: number) =>
                    resistances.data?.find((re) => re.id === id),
                  )
                  .filter((r): r is DBResistance => !!r)
                  .map((resistance: DBResistance) => (
                    <ResistanceCard
                      key={`resistance-${resistance.id}`}
                      resistance={resistance}
                      onDelete={() => handleRemoveResistance(resistance.id)}
                    />
                  ))}
              </div>
            </div>
          </EditPlayerForm.Resistances>

          <EditPlayerForm.Effects>
            <div className="mt-4 flex flex-col gap-2 px-1">
              <div className="flex justify-between gap-4">
                <TypographyH2> {t("effects")}</TypographyH2>
                <div className="flex grow justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCreateEffect}
                  >
                    {t("create")}
                  </Button>
                  <Button type="button" onClick={handleOpenEffectCatalog}>
                    {t("catalog")}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {(form.watch("effects") || [])
                  .map((id: number) => effects.data?.find((e) => e.id === id))
                  .filter((e): e is any => !!e)
                  .map((effect: any) => (
                    <EffectCard
                      key={`effect-${effect.id}`}
                      effect={effect}
                      onRemove={() => handleRemoveEffect(effect.id)}
                    />
                  ))}
              </div>
            </div>
          </EditPlayerForm.Effects>
        </EditPlayerForm>
      </div>
    </Drawer>
  );
}

export default EditPlayerDrawer;