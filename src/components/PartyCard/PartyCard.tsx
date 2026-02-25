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
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

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

  // Calculate total money
  const totalCopper = party.players.reduce((acc, player) => {
    return acc + (player.copper || 0) + (player.silver || 0) * 10 + (player.gold || 0) * 100;
  }, 0);

  const displayGold = Math.floor(totalCopper / 100);
  const displaySilver = Math.floor((totalCopper % 100) / 10);
  const displayCopper = totalCopper % 10;

  return (
    <motion.div
      initial={{ opacity: 0, x: "-2rem" }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
      exit={{ opacity: 0, x: "2rem" }}
    >
      <Card className="flex flex-col gap-4">
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

          <div className="flex grow flex-col gap-4 min-w-0">
            {party.description && (
              <CardDescription>
                <div className="line-clamp-3">{party.description}</div>
              </CardDescription>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              {party.players.length > 0 && (
                <div className="flex gap-6 shrink-0">
                  {party.players.map((player) => (
                    <IconAvatar
                      player={player}
                      key={`avatar-of-player-${player.id}-${player.name}`}
                    />
                  ))}
                </div>
              )}

              {totalCopper > 0 && (
                <div className="ml-auto flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-yellow-500 text-black hover:bg-yellow-600 shrink-0 border-none whitespace-nowrap">
                          G: {displayGold}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{t("gold")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-gray-400 text-black hover:bg-gray-500 shrink-0 border-none whitespace-nowrap">
                          S: {displaySilver}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{t("silver")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-orange-400 text-black hover:bg-orange-500 shrink-0 border-none whitespace-nowrap">
                          C: {displayCopper}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{t("copper")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
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
