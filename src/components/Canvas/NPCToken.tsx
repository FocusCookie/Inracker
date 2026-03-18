import React, { memo, useMemo } from "react";
import TokenNode from "./TokenNode";
import { TokenContextMenu } from "./TokenContextMenu";
import { Token } from "@/types/tokens";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { EncounterNPC } from "@/types/npcs";
import type db from "@/lib/database";

type Props = {
  token: Token;
  npc: EncounterNPC;
  isVisible: boolean;
  isSelected: boolean;
  isInteractive: boolean;
  onDragStart: (token: Token) => void;
  onClick: (token: Token) => void;
  onTokenSelect: (token: Token | null) => void;
  onToggleVisibility: (token: Token) => void;
  onOpenEffectsCatalog?: (
    entityId: number,
    type: "player" | "opponent" | "npc",
  ) => void;
  onHealNPC?: (npcId: number) => void;
  onDamageNPC?: (npcId: number) => void;
  onRemoveFromInitiative?: (
    entityId: number,
    type: "player" | "opponent" | "npc",
  ) => void;
  onAddToInitiative?: (
    entityId: number,
    type: "player" | "opponent" | "npc",
    name: string,
  ) => void;
  initiativeEntityIds?: { id: number; type: "player" | "opponent" | "npc" }[];
  database: typeof db;
};

export const NPCToken: React.FC<Props> = memo(({
  token,
  npc,
  isVisible,
  isSelected,
  isInteractive,
  onDragStart,
  onClick,
  onTokenSelect,
  onToggleVisibility,
  onOpenEffectsCatalog,
  onHealNPC,
  onDamageNPC,
  onRemoveFromInitiative,
  onAddToInitiative,
  initiativeEntityIds,
  database,
}) => {
  const openOverlay = useOverlayStore((s) => s.open);

  const isInInitiative = useMemo(() => {
    return initiativeEntityIds?.some(
      (e) => e.id === npc.id && e.type === "npc",
    ) ?? false;
  }, [initiativeEntityIds, npc.id]);

  const handleEdit = () => {
    openOverlay("encounter-npc.edit", {
      npc,
      onEdit: async (updatedNpc) => {
        return await database.encounterNPCs.update(updatedNpc);
      },
      onDelete: async (npcId) => {
        await database.encounterNPCs.delete(npcId);
      },
      onComplete: () => {
        onTokenSelect(null);
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

  const entity = useMemo(() => ({
    id: npc.id,
    name: npc.name,
    icon: npc.icon,
    image: npc.image,
    effects: npc.effects,
  }), [npc.id, npc.name, npc.icon, npc.image, npc.effects]);

  const contextMenuContent = (
    <TokenContextMenu
      entityName={npc.name}
      entityId={npc.id}
      entityType="npc"
      isInInitiative={isInInitiative}
      isVisible={isVisible}
      onSelect={() => onTokenSelect(token)}
      onToggleVisibility={() => onToggleVisibility(token)}
      onEdit={handleEdit}
      onAddEffect={onOpenEffectsCatalog}
      onHeal={onHealNPC}
      onDamage={onDamageNPC}
      onToggleInitiative={handleToggleInitiative}
      mode="dropdown"
    />
  );

  return (
    <TokenNode
      token={token}
      entity={entity}
      borderColor="#3b82f6"
      isVisible={isVisible}
      isSelected={isSelected}
      isInteractive={isInteractive}
      onDragStart={onDragStart}
      onClick={onClick}
      contextMenuContent={contextMenuContent}
    />
  );
});
