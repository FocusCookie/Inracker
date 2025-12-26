import { useState, KeyboardEvent, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Player } from "@/types/player";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { TrashIcon } from "lucide-react";
import "./InitiativeMenueItem.css";

type Props = {
  player: Player;
  onRemove: (playerId: Player["id"]) => void;
  onInitiativeChange?: (playerId: Player["id"], value: number) => void;
};

function InitiativeMenueItem({ player, onRemove, onInitiativeChange }: Props) {
  const [value, setValue] = useState("");

  function handleRemove() {
    onRemove(player.id);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  function handleBlur() {
    if (onInitiativeChange) {
      const num = value === "" ? 0 : Number(value);
      onInitiativeChange(player.id, isNaN(num) ? 0 : num);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  }

  return (
    <div className="initiativeMenueItem flex justify-between gap-2">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={player.image || undefined} alt={player.name} />
          <AvatarFallback>{player.icon}</AvatarFallback>
        </Avatar>

        <strong>
          {player.name} <Badge variant="outline">LVL {player.level}</Badge>
        </strong>
      </div>

      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" onClick={handleRemove}>
          <TrashIcon />
        </Button>

        <Input
          className="w-[5ch] text-center"
          type="number"
          placeholder="0"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}

export default InitiativeMenueItem;

