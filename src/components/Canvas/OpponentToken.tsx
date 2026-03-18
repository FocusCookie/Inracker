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
  onOpenEffectsCatalog?: (entityId: number, type: "player" | "opponent") => void;
  onHealOpponent?: (opponentId: number) => void;
  onDamageOpponent?: (opponentId: number) => void;
  onRemoveFromInitiative?: (entityId: number, type: "player" | "opponent") => void;
  onAddToInitiative?: (entityId: number, type: "player" | "opponent", name: string) => void;
  initiativeEntityIds?: { id: number; type: "player" | "opponent" }[];
  database: typeof db;
};

export const OpponentToken: React.FC<OpponentTokenProps> = ({
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

  const handleToggleInitiative = (id: number, type: "player" | "opponent", name: string, active: boolean) => {
    if (active) {
      onRemoveFromInitiative?.(id, type);
    } else {
      onAddToInitiative?.(id, type, name);
    }
  };

  const isInInitiative = initiativeEntityIds?.some(
    (e) => e.id === opponent.id && e.type === "opponent"
  ) ?? false;

  return (
    <TokenNode
      token={token}
      entity={{
        id: opponent.id,
        name: opponent.name,
        icon: opponent.icon,
        image: opponent.image,
        effects: opponent.effects,
      }}
      borderColor="#ef4444"
      isVisible={isVisible}
      isSelected={isSelected}
      isInteractive={isInteractive}
      onDragStart={onDragStart}
      onClick={onClick}
      contextMenuContent={
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
        />
      }
    />
  );
};
