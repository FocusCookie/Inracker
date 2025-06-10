import { Player } from "@/types/player";
import React from "react";
import IconAvatar from "../IconAvatar/IconAvatar";
import { Badge } from "../ui/badge";
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
  player: Player;
  onDelete: (playerId: Player["id"]) => void;
  onEdit: (player: Player) => void;
};

function SettingPlayerCard({ onDelete, onEdit, player }: Props) {
  const { t } = useTranslation("ComponentSettingPlayerCard");

  return (
    <div className="focus-visible:ring-ring hover:bg-secondary/80 focus-within:bg-secondary/80 flex w-full items-center justify-start gap-2 rounded-md p-4 ring-offset-1 outline-black transition-colors focus-within:outline-1 focus-visible:ring-1">
      <IconAvatar player={player} />

      <div className="flex grow flex-col items-start justify-start">
        <span className="text-xl font-bold">{player.name}</span>

        <div className="flex gap-2">
          <Badge variant="outline">{player.role}</Badge>
          <Badge variant="outline">
            {t("level")} {player.level}
          </Badge>
        </div>
      </div>

      <div className="flex gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">{t("delete")}</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {t("delete")} {player.name}
              </DialogTitle>
              <DialogDescription>{t("deletionWarning")}</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="destructive"
                type="button"
                onClick={() => onDelete(player.id)}
              >
                {t("deleteCharacter")} {player.name}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button onClick={() => onEdit(player)} variant="outline">
          {t("edit")}
        </Button>
      </div>
    </div>
  );
}

export default SettingPlayerCard;
