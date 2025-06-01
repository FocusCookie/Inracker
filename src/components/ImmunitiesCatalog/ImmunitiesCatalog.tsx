import { useState } from "react";
import Catalog from "../Catalog/Catalog";
import { Button } from "../ui/button";
import { DBImmunity } from "@/types/immunitiy";
import ImmunityCard from "../ImmunityCard/ImmunityCard";

type Props = {
  immunities: DBImmunity[];
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onAdd: (id: DBImmunity) => void;
};

function ImmunitiesCatalog({ open, immunities, onAdd, onOpenChange }: Props) {
  const [immunitySearch, setImmunitySearch] = useState<string>("");

  return (
    <Catalog
      open={open}
      onOpenChange={onOpenChange}
      title={"Immuninites"}
      description={"choose an immunity"}
      placeholder={"search for a specific immunity"}
      search={immunitySearch}
      onSearchChange={setImmunitySearch}
    >
      {immunities
        .filter((immunity) =>
          immunity.name
            .toLocaleLowerCase()
            .includes(immunitySearch.toLocaleLowerCase()),
        )
        .map((immunity) => (
          <ImmunityCard
            key={`immunitiy-catalog-${immunity.id}`}
            immunity={immunity}
            actions={<Button onClick={() => onAdd(immunity)}>add</Button>}
          />
        ))}
    </Catalog>
  );
}

export default ImmunitiesCatalog;
