import { storeImage } from "@/lib/utils";
import { TCreatePlayer } from "@/types/player";
import CreatePlayerForm from "../CreatePlayerForm/CreatePlayerForm";
import Drawer from "../Drawer/Drawer";
import { Button } from "../ui/button";
import { TypographyH2 } from "../ui/typographyh2";
import { DBImmunity } from "@/types/immunitiy";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import { DBResistance } from "@/types/resistances";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import { useTranslation } from "react-i18next";

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
  onCreate: (player: TCreatePlayer) => void;
  onOpenImmunityCatalog: () => void;
  onOpenResistanceCatalog: () => void;
  onCreateImmunity: () => void;
  onCreateResistance: () => void;
};

function CreatePlayerDrawer({
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
  const { t } = useTranslation("ComponentCreatePlayerDrawer");

  async function handleCreatePlayer() {
    const {
      picture,
      details,
      ep,
      icon,
      immunities,
      level,
      maxHealth,
      name,
      overview,
      resistances,
      role,
    } = form.getValues();
    let pictureFilePath: string | null = null;

    if (!!picture) {
      pictureFilePath = await storeImage(picture, "players");
    }

    onCreate({
      details,
      ep,
      icon,
      immunities,
      level,
      name,
      overview,
      resistances,
      role,
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
        <Button loading={loading} onClick={handleCreatePlayer}>
          {t("create")}
        </Button>
      }
    >
      <div className="scrollable-y overflow-y-scroll pr-0.5">
        <CreatePlayerForm form={form} disabled={loading}>
          <CreatePlayerForm.Immunities>
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
          </CreatePlayerForm.Immunities>

          <CreatePlayerForm.Resistances>
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
          </CreatePlayerForm.Resistances>
        </CreatePlayerForm>
      </div>
    </Drawer>
  );
}

export default CreatePlayerDrawer;
