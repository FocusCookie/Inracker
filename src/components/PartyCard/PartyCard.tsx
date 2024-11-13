import { cn } from "@/lib/utils";
import { Party } from "@/types/party";
import { Player } from "@/types/player";
import { useTranslation } from "react-i18next";
import IconAvatar from "../IconAvatar/IconAvatar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../ui/card";
import { TypographyH3 } from "../ui/typographyH3";
import { motion } from "framer-motion";

type Props = {
  party: Party;
  onEdit: (party: Party) => void;
  onOpen: () => void;
  onPlayerClick: (id: Player["id"]) => void;
  animationDelay?: number;
};

function PartyCard({
  party,
  animationDelay = 0,
  onEdit,
  onOpen,
  onPlayerClick,
  ...props
}: Props) {
  const { t } = useTranslation("ComponentPartyCard");

  function handleEditClick() {
    if (onEdit) onEdit(party);
  }

  function handleOpenClick() {
    if (onOpen) onOpen();
  }

  function handlePlayerClick(playerId: Player["id"]) {
    if (onPlayerClick) onPlayerClick(playerId);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: "-2rem" }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
      exit={{ opacity: 0, x: "2rem" }}
    >
      <Card>
        <CardHeader>
          <div
            className={cn(
              "flex flex-nowrap gap-2 text-2xl",
              // @ts-ignore
              props.className,
            )}
          >
            <div className="flex-shrink-0">
              <TypographyH3>{party.icon}</TypographyH3>
            </div>
            <TypographyH3>{party.name}</TypographyH3>
          </div>
          {party.description && (
            <CardDescription>
              <div className="line-clamp-3">{party.description}</div>
            </CardDescription>
          )}
        </CardHeader>
        {party.players.length > 0 && (
          <CardContent>
            <div className="flex gap-2">
              {party.players.map((player) => (
                <IconAvatar
                  key={`party-${party.id}-player-${player.id}`}
                  name={player.name}
                  icon={player.icon}
                  onClick={() => handlePlayerClick(player.id)}
                />
              ))}
            </div>
          </CardContent>
        )}
        <CardFooter className="flex justify-end gap-4">
          <Button onClick={handleEditClick} variant="ghost">
            {t("edit")}
          </Button>
          <Button onClick={handleOpenClick}> {t("select")}</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default PartyCard;
