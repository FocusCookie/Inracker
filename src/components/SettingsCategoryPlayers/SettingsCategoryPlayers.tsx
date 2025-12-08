import React, { useState } from "react";
import defaultDb from "@/lib/database";
import { Input } from "../ui/input";
import { Player } from "@/types/player";
import { useTranslation } from "react-i18next";
import SettingPlayerCard from "../SettingPlayerCard/SettingPlayerCard";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { TypographyH1 } from "../ui/typographyH1";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  useAllPlayers,
  useCreatePlayer,
  useDeletePlayer,
  useUpdatePlayer,
} from "@/hooks/usePlayers";

type Props = {
  database?: typeof defaultDb;
};

function SettingsCategoryPlayers({ database = defaultDb }: Props) {
  const { t } = useTranslation("ComponentSettingsCategoryPlayers");
  const openOverlay = useOverlayStore((s) => s.open);
  const [search, setSearch] = useState<string>("");

  const players = useAllPlayers(database);
  const createPlayer = useCreatePlayer(database);
  const editPlayer = useUpdatePlayer(database);
  const deletePlayer = useDeletePlayer(database);

  function handleOpenCreatePlayer() {
    openOverlay("player.create", {
      onCreate: (player) => createPlayer.mutateAsync(player),
      onComplete: async (player) => {
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

  function handlePlayerSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  function handleOpenEditPlayer(player: Player) {
    openOverlay("player.edit", {
      player,
      onEdit: (player) => editPlayer.mutateAsync(player),
      onComplete: async (player) => {
        console.log("Updated: ", player);
      },
      onCancel: (reason) => {
        console.log("Player creation cancelled:", reason);
      },
    });
  }

  async function handleDeletePlayer(playerId: Player["id"]) {
    const player = await deletePlayer.mutateAsync(playerId);

    toast({
      title: `Deleted ${player.icon} ${player.name} successfully`,
    });
  }

  return (
    <>
      <div className="flex justify-between gap-4">
        <TypographyH1>{t("players")}</TypographyH1>

        {players.data && players.data.length > 0 && (
          <Button onClick={handleOpenCreatePlayer} className="mt-2">
            {t("createPlayer")}
          </Button>
        )}
      </div>

      {!players.data ||
        (players.data.length === 0 && (
          <Alert>
            <MoonIcon />
            <AlertTitle>{t("noPlayers")}</AlertTitle>
            <AlertDescription>
              {t("noPlayersDescription")}
              <div className="flex w-full justify-center">
                <Button onClick={handleOpenCreatePlayer} className="mt-2">
                  {t("createPlayer")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}

      {players.data && players.data.length > 0 && (
        <>
          <Input
            className="mt-4"
            placeholder={t("searchPlaceholder")}
            onChange={handlePlayerSearchTerm}
          />

          <div className="scrollable-y overflow-y-scroll p-0.5">
            <div className="flex h-full max-h-96 flex-col gap-4">
              {players.data
                .filter((player) =>
                  player.name.toLowerCase().includes(search.toLowerCase()),
                )

                .map((player) => (
                  <SettingPlayerCard
                    key={player.id}
                    player={player}
                    onDelete={handleDeletePlayer}
                    onEdit={handleOpenEditPlayer}
                  />
                ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SettingsCategoryPlayers;
