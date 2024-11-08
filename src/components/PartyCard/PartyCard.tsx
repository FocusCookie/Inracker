import { Party } from "@/types/party";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../ui/card";
import { Button } from "../ui/button";
import { TypographyH3 } from "../ui/typographyH3";
import IconAvatar from "../IconAvatar/IconAvatar";
import { Player } from "@/types/player";
import { cn } from "@/lib/utils";

type Props = {
  party: Party;
  onEdit: () => void;
  onOpen: () => void;
  onPlayerClick: (id: Player["id"]) => void;
};

function PartyCard({ party, onEdit, onOpen, onPlayerClick, ...props }: Props) {
  function handleEditClick() {
    if (onEdit) onEdit();
  }

  function handleOpenClick() {
    if (onOpen) onOpen();
  }

  function handlePlayerClick(playerId: Player["id"]) {
    if (onPlayerClick) onPlayerClick(playerId);
  }

  return (
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
          <CardDescription>{party.description}</CardDescription>
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
          Edit
        </Button>
        <Button onClick={handleOpenClick}>Open</Button>
      </CardFooter>
    </Card>
  );
}

export default PartyCard;
