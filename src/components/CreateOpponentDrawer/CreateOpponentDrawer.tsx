import { useTranslation } from "react-i18next";
import Drawer from "../Drawer/Drawer";
import { Button } from "../ui/button";
import { storeImage } from "@/lib/utils";
import CreateOpponentForm from "../CreateOpponentForm/CreateOpponentForm";
import { TypographyH2 } from "../ui/typographyH2";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import { useState } from "react";
import { useCreateOpponent } from "@/hooks/useCreateOpponent";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import { useOverlayStore } from "@/stores/useOverlayStore";
import type { CancelReason, OverlayMap } from "@/types/overlay";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import { Opponent } from "@/types/opponents";

type OverlayProps = OverlayMap["opponent.create"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};
type Props = OverlayProps & RuntimeProps;

function CreateOpponentDrawer({
  open,
  onOpenChange,
  onExitComplete,
  onCreate,
  onComplete,
  onCancel,
}: Props) {
  const { t } = useTranslation("ComponentCreateOpponentDrawer");
  const openOverlay = useOverlayStore((s) => s.open);
  const [isCreating, setIsCreating] = useState(false);
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);
  const form = useCreateOpponent();

  const immunities = useQueryWithToast({
    queryKey: ["immunities"],
    queryFn: () => db.immunities.getAll(),
  });

  const resistances = useQueryWithToast({
    queryKey: ["resistances"],
    queryFn: () => db.resistances.getAll(),
  });

  async function handleSubmit() {
    try {
      setIsCreating(true);
      const values = form.getValues();

      let pictureFilePath: string | null = null;
      if (values.image) {
        if (values.image instanceof File) {
          pictureFilePath = await storeImage(values.image, "opponents");
        } else {
          pictureFilePath = values.image;
        }
      }

      const selectedImmunities = (values.immunities || [])
        .map((id) => immunities.data?.find((i) => i.id === id))
        .filter((i): i is DBImmunity => !!i);

      const selectedResistances = (values.resistances || [])
        .map((id) => resistances.data?.find((r) => r.id === id))
        .filter((r): r is DBResistance => !!r);

      const input: Omit<Opponent, "id"> = {
        ...values,
        health: values.max_health,
        image: pictureFilePath || "",
        effects: [],
        immunities: selectedImmunities,
        resistances: selectedResistances,
      };

      const created = await onCreate(input);
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

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      onExitComplete={onExitComplete}
      description={t("descriptionText")}
      title={t("title")}
      cancelTrigger={
        <Button
          onClick={handleCancelClick}
          disabled={isCreating}
          variant="ghost"
        >
          {t("cancel")}
        </Button>
      }
      actions={
        <Button disabled={isCreating} onClick={form.handleSubmit(handleSubmit)}>
          {t("create")}
        </Button>
      }
    >
      <CreateOpponentForm form={form} disabled={isCreating}>
        <CreateOpponentForm.Immunities>
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
              {(form.watch("immunities") || [])
                .map((id: number) =>
                  immunities.data?.find((im) => im.id === id),
                )
                .filter((i): i is DBImmunity => !!i)
                .map((immunity: DBImmunity) => (
                  <ImmunityCard
                    key={`immunity-${immunity.id}`}
                    immunity={immunity}
                  />
                ))}
            </div>
          </div>
        </CreateOpponentForm.Immunities>

        <CreateOpponentForm.Resistances>
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
              {(form.watch("resistances") || [])
                .map((id: number) =>
                  resistances.data?.find((re) => re.id === id),
                )
                .filter((r): r is DBResistance => !!r)
                .map((resistance: DBResistance) => (
                  <ResistanceCard
                    key={`resistance-${resistance.id}`}
                    resistance={resistance}
                  />
                ))}
            </div>
          </div>
        </CreateOpponentForm.Resistances>
      </CreateOpponentForm>
    </Drawer>
  );
}

export default CreateOpponentDrawer;
