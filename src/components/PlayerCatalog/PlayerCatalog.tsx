import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Player } from "@/types/player";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

type Props = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onAdd: (player: Player["id"]) => void;
  excludedPlayers: Player[];
  players: Player[];
};

function PlayerCatalog({
  open,
  onOpenChange,
  excludedPlayers,
  onAdd,
  players,
}: Props) {
  const [search, setSearch] = useState("");

  function handleSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  //TODO: Add translations
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="m-4 p-4 pr-0">
        <div className="pr-4">
          <DialogHeader>
            <DialogTitle>Add a player to your group</DialogTitle>

            <DialogDescription>
              Recruit a hero from our catalog of adventure companions to join
              your team!
            </DialogDescription>
          </DialogHeader>

          <Input
            className="mt-4"
            placeholder="Search for a specific hero..."
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
                    onClick={() => onAdd(player.id)}
                    className="focus-visible:ring-ring hover:bg-secondary/80 focus-within:bg-secondary/80 flex w-full items-center justify-start gap-2 rounded-md p-1 ring-offset-1 outline-black transition-colors focus-within:outline-1 hover:cursor-pointer focus-visible:ring-1"
                  >
                    <Avatar>
                      <AvatarImage
                        src={`src(${player.image})`}
                        alt={player.name}
                      />
                      <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>

                    <div className="flex grow flex-col items-start justify-start">
                      <span className="text-xl font-bold">
                        {player.icon} {player.name}
                      </span>
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
