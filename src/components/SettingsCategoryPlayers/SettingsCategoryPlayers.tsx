import React, { useState } from "react";
import { Input } from "../ui/input";
import { Player } from "@/types/player";
import { useTranslation } from "react-i18next";
import SettingPlayerCard from "../SettingPlayerCard/SettingPlayerCard";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryClient } from "@tanstack/react-query";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { TypographyH1 } from "../ui/typographyH1";
import { toast } from "@/hooks/use-toast";

type Props = {
  players: Player[];
  onEditPlayer: (player: Player) => Promise<Player>;
  onDeletePlayer: (playerId: Player["id"]) => Promise<Player>;
};

function SettingsCategoryPlayers({
  players,
  onEditPlayer,
  onDeletePlayer,
}: Props) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("ComponentSettingsCategoryPlayers");
  const openOverlay = useOverlayStore((s) => s.open);
  const [search, setSearch] = useState<string>("");

  const editPlayer = useMutationWithErrorToast({
    mutationFn: onEditPlayer,
    onSuccess: (_player: Player) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });

  const deletePlayer = useMutationWithErrorToast({
    mutationFn: onDeletePlayer,
    onSuccess: (player: Player) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });

      toast({
        title: `Deleted ${player.icon} ${player.name} successfully`,
      });
    },
  });

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
      <TypographyH1>{t("players")}</TypographyH1>

      <Input
        className="mt-4"
        placeholder={t("searchPlaceholder")}
        onChange={handlePlayerSearchTerm}
      />

      <div className="scrollable-y overflow-y-scroll p-0.5">
        <div className="flex h-full max-h-96 flex-col gap-4">
          {players
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
  );
}

export default SettingsCategoryPlayers;

