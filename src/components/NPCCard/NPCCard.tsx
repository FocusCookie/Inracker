import {
  HeartFilledIcon,
  TargetIcon,
} from "@radix-ui/react-icons";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion } from "framer-motion";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import Collapsible from "../Collapsible/Collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import { DBWeakness } from "@/types/weakness";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import WeaknessCard from "../WeaknessCard/WeaknessCard";
import IconAvatar from "../IconAvatar/IconAvatar";
import { useTranslation } from "react-i18next";
import { DBEffect, Effect } from "@/types/effect";
import EffectCard from "../EffectCard/EffectCard";
import { EncounterNPC } from "@/types/npcs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type Props = {
  npc: EncounterNPC;
  expanded: boolean;
  onRemove?: (npcId: EncounterNPC["id"]) => void;
  onEdit: (npc: EncounterNPC) => void;
  onSelectToken?: (npcId: EncounterNPC["id"]) => void;
  onRemoveImmunity?: (
    npcId: EncounterNPC["id"],
    immunityId: DBImmunity["id"],
  ) => void;
  onRemoveResistance?: (
    npcId: EncounterNPC["id"],
    resistanceId: DBResistance["id"],
  ) => void;
  onRemoveWeakness?: (
    npcId: EncounterNPC["id"],
    weaknessId: DBWeakness["id"],
  ) => void;
  onRemoveEffect?: (npcId: EncounterNPC["id"], effectId: DBEffect["id"]) => void;
  onOpenImmunitiesCatalog?: () => void;
  onOpenResistancesCatalog?: () => void;
  onOpenWeaknessesCatalog?: () => void;
  onOpenEffectsCatalog?: () => void;
  onHeal?: (npcId: EncounterNPC["id"]) => void;
  onDamage?: (npcId: EncounterNPC["id"]) => void;
};

