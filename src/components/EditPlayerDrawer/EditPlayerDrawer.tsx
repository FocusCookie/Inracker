import { useEffect } from "react";
import Drawer from "../Drawer/Drawer";
import { Button } from "../ui/button";
import { Player } from "@/types/player";
import EditPlayerForm from "../EditPlayerForm/EditPlayerForm";
import { storeImage } from "@/lib/utils";
import { DBResistance } from "@/types/resistances";
import { DBImmunity } from "@/types/immunitiy";
import { DBEffect } from "@/types/effect";

type Props = {
  player: Player | null;
  open: boolean;
  loading: boolean;
  /**
   * the form which controls all the inputs
   */
  form: any;
  onOpenChange: (state: boolean) => void;
  onSave: (player: Player) => void;
};

function EditPlayerDrawer({
  player,
  open,
  loading,
  form,
  onOpenChange,
  onSave,
}: Props) {
  async function handleSavePlayer() {
    const { picture, resistances, immunities, effects, ...update } =
      form.getValues();
    let pictureFilePath: string | null = player?.image || null;

    if (!!picture) {
      pictureFilePath = await storeImage(picture, "players");
    }

    onSave({
      ...update,
      image: pictureFilePath,
      resistances: resistances.map((resistance: DBResistance) => resistance.id),
      immunities: immunities.map((immunity: DBImmunity) => immunity.id),
      effects: effects.map((effect: DBEffect) => effect.id),
    });
  }

  useEffect(() => {
    if (!!player) {
      form.reset(player);
    }
  }, [player]);

  return (
    <Drawer
      open={open && !!player}
      onOpenChange={onOpenChange}
      description={"description"}
      title={"Edit Player"}
      cancelTrigger={
        <Button disabled={loading} variant="ghost">
          Cancel
        </Button>
      }
      actions={
        <Button loading={loading} onClick={handleSavePlayer}>
          Save
        </Button>
      }
    >
      <div className="scrollable-y overflow-y-scroll pr-0.5">
        <EditPlayerForm form={form} disabled={loading} player={player!} />
      </div>
    </Drawer>
  );
}

export default EditPlayerDrawer;
