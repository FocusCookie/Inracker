import { storeImage } from "@/lib/utils";
import { TCreatePlayer } from "@/types/player";
import CreatePlayerForm from "../CreatePlayerForm/CreatePlayerForm";
import Drawer from "../Drawer/Drawer";
import { TypographyH2 } from "../ui/typographyh2";
import { DBImmunity } from "@/types/immunitiy";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import { DBResistance } from "@/types/resistances";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import { useCreatePlayer } from "@/hooks/useCreatePlayer";
import db from "@/lib/database";
import type { CancelReason, OverlayMap } from "@/types/overlay";
import { Button } from "../ui/button";
type OverlayProps = OverlayMap["player.create"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};
type Props = OverlayProps & RuntimeProps;

export default function CreatePlayerDrawer({
  open,
  onCreate,
  onComplete,
  onCancel,
  onOpenChange,
  onExitComplete,
}: Props) {
  const { t } = useTranslation("ComponentCreatePlayerDrawer");
  const openOverlay = useOverlayStore((s) => s.open);
  const [isCreating, setIsCreating] = useState(false);
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);
  const form = useCreatePlayer();

  const immunities = useQueryWithToast({
    queryKey: ["immunities"],
    queryFn: () => db.immunitites.getAll(),
  });

  const resistances = useQueryWithToast({
    queryKey: ["resistances"],
    queryFn: () => db.resistances.getAll(),
  });

  async function handleSubmit(values: any) {
    try {
      setIsCreating(true);

      let pictureFilePath: string | null = null;
      if (values.picture) {
        pictureFilePath = await storeImage(values.picture, "players");
      }

      const input: TCreatePlayer = {
        name: values.name,
        details: values.details ?? "",
        overview: values.overview ?? "",
        icon: values.icon,
        level: values.level,
        max_health: values.maxHealth,
        health: values.maxHealth,
        ep: values.ep,
        role: values.role,
        image: pictureFilePath || "",
        immunities: values.immunities,
        resistances: values.resistances,
        effects: [],
      };

      console.log("create ", input);
      const created = await onCreate(input); // must return { id: number }

      onComplete(created);

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

  function handleCreateImmunity() {
    openOverlay("immunity.create", {
      onCreate: async (immunity) => {
        const createdImmunity = await db.immunitites.create(immunity);

        return createdImmunity;
      },
      onComplete: (immunity) => {
        const currentImmunities = form.getValues("immunities");
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
        const currentResistances = form.getValues("resistances");
        form.setValue("resistances", [...currentResistances, resistance.id]);

        console.log(form.getValues("resistances"));
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
        const currentImmunities = form.getValues("immunities");
        form.setValue("immunities", [...currentImmunities, immunity.id]);
      },
      onCancel: (reason) => {
        console.log("Immunity catalog cancelled:", reason);
      },
    });
  }

  function handleOpenResistanceCatalog() {
    openOverlay("resistance.catalog", {
      onSelect: async (resistances) => {
        const currentResistances = form.getValues("resistances");
        form.setValue("resistances", [...currentResistances, resistances.id]);
      },
      onCancel: (reason) => {
        console.log("Resistance catalog cancelled:", reason);
      },
    });
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      onExitComplete={onExitComplete}
      description={t("descriptionText")}
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
      <div className="scrollable-y overflow-y-scroll pr-0.5">
        <CreatePlayerForm form={form} disabled={isCreating}>
          <CreatePlayerForm.Immunities>
            <div className="flex flex-col gap-2">
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
                {form
                  .watch("immunities")
                  .map((id: number) =>
                    immunities.data?.find((im) => im.id === id),
                  )
                  .filter(
                    (immunity): immunity is DBImmunity =>
                      immunity !== undefined,
                  )
                  .map((immunity: DBImmunity) => (
                    <ImmunityCard
                      key={`immunity-${immunity.id}`}
                      immunity={immunity}
                    />
                  ))}
              </div>
            </div>
          </CreatePlayerForm.Immunities>

          <CreatePlayerForm.Resistances>
            <div className="flex flex-col gap-2">
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
                {form
                  .watch("resistances")
                  .map((id: number) =>
                    resistances.data?.find((re) => re.id === id),
                  )
                  .filter(
                    (resistance): resistance is DBResistance =>
                      resistance !== undefined,
                  )
                  .map((resistance: DBResistance) => (
                    <ResistanceCard
                      key={`resistance-${resistance.id}`}
                      resistance={resistance}
                    />
                  ))}
              </div>
            </div>
          </CreatePlayerForm.Resistances>
        </CreatePlayerForm>
      </div>
    </Drawer>
  );
}
