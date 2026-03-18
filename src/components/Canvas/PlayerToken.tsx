import React from "react";
import TokenNode from "./TokenNode";
import { TokenContextMenu } from "./TokenContextMenu";
import { Token } from "@/types/tokens";
import { Player } from "@/types/player";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryClient } from "@tanstack/react-query";
import db from "@/lib/database";

type PlayerTokenProps = {
  token: Token;
  player: Player;
  isVisible: boolean;
  isSelected: boolean;
  isInteractive: boolean;
  onDragStart: (e: React.MouseEvent<SVGImageElement>, token: Token) => void;
  onClick: (token: Token) => void;
  onTokenSelect: (token: Token | null) => void;
  onToggleVisibility: (token: Token) => void;
  onOpenEffectsCatalog?: (entityId: number, type: "player" | "opponent" | "npc") => void;
  onHealPlayer?: (playerId: number) => void;
  onDamagePlayer?: (playerId: number) => void;
  onRemoveFromInitiative?: (entityId: number, type: "player" | "opponent" | "npc") => void;
  onAddToInitiative?: (entityId: number, type: "player" | "opponent" | "npc", name: string) => void;
  initiativeEntityIds?: { id: number; type: "player" | "opponent" | "npc" }[];
  database: typeof db;
};

export const PlayerToken = React.memo<PlayerTokenProps>(({
  token,
  player,
  isVisible,
  isSelected,
  isInteractive,
  onDragStart,
  onClick,
  onTokenSelect,
  onToggleVisibility,
  onOpenEffectsCatalog,
  onHealPlayer,
  onDamagePlayer,
  onRemoveFromInitiative,
  onAddToInitiative,
  initiativeEntityIds,
  database,
}) => {
  const queryClient = useQueryClient();

  const handleEdit = () => {
    useOverlayStore.getState().open("player.edit", {
      player: player,
      onEdit: async (updatedPlayer: Player) => {
        const result = await database.players.update(updatedPlayer);
        return result;
      },
      onComplete: () => {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });
      },
    });
  };

  const handleToggleInitiative = (id: number, type: "player" | "opponent" | "npc", name: string, active: boolean) => {
    if (active) {
      onRemoveFromInitiative?.(id, type);
    } else {
      onAddToInitiative?.(id, type, name);
    }
  };

  const isInInitiative = initiativeEntityIds?.some(
    (e) => e.id === player.id && e.type === "player"
  ) ?? false;

  const entity = React.useMemo(() => ({
    id: player.id,
    name: player.name,
    icon: player.icon,
    image: player.image,
    effects: player.effects,
  }), [player.id, player.name, player.icon, player.image, player.effects]);

  const contextMenuContent = React.useMemo(() => (
    <TokenContextMenu
      entityName={player.name}
      entityId={player.id}
      entityType="player"
      isInInitiative={isInInitiative}
      isVisible={isVisible}
      onSelect={() => onTokenSelect(token)}
      onToggleVisibility={() => onToggleVisibility(token)}
      onEdit={handleEdit}
      onAddEffect={onOpenEffectsCatalog}
      onHeal={onHealPlayer}
      onDamage={onDamagePlayer}
      onToggleInitiative={handleToggleInitiative}
      mode="dropdown"
    />
  ), [
    player.name, 
    player.id, 
    isInInitiative, 
    isVisible, 
    token, 
    onTokenSelect, 
    onToggleVisibility, 
    handleEdit, 
    onOpenEffectsCatalog, 
    onHealPlayer, 
    onDamagePlayer, 
    handleToggleInitiative
  ]);

  return (
    <TokenNode
      token={token}
      entity={entity}
      borderColor="#10b981"
      isVisible={isVisible}
      isSelected={isSelected}
      isInteractive={isInteractive}
      onDragStart={onDragStart}
      onClick={onClick}
      contextMenuContent={contextMenuContent}
    />
  );
});
