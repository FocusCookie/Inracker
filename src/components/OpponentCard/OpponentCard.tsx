import { useState, useRef } from "react";
import { Opponent } from "@/types/opponents";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import Collapsible from "../Collapsible/Collapsible";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import { Button } from "../ui/button";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import { useTranslation } from "react-i18next";
import {
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Pencil1Icon,
  TargetIcon,
} from "@radix-ui/react-icons";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import EffectCard from "../EffectCard/EffectCard";
import { DBEffect, Effect } from "@/types/effect";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  opponent: Opponent;
  onRemove: (opponentId: Opponent["id"]) => void;
  onEdit?: (opponent: Opponent) => void;
  onSelectToken?: (opponentId: Opponent["id"]) => void;
};

function OpponentCard({ opponent, onRemove, onEdit, onSelectToken }: Props) {
  const { t } = useTranslation("ComponentOpponentCard");
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);

  function handleRemoveOpponent() {
    onRemove(opponent.id);
  }

  function handleEditOpponent() {
    if (onEdit) {
      onEdit(opponent);
    }
  }

  const positiveEffectsCount = opponent.effects.filter(
    (effect: DBEffect) => effect.type === "positive",
  ).length;

  const negativeEffectsCount = opponent.effects.filter(
    (effect: DBEffect) => effect.type === "negative",
  ).length;

  return (
    <div className="flex flex-col rounded-md border p-4">
      <div className="flex items-start justify-start gap-4">
        <div className="relative">
          <Avatar>
            <AvatarImage
              src={opponent?.image || undefined}
              alt={opponent.name}
            />
            <AvatarFallback>{opponent.icon}</AvatarFallback>
          </Avatar>
          <span className="absolute -top-2 -left-2 rounded-full bg-white shadow">
            {opponent.icon}
          </span>
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-bold">{opponent.name}</h3>
          <div className="flex items-center gap-2">
            <Badge>
              {t("level")} {opponent.level}
            </Badge>
            {opponent.labels.map((label: string) => (
              <Badge key={label}>{label}</Badge>
            ))}
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleEditOpponent}
            >
              <Pencil1Icon />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveOpponent}
          >
            <TrashIcon />
          </Button>

          {onSelectToken && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onSelectToken(opponent.id)}
            >
              <TargetIcon />
            </Button>
          )}

          <Button
            variant="ghost"
            type="button"
            size="icon"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="mt-4 overflow-hidden"
          >
            <div ref={contentRef}>
              <Collapsible title={t("details")}>
                <MarkdownReader markdown={opponent.details} />
              </Collapsible>

              {opponent.effects.length > 0 && (
                <Collapsible
                  title={
                    <div className="items-cent flex justify-between gap-2">
                      <span>{t("effects")}</span>
                      <div className="flex gap-2">
                        {positiveEffectsCount > 0 && (
                          <Badge className="bg-emerald-500 text-white">
                            {positiveEffectsCount}
                          </Badge>
                        )}
                        {negativeEffectsCount > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {negativeEffectsCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  }
                >
                  <div className="flex w-full flex-col gap-4">
                    {opponent.effects.map((effect: Effect) => (
                      <EffectCard
                        key={`opponent-${opponent.id}-effect-${effect.id}`}
                        effect={effect}
                        onRemove={undefined}
                      />
                    ))}
                  </div>
                </Collapsible>
              )}

              {opponent.immunities.length > 0 && (
                <Collapsible
                  title={
                    <div className="items-cent flex justify-between gap-2">
                      <span>{t("immunities")}</span>
                      <Badge>{opponent.immunities.length}</Badge>
                    </div>
                  }
                >
                  <div className="flex w-full flex-col gap-4">
                    {opponent.immunities.map((immunity: DBImmunity) => (
                      <ImmunityCard
                        key={`opponent-${opponent.id}-immunity-${immunity.id}`}
                        immunity={immunity}
                      />
                    ))}
                  </div>
                </Collapsible>
              )}

              {opponent.resistances.length > 0 && (
                <Collapsible
                  title={
                    <div className="items-cent flex justify-between gap-2">
                      <span>{t("resistances")}</span>
                      <Badge>{opponent.resistances.length}</Badge>
                    </div>
                  }
                >
                  <div className="flex w-full flex-col gap-4">
                    {opponent.resistances.map((resistance: DBResistance) => (
                      <ResistanceCard
                        key={`opponent-${opponent.id}-resistances-${resistance.id}`}
                        resistance={resistance}
                      />
                    ))}
                  </div>
                </Collapsible>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OpponentCard;
