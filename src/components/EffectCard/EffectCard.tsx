import { DBEffect } from "@/types/effect";
import React from "react";
import Collapsible from "../Collapsible/Collapsible";
import { cn } from "@/lib/utils";
import MarkdownReader from "../MarkdownReader/MarkdownReader";

type Props = {
  effect: DBEffect;
  /**
   * react element rendered behind the chevron
   */
  actions?: React.ReactNode;
};

function EffectCard({ actions, effect }: Props) {
  return (
    <Collapsible
      title={
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
      }
      actions={actions}
    >
      <MarkdownReader markdown={effect.description} />
    </Collapsible>
  );
}

export default EffectCard;
