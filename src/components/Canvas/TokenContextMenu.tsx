import React from "react";
import { useTranslation } from "react-i18next";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuGroup,
} from "@/components/ui/context-menu";

type TokenContextMenuProps = {
  entityName: string;
  entityId: number;
  entityType: "player" | "opponent";
  isInInitiative: boolean;
  isVisible: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onAddEffect?: (entityId: number, type: "player" | "opponent") => void;
  onHeal?: (entityId: number) => void;
  onDamage?: (entityId: number) => void;
  onToggleInitiative?: (entityId: number, type: "player" | "opponent", name: string, active: boolean) => void;
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
    <ContextMenuContent className="w-56">
      <ContextMenuLabel>{entityName}</ContextMenuLabel>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={onSelect}>
        {t("select")}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        {onAddEffect && (
          <ContextMenuItem
            onClick={() => onAddEffect(entityId, entityType)}
          >
            {t("addEffect")}
          </ContextMenuItem>
        )}
      </ContextMenuGroup>

      {(onHeal || onDamage) && (
        <>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            {onHeal && (
              <ContextMenuItem
                onClick={() => onHeal(entityId)}
              >
                {t("addHealth")}
              </ContextMenuItem>
            )}
            {onDamage && (
              <ContextMenuItem
                onClick={() => onDamage(entityId)}
              >
                {t("removeHealth")}
              </ContextMenuItem>
            )}
          </ContextMenuGroup>
        </>
      )}

      <ContextMenuSeparator />

      <ContextMenuGroup>
        <ContextMenuItem onClick={onEdit}>
          {t("edit")}
        </ContextMenuItem>
        <ContextMenuItem onClick={onToggleVisibility}>
          {isVisible ? t("hide") : t("show")}
        </ContextMenuItem>
      </ContextMenuGroup>

      {onToggleInitiative && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => onToggleInitiative(entityId, entityType, entityName, isInInitiative)}
          >
            {isInInitiative
              ? t("removeFromInitiative")
              : t("addToInitiative")}
          </ContextMenuItem>
        </>
      )}
    </ContextMenuContent>
  );
};
