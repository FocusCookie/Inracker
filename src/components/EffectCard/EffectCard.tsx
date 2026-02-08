import { cn } from "@/lib/utils";
import { DBEffect, Effect } from "@/types/effect";
import { TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import React from "react";
import Collapsible from "../Collapsible/Collapsible";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import { Button } from "../ui/button";

type Props = {
  effect: Effect;
  /**
   * react element rendered behind the chevron
   */
  actions?: React.ReactNode;
  onRemove?: (effectId: DBEffect["id"]) => void;
  onEdit?: (effect: Effect) => void;
};

function EffectCard({ actions, effect, onRemove, onEdit }: Props) {
  function handleRemoveEffect() {
    if (onRemove) {
      onRemove(effect.id);
    }
  }

  function handleEditEffect() {
    if (onEdit) {
      onEdit(effect);
    }
  }

  return (
    <Collapsible
      disabled={!effect.description}
      title={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                effect.type === "positive" ? "bg-emerald-300" : "bg-red-300",
                "rounded-md px-2 py-1",
              )}
            >
              {effect.icon}
            </span>
            <span className="font-semibold">{effect.name}</span>
          </div>
          {actions || (
            <div className="flex gap-1">
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={handleEditEffect}>
                  <Pencil1Icon />
                </Button>
              )}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveEffect}
                >
                  <TrashIcon />
                </Button>
              )}
            </div>
          )}
        </div>
      }
    >
      <MarkdownReader markdown={effect.description} />
    </Collapsible>
  );
}

export default EffectCard;
