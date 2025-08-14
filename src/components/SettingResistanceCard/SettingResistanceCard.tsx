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
import { DBResistance } from "@/types/resistances";

type Props = {
  resistance: DBResistance;
  onDelete: (resistanceId: DBResistance["id"]) => void;
  onEdit: (resistance: DBResistance) => void;
};

function SettingResistanceCard({ resistance, onDelete, onEdit }: Props) {
  const { t } = useTranslation("ComponentSettingResistanceCard");

  return (
    <div className="focus-visible:ring-ring hover:bg-secondary/80 focus-within:bg-secondary/80 flex w-full items-center justify-start gap-2 rounded-md p-4 ring-offset-1 outline-black transition-colors focus-within:outline-1 focus-visible:ring-1">
      <div className="flex grow items-center justify-start gap-2">
        <span className="text-4xl">{resistance.icon}</span>
        <span className="text-xl font-bold">{resistance.name}</span>
      </div>

      <div className="flex gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">{t("delete")}</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {t("delete")} {resistance.name}
              </DialogTitle>
              <DialogDescription>{t("deletionWarning")}</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="destructive"
                type="button"
                onClick={() => onDelete(resistance.id)}
              >
                {t("deleteResistance")} {resistance.name}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button onClick={() => onEdit(resistance)} variant="outline">
          {t("edit")}
        </Button>
      </div>
    </div>
  );
}

export default SettingResistanceCard;
