import { Party } from "@/types/party";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
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

type Props = {
  party: Party;
  onEdit: (party: Party) => void;
  onOpen: (id: Party["id"]) => void;
  animationDelay?: number;
};

function PartyCard({ party, animationDelay = 0, onEdit, onOpen }: Props) {
  const { t } = useTranslation("ComponentPartyCard");

  function handleEditClick() {
    onEdit(party);
  }

  function handleOpenClick() {
    onOpen(party.id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: "-2rem" }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
      exit={{ opacity: 0, x: "2rem" }}
    >
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row">
          <div className="w-8 text-center">
            <TypographyH3>{party.icon}</TypographyH3>
          </div>

          <div className="grow">
            <TypographyH3>{party.name}</TypographyH3>
          </div>

          <Button onClick={handleEditClick} variant="ghost">
            <Pencil1Icon />
          </Button>
        </CardHeader>

        <CardContent className="flex">
          <div className="h-full w-8"></div>

          <div className="flex grow flex-col gap-2">
            {party.description && (
              <CardDescription>
                <div className="line-clamp-3">{party.description}</div>
              </CardDescription>
            )}

            {party.players.length > 0 && (
              <div className="flex gap-2">
                {party.players.map((player) => (
                  <IconAvatar
                    player={player}
                    key={`avatar-of-player-${player.id}-${player.name}`}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-4">
          <Button onClick={handleOpenClick}>{t("select")}</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default PartyCard;
