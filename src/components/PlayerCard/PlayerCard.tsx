import { Player } from "@/types/player";
import { HeartFilledIcon } from "@radix-ui/react-icons";
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
import { useImmunityStore } from "@/stores/useImmunityStore";
import { useEffectStore } from "@/stores/useEffectStore";
import { useResistancesStore } from "@/stores/useResistanceStore";

type Props = {
  player: Player;
  expanded: boolean;
  onRemove: (playerId: Player["id"]) => void;
  onEdit: (player: Player) => void;
  onRemoveImmunity: (
    playerId: Player["id"],
    immunityId: DBImmunity["id"],
  ) => void;
  onRemoveResistance: (
    playerId: Player["id"],
    resistanceId: DBResistance["id"],
  ) => void;
  onRemoveEffect: (playerId: Player["id"], effectId: DBEffect["id"]) => void;
  onOpenImmunitiesCatalog: () => void;
  onOpenResistancesCatalog: () => void;
  onOpenEffectsCatalog: () => void;
};

function PlayerCard({
  player,
  expanded,
  onEdit,
  onRemove,
  onRemoveImmunity,
  onRemoveResistance,
  onRemoveEffect,
  onOpenResistancesCatalog,
  onOpenImmunitiesCatalog,
  onOpenEffectsCatalog,
}: Props) {
  const { t } = useTranslation("ComponentPlayerCard");
  const { setSelectedImmunity, openEditImmunityDrawer } = useImmunityStore();
  const { setSelectedEffect, openEditEffectDrawer } = useEffectStore();
  const { setSelectedResistance, openEditResistanceDrawer } =
    useResistancesStore();

  const positiveEffects = player.effects.filter(
    (effect) => effect.type === "positive",
  );
  const negativeEffects = player.effects.filter(
    (effect) => effect.type === "negative",
  );

  function handleRemovePlayer() {
    onRemove(player.id);
  }

  function handleEditPlayer() {
    onEdit(player);
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

  function handleEditImmunity(immunity: DBImmunity) {
    setSelectedImmunity(immunity);
    openEditImmunityDrawer();
  }

  function handleEditEffect(effect: Effect) {
    setSelectedEffect(effect);
    openEditEffectDrawer();
  }

  function handleEditResistance(resistance: DBResistance) {
    setSelectedResistance(resistance);
    openEditResistanceDrawer();
  }

  const quickActions = () => (
    <DropdownMenuContent className="w-56">
      <DropdownMenuLabel>{player.name}</DropdownMenuLabel>
      <DropdownMenuSeparator />
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
        <div className="flex h-full w-[576px] gap-2">
          <div className="w-16">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus-visible:ring-ring hover:bg-accent relative grid h-16 w-16 flex-col place-content-center gap-1 rounded-md ring-offset-1 hover:cursor-pointer focus-visible:ring-1 focus-visible:outline-hidden">
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
            className="flex w-full flex-col gap-2 pt-0.5"
          >
            <div className="grow">
              <div className="flex flex-col py-1">
                <div className="flex items-center gap-2">
                  <span className="grow text-xl font-bold">{player.name}</span>

                  <Badge>
                    {t("level")} {player.level}
                  </Badge>
                  <Badge>
                    <div className="flex items-center gap-1">
                      <HeartFilledIcon />
                      <span>
                        {player.health}/{player.max_health}
                      </span>
                    </div>
                  </Badge>
                </div>
                <span>{player.role}</span>
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
                    <span>{t("immunitites")}</span>
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
                      onRemove={() => handleRemoveImmunity(immunity.id)}
                      onEdit={handleEditImmunity}
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
                      onEdit={handleEditResistance}
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
                  {positiveEffects.map((effect) => (
                    <EffectCard
                      key={`player-${player.id}-effect-${effect.id}`}
                      effect={effect}
                      onRemove={() => handleRemoveEffect(effect.id)}
                      onEdit={handleEditEffect}
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
                  {negativeEffects.map((effect) => (
                    <EffectCard
                      key={`player-${player.id}-effect-${effect.id}`}
                      effect={effect}
                      onRemove={() => handleRemoveEffect(effect.id)}
                      onEdit={handleEditEffect}
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

                <span className="absolute top-0 right-0 rounded-full bg-white p-0.5 shadow">
                  {player.icon}
                </span>
              </div>

              <div className="flex items-center gap-[1px] rounded-md bg-gray-200 px-1 py-0.5 text-sm font-bold text-black">
                <span>{player.health}</span>
                <span>/</span>
                <span>{player.max_health}</span>
              </div>

              <div className="flex w-full justify-between gap-2">
                {player.effects.filter((effect) => effect.type === "positive")
                  .length > 0 && (
                  <div className="w-full rounded-md bg-emerald-500 px-1 py-0.5 text-sm font-bold text-white">
                    {
                      player.effects.filter(
                        (effect) => effect.type === "positive",
                      ).length
                    }
                  </div>
                )}
                {player.effects.filter((effect) => effect.type === "negative")
                  .length > 0 && (
                  <div className="w-full rounded-md bg-red-500 px-1 py-0.5 text-sm font-bold text-white">
                    {
                      player.effects.filter(
                        (effect) => effect.type === "negative",
                      ).length
                    }
                  </div>
                )}
              </div>
            </button>
          </DropdownMenuTrigger>

          {quickActions()}
        </DropdownMenu>
      )}
    </>
  );
}

export default PlayerCard;
