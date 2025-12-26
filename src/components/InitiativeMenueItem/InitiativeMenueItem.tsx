import { useState, KeyboardEvent, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { TrashIcon } from "lucide-react";
import "./InitiativeMenueItem.css";
import { InitiativeMenuEntity } from "@/types/initiative";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";


type Props = {
  entity: InitiativeMenuEntity;
  onRemove: (entity: InitiativeMenuEntity) => void;
  onInitiativeChange?: (entity: InitiativeMenuEntity, value: number) => void;
};

function InitiativeMenueItem({ entity, onRemove, onInitiativeChange }: Props) {
  const { t } = useTranslation("ComponentInitiativeMenuItem");
  const [inputValue, setInputValue] = useState("");
  const [committedValue, setCommittedValue] = useState(0);

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleRemove}>
                <TrashIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("remove", { name: entity.properties.name })}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("initiative", { name: entity.properties.name })}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default InitiativeMenueItem;