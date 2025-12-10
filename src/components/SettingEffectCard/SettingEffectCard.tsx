import { Effect } from "@/types/effect";
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

type Props = {
  effect: Effect;
  onDelete: (effectId: Effect["id"]) => void;
  onEdit: (effect: Effect) => void;
};

function SettingEffectCard({ effect, onDelete, onEdit }: Props) {
  const { t } = useTranslation("ComponentSettingEffectCard");

  return (
    <div className="focus-visible:ring-ring hover:bg-secondary/80 focus-within:bg-secondary/80 flex w-full items-center justify-start gap-2 rounded-md p-4 ring-offset-1 outline-black transition-colors focus-within:outline-1 focus-visible:ring-1">
      <div className="flex grow items-center justify-start gap-2">
        <span className="text-4xl">{effect.icon}</span>
        <span className="text-xl font-bold">{effect.name}</span>
      </div>

      <div className="flex gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">{t("delete")}</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {t("delete")} {effect.name}
              </DialogTitle>
              <DialogDescription>{t("deletionWarning")}</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="destructive"
                type="button"
                onClick={() => onDelete(effect.id)}
              >
                {t("deleteEffect")} {effect.name}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button onClick={() => onEdit(effect)} variant="outline">
          {t("edit")}
        </Button>
      </div>
    </div>
  );
}

export default SettingEffectCard;
