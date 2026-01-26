import { useState, KeyboardEvent, ChangeEvent, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { TrashIcon } from "lucide-react";
import "./InitiativeMenueItem.css";
import { InitiativeMenuEntity } from "@/types/initiative";

type Props = {
  entity: InitiativeMenuEntity;
  onRemove: (entity: InitiativeMenuEntity) => void;
  onInitiativeChange?: (entity: InitiativeMenuEntity, value: number) => void;
};

function InitiativeMenueItem({ entity, onRemove, onInitiativeChange }: Props) {
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
    <div className="initiativeMenueItem flex justify-between gap-2">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={entity.properties.image || undefined}
            alt={entity.properties.name}
          />
          <AvatarFallback>{entity.properties.icon}</AvatarFallback>
        </Avatar>

        <strong>{entity.properties.name}</strong>
      </div>

      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" onClick={handleRemove}>
          <TrashIcon />
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

