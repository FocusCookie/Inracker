import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { NPC } from "@/types/npcs";

type Props = {
  npc: NPC;
  onDelete: (npcId: NPC["id"]) => void;
  onEdit: (npc: NPC) => void;
};

function SettingsNPCCard({ npc, onDelete, onEdit }: Props) {
  const { t } = useTranslation("ComponentSettingsNPCCard");

  return (
    <div className="focus-visible:ring-ring hover:bg-secondary/80 focus-within:bg-secondary/80 flex w-full items-center justify-start gap-2 rounded-md p-4 ring-offset-1 outline-black transition-colors focus-within:outline-1 focus-visible:ring-1 border">
      <div className="flex grow items-center justify-start gap-2">
        <span className="text-4xl">{npc.icon}</span>
        <span className="text-xl font-bold">{npc.name}</span>
      </div>

      <div className="flex gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">{t("delete")}</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {t("delete")} {npc.name}
              </DialogTitle>
              <DialogDescription>{t("deletionWarning")}</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="destructive"
                type="button"
                onClick={() => onDelete(npc.id)}
              >
                {t("deleteNPC")} {npc.name}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button onClick={() => onEdit(npc)} variant="outline">
          {t("edit")}
        </Button>
      </div>
    </div>
  );
}

export default SettingsNPCCard;
