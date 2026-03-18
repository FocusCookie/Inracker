import React from "react";
import TokenNode from "./TokenNode";
import { TokenContextMenu } from "./TokenContextMenu";
import { Token } from "@/types/tokens";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryClient } from "@tanstack/react-query";
import db from "@/lib/database";
import { Opponent } from "@/types/opponents";

type OpponentTokenProps = {
  token: Token;
  opponent: Opponent;
  isVisible: boolean;
  isSelected: boolean;
  isInteractive: boolean;
  onDragStart: (e: React.MouseEvent<SVGImageElement>, token: Token) => void;
  onClick: (token: Token) => void;
  onTokenSelect: (token: Token | null) => void;
  onToggleVisibility: (token: Token) => void;
  onOpenEffectsCatalog?: (entityId: number, type: "player" | "opponent" | "npc") => void;
  onHealOpponent?: (opponentId: number) => void;
  onDamageOpponent?: (opponentId: number) => void;
  onRemoveFromInitiative?: (entityId: number, type: "player" | "opponent" | "npc") => void;
  onAddToInitiative?: (entityId: number, type: "player" | "opponent" | "npc", name: string) => void;
  initiativeEntityIds?: { id: number; type: "player" | "opponent" | "npc" }[];
  database: typeof db;
};

export const OpponentToken = React.memo<OpponentTokenProps>(({
  token,
  opponent,
  isVisible,
  isSelected,
  isInteractive,
  onDragStart,
  onClick,
  onTokenSelect,
  onToggleVisibility,
  onOpenEffectsCatalog,
  onHealOpponent,
  onDamageOpponent,
  onRemoveFromInitiative,
  onAddToInitiative,
  initiativeEntityIds,
  database,
}) => {
  const queryClient = useQueryClient();

  const handleEdit = () => {
    useOverlayStore.getState().open("encounter-opponent.edit", {
      opponent: opponent,
      onEdit: async (opp: Opponent) => {
        const result = await database.encounterOpponents.update(opp);
        return result;
      },
      onDelete: async (id: number) => {
        await database.encounterOpponents.delete(id);
      },
      onComplete: () => {
        queryClient.invalidateQueries({
          queryKey: ["encounter-opponents"],
        });
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
    (e) => e.id === opponent.id && e.type === "opponent"
  ) ?? false;

  const entity = React.useMemo(() => ({
    id: opponent.id,
    name: opponent.name,
    icon: opponent.icon,
    image: opponent.image,
    effects: opponent.effects,
  }), [opponent.id, opponent.name, opponent.icon, opponent.image, opponent.effects]);

  const contextMenuContent = React.useMemo(() => (
    <TokenContextMenu
      entityName={opponent.name}
      entityId={opponent.id}
      entityType="opponent"
      isInInitiative={isInInitiative}
      isVisible={isVisible}
      onSelect={() => onTokenSelect(token)}
      onToggleVisibility={() => onToggleVisibility(token)}
      onEdit={handleEdit}
      onAddEffect={onOpenEffectsCatalog}
      onHeal={onHealOpponent}
      onDamage={onDamageOpponent}
      onToggleInitiative={handleToggleInitiative}
      mode="dropdown"
    />
  ), [
    opponent.name, 
    opponent.id, 
    isInInitiative, 
    isVisible, 
    token, 
    onTokenSelect, 
    onToggleVisibility, 
    handleEdit, 
    onOpenEffectsCatalog, 
    onHealOpponent, 
    onDamageOpponent, 
    handleToggleInitiative
  ]);

  return (
    <TokenNode
      token={token}
      entity={entity}
      borderColor="#ef4444"
      isVisible={isVisible}
      isSelected={isSelected}
      isInteractive={isInteractive}
      onDragStart={onDragStart}
      onClick={onClick}
      contextMenuContent={contextMenuContent}
    />
  );
});
