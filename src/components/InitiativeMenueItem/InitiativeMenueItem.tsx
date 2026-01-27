import { useState, KeyboardEvent, ChangeEvent, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { TrashIcon } from "lucide-react";
import { TargetIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import "./InitiativeMenueItem.css";
import { InitiativeMenuEntity } from "@/types/initiative";

type Props = {
  entity: InitiativeMenuEntity;
  onRemove: (entity: InitiativeMenuEntity) => void;
  onInitiativeChange?: (entity: InitiativeMenuEntity, value: number) => void;
  onSelectToken?: (entity: InitiativeMenuEntity) => void;
};

function InitiativeMenueItem({
  entity,
  onRemove,
  onInitiativeChange,
  onSelectToken,
}: Props) {
  const [inputValue, setInputValue] = useState(entity.initiative.toString());
  const [committedValue, setCommittedValue] = useState(entity.initiative);

  useEffect(() => {
    setInputValue(entity.initiative.toString());
    setCommittedValue(entity.initiative);
  }, [entity.initiative]);

  function handleRemove() {
    onRemove(entity);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleBlur() {
    if (onInitiativeChange) {
      const num = inputValue === "" ? 0 : Number(inputValue);
      if (num !== committedValue) {
        onInitiativeChange(entity, isNaN(num) ? 0 : num);
        setCommittedValue(isNaN(num) ? 0 : num);
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // This will trigger handleBlur
    }
  }

  return (
    <div className="initiativeMenueItem flex items-center justify-between gap-2 overflow-hidden">
      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage
            src={entity.properties.image || undefined}
            alt={entity.properties.name}
          />
          <AvatarFallback>{entity.properties.icon}</AvatarFallback>
        </Avatar>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <strong className="truncate text-sm">
                {entity.properties.name}
              </strong>
            </TooltipTrigger>
            <TooltipContent>
              <p>{entity.properties.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onSelectToken && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onSelectToken(entity)}
          >
            <TargetIcon />
          </Button>
        )}
        <Button size="icon" variant="ghost" onClick={handleRemove}>
          <TrashIcon className="h-4 w-4" />
        </Button>
        <Input
          className="w-[5ch] text-center"
          type="number"
          placeholder="0"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}

export default InitiativeMenueItem;

