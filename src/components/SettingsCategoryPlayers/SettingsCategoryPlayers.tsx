import React, { useState } from "react";
import db from "@/lib/database";
import { Input } from "../ui/input";
import { Player } from "@/types/player";
import { useTranslation } from "react-i18next";
import SettingPlayerCard from "../SettingPlayerCard/SettingPlayerCard";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryClient } from "@tanstack/react-query";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { TypographyH1 } from "../ui/typographyH1";
import { toast } from "@/hooks/use-toast";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "lucide-react";
import { Button } from "../ui/button";

type Props = {};

function SettingsCategoryPlayers({}: Props) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("ComponentSettingsCategoryPlayers");
  const openOverlay = useOverlayStore((s) => s.open);
  const [search, setSearch] = useState<string>("");

  const players = useQueryWithToast({
    queryKey: ["players"],
    queryFn: () => db.players.getAllDetailed(),
  });

  const createPlayer = useMutationWithErrorToast({
    mutationFn: db.players.create,
    onSuccess: (player: Player) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast({
        variant: "default",
        title: `Created ${player.icon} ${player.name}`,
      });
    },
  });

  const editPlayer = useMutationWithErrorToast({
    mutationFn: db.players.update,
    onSuccess: (_player: Player) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });

  const deletePlayer = useMutationWithErrorToast({
    mutationFn: db.players.deletePlayerById,
    onSuccess: (player: Player) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });

      toast({
        title: `Deleted ${player.icon} ${player.name} successfully`,
      });
    },
  });

  function handleOpenCreatePlayer() {
    openOverlay("player.create", {
      onCreate: (player) => createPlayer.mutateAsync(player),
      onComplete: async (_player) => {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
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
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
      },
      onCancel: (reason) => {
        console.log("Player creation cancelled:", reason);
      },
    });
  }

  async function handleDeletePlayer(playerId: Player["id"]) {
    await deletePlayer.mutateAsync(playerId);
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
