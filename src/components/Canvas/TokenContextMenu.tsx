import React from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

type TokenContextMenuProps = {
  entityName: string;
  entityId: number;
  entityType: "player" | "opponent" | "npc";
  isInInitiative: boolean;
  isVisible: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onAddEffect?: (entityId: number, type: "player" | "opponent" | "npc") => void;
  onHeal?: (entityId: number) => void;
  onDamage?: (entityId: number) => void;
  onToggleInitiative?: (entityId: number, type: "player" | "opponent" | "npc", name: string, active: boolean) => void;
  mode?: "context" | "dropdown"; // Deprecated but kept for compatibility
};

export const TokenContextMenu: React.FC<TokenContextMenuProps> = ({
  entityName,
  entityId,
  entityType,
  isInInitiative,
  isVisible,
  onSelect,
  onToggleVisibility,
  onEdit,
  onAddEffect,
  onHeal,
  onDamage,
  onToggleInitiative,
}) => {
  const { t } = useTranslation("ComponentCanvas");

  return (
    <DropdownMenuContent 
      className="w-56 z-50"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <DropdownMenuLabel>{entityName}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={onSelect}>
        {t("select")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {onAddEffect && (
          <DropdownMenuItem
            onSelect={() => onAddEffect(entityId, entityType)}
          >
            {t("addEffect")}
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>

      {(onHeal || onDamage) && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {onHeal && (
              <DropdownMenuItem
                onSelect={() => onHeal(entityId)}
              >
                {t("addHealth")}
              </DropdownMenuItem>
            )}
            {onDamage && (
              <DropdownMenuItem
                onSelect={() => onDamage(entityId)}
              >
                {t("removeHealth")}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </>
      )}

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem onSelect={onEdit}>
          {t("edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onToggleVisibility}>
          {isVisible ? t("hide") : t("show")}
        </DropdownMenuItem>
      </DropdownMenuGroup>

      {onToggleInitiative && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => onToggleInitiative(entityId, entityType, entityName, isInInitiative)}
          >
            {isInInitiative
              ? t("removeFromInitiative")
              : t("addToInitiative")}
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  );
};