function NPCCard({
  npc,
  expanded,
  onEdit,
  onRemove,
  onSelectToken,
  onRemoveImmunity,
  onRemoveResistance,
  onRemoveWeakness,
  onRemoveEffect,
  onOpenResistancesCatalog,
  onOpenWeaknessesCatalog,
  onOpenImmunitiesCatalog,
  onOpenEffectsCatalog,
  onHeal,
  onDamage,
}: Props) {
  const { t } = useTranslation("ComponentNPCCard");

  const positiveEffects = npc.effects.filter(
    (effect) => effect.type === "positive",
  );
  const negativeEffects = npc.effects.filter(
    (effect) => effect.type === "negative",
  );

  function handleRemoveNPC() {
    if (onRemove) onRemove(npc.id);
  }

  function handleEditNPC() {
    onEdit(npc);
  }

  function handleRemoveImmunity(immunityId: DBImmunity["id"]) {
    onRemoveImmunity?.(npc.id, immunityId);
  }

  function handleRemoveResistance(resistanceId: DBResistance["id"]) {
    onRemoveResistance?.(npc.id, resistanceId);
  }

  function handleRemoveWeakness(weaknessId: DBWeakness["id"]) {
    onRemoveWeakness?.(npc.id, weaknessId);
  }

  function handleRemoveEffect(effectId: DBEffect["id"]) {
    onRemoveEffect?.(npc.id, effectId);
  }

  const quickActions = () => (
    <DropdownMenuContent className="w-56">
      <DropdownMenuLabel>{npc.name}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {onSelectToken && (
        <>
          <DropdownMenuItem onClick={() => onSelectToken(npc.id)}>
            <div className="flex items-center gap-2">
              <TargetIcon />
              <span>{t("selectToken")}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuGroup>
        {onOpenEffectsCatalog && (
          <DropdownMenuItem onClick={onOpenEffectsCatalog}>
            {t("addEffect")}
          </DropdownMenuItem>
        )}
        {onOpenImmunitiesCatalog && (
          <DropdownMenuItem onClick={onOpenImmunitiesCatalog}>
            {t("addImmunity")}
          </DropdownMenuItem>
        )}
        {onOpenResistancesCatalog && (
          <DropdownMenuItem onClick={onOpenResistancesCatalog}>
            {t("addResistance")}
          </DropdownMenuItem>
        )}
        {onOpenWeaknessesCatalog && (
          <DropdownMenuItem onClick={onOpenWeaknessesCatalog}>
            {t("addWeakness")}
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>

      {(onHeal || onDamage) && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {onHeal && (
              <DropdownMenuItem onClick={() => onHeal(npc.id)}>
                {t("addHealth")}
              </DropdownMenuItem>
            )}
            {onDamage && (
              <DropdownMenuItem onClick={() => onDamage(npc.id)}>
                {t("removeHealth")}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </>
      )}

      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleRemoveNPC}>
        {t("removeFromChapter")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleEditNPC}>
        {t("editNPC")}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  return (
    <>
      {expanded ? (
        <div className="flex h-auto w-full max-w-full min-w-0 gap-2 overflow-hidden">
          <div className="w-16 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus-visible:ring-ring hover:bg-accent relative grid h-16 w-16 shrink-0 flex-col place-content-center gap-1 rounded-md ring-offset-1 hover:cursor-pointer focus-visible:ring-1 focus-visible:outline-hidden">
                  <IconAvatar player={npc as any} />
                </button>
              </DropdownMenuTrigger>
              {quickActions()}
            </DropdownMenu>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { duration: 0.3, delay: 0.15 },
            }}
            className="flex w-full min-w-0 flex-col gap-2 overflow-hidden pt-0.5"
          >
            <div className="w-full min-w-0 grow overflow-hidden">
              <div className="flex w-full max-w-full min-w-0 flex-col overflow-hidden py-1">
                {/* Row 1: Name | Level | Health */}
                <div className="flex w-full min-w-0 flex-nowrap items-center gap-2 overflow-hidden">
                  <div className="max-w-64 min-w-0 flex-1 truncate text-xl font-bold">
                    {npc.name}
                  </div>

                  <div className="flex shrink-0 grow items-center justify-end gap-2">
                    <Badge className="shrink-0 !whitespace-nowrap">
                      {t("level")} {npc.level}
                    </Badge>
                    <Badge className="shrink-0 !whitespace-nowrap">
                      <div className="flex flex-nowrap items-center gap-1">
                        <HeartFilledIcon className="shrink-0" />
                        <span className="shrink-0 !whitespace-nowrap">
                          {npc.health}/{npc.max_health}
                        </span>
                      </div>
                    </Badge>
                  </div>
                </div>

                {/* Row 2: Labels */}
                <div className="mt-1 flex w-full max-w-full min-w-0 items-center gap-4 overflow-hidden">
                  <div className="flex flex-wrap gap-1 overflow-hidden">
                    {npc.labels.map((label) => (
                      <Badge key={label} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Collapsible title={t("details")}>
              <MarkdownReader markdown={npc.details} />
            </Collapsible>

            {npc.immunities.length > 0 && (
              <Collapsible
                title={
                  <div className="items-cent flex justify-between gap-2">
                    <span>{t("immunities")}</span>
                    <span className="rounded-md bg-black px-2 py-1 text-sm text-white">
                      {npc.immunities.length}
                    </span>
                  </div>
                }
              >
                <div className="flex w-full flex-col gap-4">
                  {npc.immunities.map((immunity) => (
                    <ImmunityCard
                      key={`npc-${npc.id}-immunity-${immunity.id}`}
                      immunity={immunity}
                      onRemove={
                        onRemoveImmunity
                          ? () => handleRemoveImmunity(immunity.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </Collapsible>
            )}

            {npc.resistances.length > 0 && (
              <Collapsible
                title={
                  <div className="items-cent flex justify-between gap-2">
                    <span>{t("resistances")}</span>
                    <span className="rounded-md bg-black px-2 py-1 text-sm text-white">
                      {npc.resistances.length}
                    </span>
                  </div>
                }
              >
                <div className="flex w-full flex-col gap-4">
                  {npc.resistances.map((resistance) => (
                    <ResistanceCard
                      key={`npc-${npc.id}-resistances-${resistance.id}`}
                      resistance={resistance}
                      onRemove={
                        onRemoveResistance
                          ? () => handleRemoveResistance(resistance.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </Collapsible>
            )}

            {npc.weaknesses.length > 0 && (
              <Collapsible
                title={
                  <div className="items-cent flex justify-between gap-2">
                    <span>{t("weaknesses")}</span>
                    <span className="rounded-md bg-black px-2 py-1 text-sm text-white">
                      {npc.weaknesses.length}
                    </span>
                  </div>
                }
              >
                <div className="flex w-full flex-col gap-4">
                  {npc.weaknesses.map((weakness) => (
                    <WeaknessCard
                      key={`npc-${npc.id}-weakness-${weakness.id}`}
                      weakness={weakness}
                      onRemove={
                        onRemoveWeakness
                          ? () => handleRemoveWeakness(weakness.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </Collapsible>
            )}

            {positiveEffects.length > 0 && (
              <Collapsible
                title={
                  <div className="items-cent flex justify-between gap-2">
                    <span>{t("positiveEffects")}</span>
                    <span className="rounded-md bg-emerald-500 px-2 py-1 text-sm text-white">
                      {positiveEffects.length}
                    </span>
                  </div>
                }
              >
                <div className="flex w-full flex-col gap-4">
                  {positiveEffects.map((effect: Effect) => (
                    <EffectCard
                      key={`npc-${npc.id}-effect-${effect.id}`}
                      effect={effect}
                      onRemove={
                        onRemoveEffect
                          ? () => handleRemoveEffect(effect.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </Collapsible>
            )}

            {negativeEffects.length > 0 && (
              <Collapsible
                title={
                  <div className="items-cent flex justify-between gap-2">
                    <span>{t("negativeEffects")}</span>
                    <span className="rounded-md bg-red-500 px-2 py-1 text-sm text-white">
                      {negativeEffects.length}
                    </span>
                  </div>
                }
              >
                <div className="flex w-full flex-col gap-4">
                  {negativeEffects.map((effect: Effect) => (
                    <EffectCard
                      key={`npc-${npc.id}-effect-${effect.id}`}
                      effect={effect}
                      onRemove={
                        onRemoveEffect
                          ? () => handleRemoveEffect(effect.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </Collapsible>
            )}
          </motion.div>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus-visible:ring-ring hover:bg-accent relative flex w-16 flex-col items-center gap-1 rounded-md ring-offset-1 hover:cursor-pointer focus-visible:ring-1 focus-visible:outline-hidden">
              <div className="hover:bg-accent relative grid h-16 w-16 place-content-center rounded-md">
                <Avatar>
                  <AvatarImage
                    src={npc.image || undefined}
                    alt={npc.name}
                  />
                  <AvatarFallback>
                    {npc.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <span className="absolute top-0 right-0 rounded-full bg-white p-0.5 text-sm shadow">
                  {npc.icon}
                </span>
              </div>

              <div className="flex w-full items-center justify-center gap-[1px] rounded-md bg-gray-200 px-1 py-0.5 text-sm font-bold text-black">
                <span>{npc.health}</span>
                <span>/</span>
                <span>{npc.max_health}</span>
              </div>

              {npc.effects.length > 0 && (
                <>
                  <div className="flex w-full justify-between gap-2">
                    {npc.effects.filter(
                      (effect: Effect) => effect.type === "positive",
                    ).length > 0 && (
                      <div className="w-full rounded-md bg-emerald-500 px-1 py-0.5 text-sm font-bold text-white">
                        {
                          npc.effects.filter(
                            (effect: Effect) => effect.type === "positive",
                          ).length
                        }
                      </div>
                    )}
                    {npc.effects.filter(
                      (effect: Effect) => effect.type === "negative",
                    ).length > 0 && (
                      <div className="w-full rounded-md bg-red-500 px-1 py-0.5 text-sm font-bold text-white">
                        {
                          npc.effects.filter(
                            (effect: Effect) => effect.type === "negative",
                          ).length
                        }
                      </div>
                    )}
                  </div>
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          {quickActions()}
        </DropdownMenu>
      )}
    </>
  );
}

export default NPCCard;
