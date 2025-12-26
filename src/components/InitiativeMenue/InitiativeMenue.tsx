import { TypographyH4 } from "../ui/typographyH4";
import { Button } from "../ui/button";
import { PlusIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { EncounterOpponent } from "@/types/opponents";
import { Player } from "@/types/player";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import InitiativeMenueItem from "../InitiativeMenueItem/InitiativeMenueItem";
import { InitiativeMenuEntity } from "@/types/initiative";

type Props = {
  selected: InitiativeMenuEntity[];
  players: Player[];
  encounterOpponents: EncounterOpponent[];
  isOpen: Boolean;
  setIsOpen: (state: Boolean) => void;
  onAdd: (entity: InitiativeMenuEntity) => void;
  onRemove: (entity: InitiativeMenuEntity) => void;
  onReset: () => void;
  onInitiativeChange: (entity: InitiativeMenuEntity, value: number) => void;
};

function InitiativeMenue({
  selected,
  players,
  encounterOpponents,
  onRemove,
  onAdd,
  onReset,
  onInitiativeChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <div className="flex flex-col gap-16">
      <Button onClick={() => setIsOpen((c) => !c)}> click </Button>

      <aside className="max-w-72">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              className="overflow-hidden rounded-r-lg bg-white"
              initial={{ width: 0 }}
              animate={{
                width: "100%",
              }}
              exit={{
                width: 0,
              }}
            >
              <div className="flex w-72 flex-col gap-4 p-4">
                <header className="flex items-center justify-between gap-2">
                  <TypographyH4>⚔ Initiative </TypographyH4>

                  <Button variant="ghost" onClick={handleClose}>
                    <XIcon />
                  </Button>
                </header>

                <ul className="flex flex-col gap-2">
                  {selected.map((selectedItem) => {
                    return (
                      <InitiativeMenueItem
                        key={`selected-${selectedItem.type}-${selectedItem.properties.id}`}
                        entity={selectedItem}
                        onRemove={onRemove}
                        onInitiativeChange={onInitiativeChange}
                      />
                    );
                  })}
                </ul>

                <hr />

                <div className="flex flex-col gap-4">
                  <ul className="flex flex-col gap-2">
                    {players.map((player) => {
                      return (
                        <AddEntityCard
                          key={`player-${player.id}`}
                          entity={{ type: "player", properties: player }}
                          onAdd={onAdd}
                        />
                      );
                    })}
                  </ul>

                  <ul className="flex flex-col gap-2">
                    {encounterOpponents.map((opponent) => {
                      return (
                        <AddEntityCard
                          key={`opponent-${opponent.id}`}
                          entity={{
                            type: "encounterOpponent",
                            properties: opponent,
                          }}
                          onAdd={onAdd}
                        />
                      );
                    })}
                  </ul>
                </div>

                <Button
                  className="justify-between"
                  variant="secondary"
                  onClick={onReset}
                >
                  <span>Reset Initiative</span>
                  <RotateCcwIcon />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}

type AddEntityProps = {
  entity: InitiativeMenuEntity;
  onAdd: (entity: InitiativeMenuEntity) => void;
};

function AddEntityCard({ entity, onAdd }: AddEntityProps) {
  return (
    <li className="flex items-center justify-between gap-2">
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

      <Button variant="ghost" onClick={() => onAdd(entity)}>
        <PlusIcon />
      </Button>
    </li>
  );
}

export default InitiativeMenue;

