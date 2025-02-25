import { Party } from "@/types/party";
import { Player } from "@/types/player";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { useTranslation } from "react-i18next";

type Props = {
  partyId: Party["id"];
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onAdd: (partyId: Party["id"], player: Player["id"]) => void;
  excludedPlayers: Player[];
  players: Player[];
};

function PlayerCatalog({
  partyId,
  open,
  excludedPlayers,
  players,
  onAdd,
  onOpenChange,
}: Props) {
  const { t } = useTranslation("ComponentPlayerCatalog");
  const [search, setSearch] = useState("");

  function handleSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="m-4 p-4 pr-0">
        <div className="pr-4">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>

            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <Input
            className="mt-4"
            placeholder={t("search")}
            onChange={handleSearchTerm}
          />
        </div>

        <div className="max-h-[200px] overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="flex h-full flex-col gap-4 p-1">
              {players
                .filter((player) =>
                  player.name.toLowerCase().includes(search.toLowerCase()),
                )
                .filter(
                  (player) =>
                    !excludedPlayers.some(
                      (exPlayer) => exPlayer.id === player.id,
                    ),
                )
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onAdd(partyId, player.id)}
                    className="focus-visible:ring-ring hover:bg-secondary/80 focus-within:bg-secondary/80 flex w-full items-center justify-start gap-2 rounded-md p-1 ring-offset-1 outline-black transition-colors focus-within:outline-1 hover:cursor-pointer focus-visible:ring-1"
                  >
                    <div className="hover:bg-accent relative grid h-16 w-16 place-content-center rounded-md">
                      <Avatar>
                        <AvatarImage
                          src={player.image || undefined}
                          alt={player.name}
                        />
                        <AvatarFallback>{player.icon}</AvatarFallback>
                      </Avatar>

                      <span className="absolute top-0 right-0 rounded-full bg-white p-0.5 shadow">
                        {player.icon}
                      </span>
                    </div>

                    <div className="flex grow flex-col items-start justify-start">
                      <span className="text-xl font-bold">{player.name}</span>
                    </div>

                    <Badge variant="outline">{player.role}</Badge>
                    <Badge variant="outline">LVL {player.level}</Badge>
                  </button>
                ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PlayerCatalog;
