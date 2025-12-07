import { useEffect, useState } from "react";
import Drawer from "../Drawer/Drawer";
import { Button } from "../ui/button";
import EditPlayerForm from "../EditPlayerForm/EditPlayerForm";
import { storeImage } from "@/lib/utils";
import { useEditPlayer } from "@/hooks/useEditPlayer";
import { CancelReason, OverlayMap } from "@/types/overlay";

type OverlayProps = OverlayMap["player.edit"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void; // host removes after exit
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);

  useEffect(() => {
    if (!!player) {
      form.reset();
    }
  }, [player]);

  async function handleSavePlayer() {
    try {
      setIsLoading(true);

      const { picture, resistances, immunities, effects, ...update } =
        form.getValues();
      let pictureFilePath: string | null = player?.image || null;

      if (!!picture) {
        pictureFilePath = await storeImage(picture, "players");
      }

      const updatedPlayer = await onEdit({
        ...update,
        image: pictureFilePath,
        resistances: player.resistances,
        immunities: player.immunities,
        effects: player.effects,
      });

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

  return (
    <Drawer
      onExitComplete={onExitComplete}
      open={open}
      onOpenChange={handleOpenChange}
      description={"description"}
      title={"Edit Player"}
      cancelTrigger={
        <Button
          disabled={isLoading}
          variant="ghost"
          onClick={handleCancelClick}
        >
          Cancel
        </Button>
      }
      actions={
        <Button disabled={isLoading} onClick={handleSavePlayer}>
          Save
        </Button>
      }
    >
      <div className="scrollable-y overflow-y-scroll pr-0.5">
        <EditPlayerForm form={form} disabled={isLoading} player={player!} />
      </div>
    </Drawer>
  );
}

export default EditPlayerDrawer;
