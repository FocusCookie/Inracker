import { Player } from "@/types/player";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { useTranslation } from "react-i18next";
import { OverlayMap } from "@/types/overlay";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import Catalog from "../Catalog/Catalog";
import { useAllPlayers, useCreatePlayer } from "@/hooks/usePlayers";
import { toast } from "@/hooks/use-toast";
import database from "@/lib/database";

type OverlayProps = OverlayMap["player.catalog"];

type RuntimeProps = {
  database: typeof database;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};

type Props = OverlayProps & RuntimeProps;

function PlayerCatalog({
  database,
  partyId,
  open,
  excludedPlayers,
  onSelect,
  onCancel,
  onExitComplete,
  onOpenChange,
}: Props) {
  const { t } = useTranslation("ComponentPlayerCatalog");
  const openOverlay = useOverlayStore((s) => s.open);
  const [search, setSearch] = useState("");

  const players = useAllPlayers(database);
  const createPlayer = useCreatePlayer(database);

  function handleCreatePlayer() {
    openOverlay("player.create", {
      onCreate: (player) => createPlayer.mutateAsync(player),
      onComplete: (player) => {
        toast({
          variant: "default",
          title: `Created ${player.icon} ${player.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Player creation cancelled:", reason);
      },
    });
  }

  async function handleAddPlayer(player: Player) {
    await onSelect(partyId, player.id);
    onOpenChange(false);
  }

  function handleCancelClick() {
    onCancel?.("cancel");
    onOpenChange(false);
  }

  function handleOpenChange(state: boolean) {
    if (!state && !players.data) {
      onCancel?.("dismissed");
    }

    onOpenChange(state);
  }

  return (
    <Catalog
      open={open}
      onOpenChange={handleOpenChange}
      onExitComplete={onExitComplete}
      title={t("title")}
      description={t("description")}
      placeholder={t("search")}
      search={search}
      onSearchChange={setSearch}
      onCancel={handleCancelClick}
    >
      {players.data && (
        <ScrollArea className="h-full pr-4">
          <div className="flex h-full flex-col gap-4 p-1">
            {players.data
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
                  onClick={() => handleAddPlayer(player)}
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
      )}

      {!players.data ||
        (players.data.filter(
          (player) =>
            !excludedPlayers.some((exPlayer) => exPlayer.id === player.id),
        ).length === 0 && (
          <Alert>
            <MoonIcon />
            <AlertTitle>{t("noPlayers")}</AlertTitle>
            <AlertDescription>
              {t("noPlayersDescription")}
              <div className="flex w-full justify-center">
                <Button onClick={handleCreatePlayer} className="mt-2">
                  {t("createPlayer")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}
    </Catalog>
  );
}

export default PlayerCatalog;
