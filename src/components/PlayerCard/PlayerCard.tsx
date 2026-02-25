import {
  HeartFilledIcon,
  TargetIcon,
  StarFilledIcon,
  StarIcon,
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
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import IconAvatar from "../IconAvatar/IconAvatar";
import { useTranslation } from "react-i18next";
import { DBEffect, Effect } from "@/types/effect";
import EffectCard from "../EffectCard/EffectCard";
import { Player } from "@/types/player";

type Props = {
  player: Player;
  expanded: boolean;
  onRemove?: (playerId: Player["id"]) => void;
  onEdit: (player: Player) => void;
  onSelectToken?: (playerId: Player["id"]) => void;
  onRemoveImmunity: (
    playerId: Player["id"],
    immunityId: DBImmunity["id"],
  ) => void;
  onRemoveResistance: (
    playerId: Player["id"],
    resistanceId: DBResistance["id"],
  ) => void;
  onRemoveEffect: (playerId: Player["id"], effectId: DBEffect["id"]) => void;
  onEditImmunity: (immunity: DBImmunity) => void;
  onEditResistance: (resistances: DBResistance) => void;
  onEditEffect: (effect: Effect) => void;
  onOpenImmunitiesCatalog: () => void;
  onOpenResistancesCatalog: () => void;
  onOpenEffectsCatalog: () => void;
  onHeal?: (playerId: Player["id"]) => void;
  onDamage?: (playerId: Player["id"]) => void;
  onEditMoney?: (player: Player) => void;
  onToggleHeroPoint?: (player: Player, point: number) => void;
};

function PlayerCard({
  player,
  expanded,
  onEdit,
  onRemove,
  onSelectToken,
  onEditEffect,
  onEditImmunity,
  onEditResistance,
  onRemoveImmunity,
  onRemoveResistance,
  onRemoveEffect,
  onOpenResistancesCatalog,
  onOpenImmunitiesCatalog,
  onOpenEffectsCatalog,
  onHeal,
  onDamage,
  onEditMoney,
  onToggleHeroPoint,
}: Props) {
  const { t } = useTranslation("ComponentPlayerCard");

  const positiveEffects = player.effects.filter(
    (effect) => effect.type === "positive",
  );
  const negativeEffects = player.effects.filter(
    (effect) => effect.type === "negative",
  );

  function handleRemovePlayer() {
    if (onRemove) onRemove(player.id);
  }

  function handleEditPlayer() {
    onEdit(player);
  }

  function handleEditMoney() {
    if (onEditMoney) onEditMoney(player);
  }

  function handleRemoveImmunity(immunityId: DBImmunity["id"]) {
    onRemoveImmunity(player.id, immunityId);
  }

  function handleRemoveResistance(resistanceId: DBResistance["id"]) {
    onRemoveResistance(player.id, resistanceId);
  }

  function handleRemoveEffect(effectId: DBEffect["id"]) {
    onRemoveEffect(player.id, effectId);
  }

  const quickActions = () => (
    <DropdownMenuContent className="w-56">
      <DropdownMenuLabel>{player.name}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {onSelectToken && (
        <>
          <DropdownMenuItem onClick={() => onSelectToken(player.id)}>
            <div className="flex items-center gap-2">
              <TargetIcon />
              <span>{t("selectToken")}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={onOpenEffectsCatalog}>
          {t("addEffect")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenImmunitiesCatalog}>
          {t("addImmunity")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenResistancesCatalog}>
          {t("addResistance")}
        </DropdownMenuItem>
      </DropdownMenuGroup>

      {(onHeal || onDamage) && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {onHeal && (
              <DropdownMenuItem onClick={() => onHeal(player.id)}>
                {t("addHealth")}
              </DropdownMenuItem>
            )}
            {onDamage && (
              <DropdownMenuItem onClick={() => onDamage(player.id)}>
                {t("removeHealth")}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </>
      )}

      {onToggleHeroPoint && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex justify-between py-1 text-xs font-normal opacity-70">
              <span>{t("heroPoints")}</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((point) => (
                  <button
                    key={`hero-point-ctx-${point}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleHeroPoint(player, point);
                    }}
                    className="hover:bg-accent rounded-sm p-0.5 hover:cursor-pointer"
                  >
                    {player.hero_points >= point ? (
                      <StarFilledIcon className="text-yellow-500" />
                    ) : (
                      <StarIcon className="text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
        </>
      )}

      {onEditMoney && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex justify-between py-1 text-xs font-normal opacity-70">
              <span>{t("money")}</span>
              <div className="flex gap-2 font-bold">
                <span className="text-yellow-600 dark:text-yellow-500">
                  G: {player.gold}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  S: {player.silver}
                </span>
                <span className="text-orange-600 dark:text-orange-400">
                  C: {player.copper}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={handleEditMoney}>
              {t("changeMoney")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </>
      )}

      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleRemovePlayer}>
        {t("removeFromGroup")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleEditPlayer}>
        {t("editPlayer")}
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
                  <IconAvatar player={player} />
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
            <div className="min-w-0 grow w-full overflow-hidden">
              <div className="flex min-w-0 flex-col py-1 w-full max-w-full overflow-hidden">
                {/* Row 1: Name | Level | EP | Health */}
                <div className="flex min-w-0 items-center gap-2 flex-nowrap w-full overflow-hidden">
                  <div className="min-w-0 flex-1 truncate text-xl font-bold max-w-[307px]">
                    {player.name}
                  </div>

                  <Badge className="shrink-0 !whitespace-nowrap">
                    {t("level")} {player.level}
                  </Badge>
                  <Badge
                    className="shrink-0 !whitespace-nowrap"
                    variant="secondary"
                  >
                    {player.ep} EP
                  </Badge>
                  <Badge className="shrink-0 !whitespace-nowrap">
                    <div className="flex items-center gap-1 flex-nowrap">
                      <HeartFilledIcon className="shrink-0" />
                      <span className="shrink-0 !whitespace-nowrap">
                        {player.health}/{player.max_health}
                      </span>
                    </div>
                  </Badge>
                </div>

                {/* Row 2: Role | Hero points | Money */}
                <div className="mt-1 flex min-w-0 items-center gap-4 w-full max-w-full overflow-hidden">
                  <div className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    {player.role}
                  </div>

                  {onToggleHeroPoint && (
                    <div className="flex shrink-0 gap-1 flex-nowrap items-center">
                      {[1, 2, 3].map((point) => (
                        <button
                          key={`hero-point-exp-${point}`}
                          onClick={() => onToggleHeroPoint(player, point)}
                          className="hover:bg-accent rounded-full p-1 shrink-0 hover:cursor-pointer"
                          title={t("heroPoints")}
                        >
                          {player.hero_points >= point ? (
                            <StarFilledIcon className="h-4 w-4 text-yellow-500 shrink-0" />
                          ) : (
                            <StarIcon className="h-4 w-4 text-gray-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex min-w-0 shrink-0 gap-2 flex-nowrap">
                    <Badge className="shrink-0 border-none bg-yellow-500 !whitespace-nowrap text-black hover:bg-yellow-600">
                      G: {player.gold}
                    </Badge>
                    <Badge className="shrink-0 border-none bg-gray-400 !whitespace-nowrap text-black hover:bg-gray-500">
                      S: {player.silver}
                    </Badge>
                    <Badge className="shrink-0 border-none bg-orange-400 !whitespace-nowrap text-black hover:bg-orange-500">
                      C: {player.copper}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Collapsible title={t("overview")}>
              <MarkdownReader markdown={player.overview} />
            </Collapsible>

            <Collapsible title={t("details")}>
              <MarkdownReader markdown={player.details} />
            </Collapsible>

            {player.immunities.length > 0 && (
              <Collapsible
                title={
                  <div className="items-cent flex justify-between gap-2">
                    <span>{t("immunities")}</span>
                    <span className="rounded-md bg-black px-2 py-1 text-sm text-white">
                      {player.immunities.length}
                    </span>
                  </div>
                }
              >
                <div className="flex w-full flex-col gap-4">
                  {player.immunities.map((immunity) => (
                    <ImmunityCard
                      key={`player-${player.id}-immunity-${immunity.id}`}
                      immunity={immunity}
                      onRemove={
                        onRemove
                          ? () => handleRemoveImmunity(immunity.id)
                          : undefined
                      }
                      onEdit={onEditImmunity}
                    />
                  ))}
                </div>
              </Collapsible>
            )}

            {player.resistances.length > 0 && (
              <Collapsible
                title={
                  <div className="items-cent flex justify-between gap-2">
                    <span>{t("resistances")}</span>
                    <span className="rounded-md bg-black px-2 py-1 text-sm text-white">
                      {player.resistances.length}
                    </span>
                  </div>
                }
              >
                <div className="flex w-full flex-col gap-4">
                  {player.resistances.map((resistance) => (
                    <ResistanceCard
                      key={`player-${player.id}-resistances-${resistance.id}`}
                      resistance={resistance}
                      onRemove={() => handleRemoveResistance(resistance.id)}
                      onEdit={onEditResistance}
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
                      key={`player-${player.id}-effect-${effect.id}`}
                      effect={effect}
                      onRemove={() => handleRemoveEffect(effect.id)}
                      onEdit={onEditEffect}
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
                      key={`player-${player.id}-effect-${effect.id}`}
                      effect={effect}
                      onRemove={() => handleRemoveEffect(effect.id)}
                      onEdit={onEditEffect}
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
                    src={player.image || undefined}
                    alt={player.name}
                  />
                  <AvatarFallback>{player.icon}</AvatarFallback>
                </Avatar>

                <span className="absolute top-0 right-0 rounded-full bg-white p-0.5 text-sm shadow">
                  {player.icon}
                </span>
              </div>

              <div className="flex w-full items-center justify-center gap-[1px] rounded-md bg-gray-200 px-1 py-0.5 text-sm font-bold text-black">
                <span>{player.health}</span>
                <span>/</span>
                <span>{player.max_health}</span>
              </div>

              {player.effects.length > 0 && (
                <>
                  <div className="flex w-full justify-between gap-2">
                    {player.effects.filter(
                      (effect: Effect) => effect.type === "positive",
                    ).length > 0 && (
                      <div className="w-full rounded-md bg-emerald-500 px-1 py-0.5 text-sm font-bold text-white">
                        {
                          player.effects.filter(
                            (effect: Effect) => effect.type === "positive",
                          ).length
                        }
                      </div>
                    )}
                    {player.effects.filter(
                      (effect: Effect) => effect.type === "negative",
                    ).length > 0 && (
                      <div className="w-full rounded-md bg-red-500 px-1 py-0.5 text-sm font-bold text-white">
                        {
                          player.effects.filter(
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

export default PlayerCard;
