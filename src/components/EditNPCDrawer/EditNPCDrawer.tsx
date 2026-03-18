import { useTranslation } from "react-i18next";
import Drawer from "../Drawer/Drawer";
import { Button } from "../ui/button";
import { storeImage } from "@/lib/utils";
import CreateNPCForm from "../CreateNPCForm/CreateNPCForm";
import { TypographyH2 } from "../ui/typographyh2";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import { useState, useEffect } from "react";
import { useCreateNPC } from "@/hooks/useCreateNPC";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import { useOverlayStore } from "@/stores/useOverlayStore";
import type { CancelReason, OverlayMap } from "@/types/overlay";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import { DBWeakness } from "@/types/weakness";
import { NPC } from "@/types/npcs";
import WeaknessCard from "../WeaknessCard/WeaknessCard";

type OverlayProps = OverlayMap["npc.edit"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};
type Props = OverlayProps & RuntimeProps;

function EditNPCDrawer({
  open,
  onOpenChange,
  onExitComplete,
  npc,
  onEdit,
  onComplete,
  onCancel,
}: Props) {
  const { t } = useTranslation("ComponentEditNPCDrawer");
  const openOverlay = useOverlayStore((s) => s.open);
  const [isUpdating, setIsUpdating] = useState(false);
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);
  const form = useCreateNPC();

  useEffect(() => {
    if (npc) {
      form.reset({
        name: npc.name,
        details: npc.details,
        max_health: npc.max_health,
        level: npc.level,
        icon: npc.icon,
        image: npc.image || "",
        labels: npc.labels,
        immunities: npc.immunities.map((i) => i.id),
        resistances: npc.resistances.map((r) => r.id),
        weaknesses: npc.weaknesses.map((w) => w.id),
      });
    }
  }, [npc, form]);

  const immunities = useQueryWithToast({
    queryKey: ["immunities"],
    queryFn: () => db.immunities.getAll(),
  });

  const resistances = useQueryWithToast({
    queryKey: ["resistances"],
    queryFn: () => db.resistances.getAll(),
  });

  const weaknesses = useQueryWithToast({
    queryKey: ["weaknesses"],
    queryFn: () => db.weaknesses.getAll(),
  });

  async function handleSubmit() {
    try {
      setIsUpdating(true);
      const values = form.getValues();

      let pictureFilePath: string | null = null;
      if (values.image) {
        if (values.image instanceof File) {
          pictureFilePath = await storeImage(values.image, "npcs");
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

      const selectedWeaknesses = (values.weaknesses || [])
        .map((id) => weaknesses.data?.find((w) => w.id === id))
        .filter((w): w is DBWeakness => !!w);

      const input: NPC = {
        ...npc,
        ...values,
        health: values.max_health, // Usually we want to keep current health, but for Blueprint edit we might reset? Opponent edit usually doesn't have current health input.
        image: pictureFilePath || "",
        effects: npc.effects,
        immunities: selectedImmunities,
        resistances: selectedResistances,
        weaknesses: selectedWeaknesses,
        labels: values.labels || [],
      };

      const updated = await onEdit(input);
      await Promise.resolve(onComplete(updated));
      setClosingReason("success");
      onOpenChange(false);
    } finally {
      setIsUpdating(false);
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

  function handleCreateWeakness() {
    openOverlay("weakness.create", {
      onCreate: async (weakness) => {
        const created = await db.weaknesses.create(weakness);
        return created;
      },
      onComplete: (weakness) => {
        const currentWeaknesses = form.getValues("weaknesses") || [];
        form.setValue("weaknesses", [...currentWeaknesses, weakness.id]);
        weaknesses.refetch();
      },
      onCancel: (reason) => {
        console.log("Weakness creation cancelled:", reason);
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

  function handleOpenWeaknessCatalog() {
    openOverlay("weakness.catalog", {
      onSelect: async (weakness) => {
        const currentWeaknesses = form.getValues("weaknesses") || [];
        form.setValue("weaknesses", [...currentWeaknesses, weakness.id]);
      },
      onCancel: (reason) => {
        console.log("Weakness catalog cancelled:", reason);
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
          disabled={isUpdating}
          variant="ghost"
        >
          {t("cancel")}
        </Button>
      }
      actions={
        <Button disabled={isUpdating} onClick={form.handleSubmit(handleSubmit)}>
          {t("update")}
        </Button>
      }
    >
      <CreateNPCForm form={form} disabled={isUpdating}>
        <CreateNPCForm.Immunities>
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
        </CreateNPCForm.Immunities>

        <CreateNPCForm.Resistances>
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
        </CreateNPCForm.Resistances>

        <CreateNPCForm.Weaknesses>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between gap-4">
              <TypographyH2> {t("weaknesses")}</TypographyH2>
              <div className="flex grow justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCreateWeakness}
                >
                  {t("create")}
                </Button>

                <Button type="button" onClick={handleOpenWeaknessCatalog}>
                  {t("catalog")}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {(form.watch("weaknesses") || [])
                .map((id: number) =>
                  weaknesses.data?.find((w) => w.id === id),
                )
                .filter((w): w is DBWeakness => !!w)
                .map((weakness: DBWeakness) => (
                  <WeaknessCard
                    key={`weakness-${weakness.id}`}
                    weakness={weakness}
                  />
                ))}
            </div>
          </div>
        </CreateNPCForm.Weaknesses>
      </CreateNPCForm>
    </Drawer>
  );
}

export default EditNPCDrawer;
