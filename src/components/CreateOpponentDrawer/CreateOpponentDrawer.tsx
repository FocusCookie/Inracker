import { DBImmunity } from "@/types/immunitiy";
import { Opponent } from "@/types/opponents";
import { DBResistance } from "@/types/resistances";
import { useTranslation } from "react-i18next";
import Drawer from "../Drawer/Drawer";
import { Button } from "../ui/button";
import { storeImage } from "@/lib/utils";
import CreateOpponentForm from "../CreateOpponentForm/CreateOpponentForm";
import { TypographyH2 } from "../ui/typographyh2";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import ResistanceCard from "../ResistanceCard/ResistanceCard";

type Props = {
  open: boolean;
  loading: boolean;
  /**
   * the form which controls all the inputs
   */
  form: any;
  immunities: DBImmunity[];
  resistances: DBResistance[];
  onOpenChange: (state: boolean) => void;
  onCreate: (opponent: Omit<Opponent, "id">) => void;
  onOpenImmunityCatalog: () => void;
  onOpenResistanceCatalog: () => void;
  onCreateImmunity: () => void;
  onCreateResistance: () => void;
};

function CreateOpponentDrawer({
  open,
  loading,
  form,
  immunities,
  resistances,
  onOpenChange,
  onCreate,
  onOpenImmunityCatalog,
  onOpenResistanceCatalog,
  onCreateImmunity,
  onCreateResistance,
}: Props) {
  const { t } = useTranslation("ComponentCreateOpponentDrawer");

  async function handleCreateOpponent() {
    const {
      picture,
      details,
      icon,
      labels,
      immunities,
      level,
      maxHealth,
      name,
      resistances,
    } = form.getValues();
    let pictureFilePath: string | null = null;

    if (!!picture) {
      pictureFilePath = await storeImage(picture, "players");
    }

    onCreate({
      details,
      icon,
      immunities,
      labels,
      level,
      name,
      resistances,
      health: maxHealth,
      max_health: maxHealth,
      effects: [],
      image: pictureFilePath || "",
    });
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      description={t("descriptionText")}
      title={t("title")}
      cancelTrigger={
        <Button disabled={loading} variant="ghost">
          {t("cancel")}
        </Button>
      }
      actions={
        <Button loading={loading} onClick={handleCreateOpponent}>
          {t("create")}
        </Button>
      }
    >
      <CreateOpponentForm form={form} disabled={loading}>
        <CreateOpponentForm.Immunities>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between gap-4">
              <TypographyH2>{t("immunities")}</TypographyH2>
              <div className="flex grow justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCreateImmunity}
                >
                  {t("create")}
                </Button>

                <Button type="button" onClick={onOpenImmunityCatalog}>
                  {t("catalog")}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {form
                .watch("immunities")
                .map((id: number) => immunities.find((im) => im.id === id))
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
                  onClick={onCreateResistance}
                >
                  {t("create")}
                </Button>

                <Button type="button" onClick={onOpenResistanceCatalog}>
                  {t("catalog")}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {form
                .watch("resistances")
                .map((id: number) => resistances.find((re) => re.id === id))
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
