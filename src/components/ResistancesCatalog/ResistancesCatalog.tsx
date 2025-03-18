import { DBResistance } from "@/types/resistances";
import { useState } from "react";
import Catalog from "../Catalog/Catalog";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import { Button } from "../ui/button";

type Props = {
  resistances: DBResistance[];
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onAdd: (id: DBResistance) => void;
};

function ResistancesCatalog({ open, resistances, onAdd, onOpenChange }: Props) {
  const [search, setSearch] = useState<string>("");

  //TODO: if resistances are empty show create button

  return (
    <Catalog
      open={open}
      onOpenChange={onOpenChange}
      title={"Resistances"}
      description={"choose an resistance"}
      placeholder={"search for a specific resistance"}
      search={search}
      onSearchChange={setSearch}
    >
      {resistances
        .filter((resistance) =>
          resistance.name
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()),
        )
        .map((resistance) => (
          <ResistanceCard
            key={`resistances-catalog-${resistance.id}`}
            resistance={resistance}
            actions={<Button onClick={() => onAdd(resistance)}>add</Button>}
          />
        ))}
    </Catalog>
  );
}

export default ResistancesCatalog;
