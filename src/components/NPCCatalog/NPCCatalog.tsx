import { NPC } from "@/types/npcs";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import { OverlayMap } from "@/types/overlay";

type OverlayProps = OverlayMap["npc.catalog"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};

type Props = OverlayProps & RuntimeProps;

function NPCCatalog({ open, database, onSelect, onOpenChange }: Props) {
  const { t } = useTranslation("ComponentNPCCatalog");
  const [search, setSearch] = useState("");

  const npcsQuery = useQueryWithToast({
    queryKey: ["npcs"],
    queryFn: () => database.npcs.getAllDetailed(),
  });

  function handleSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  const filteredNPCs = npcsQuery.data
    ? npcsQuery.data.filter((npc: NPC) =>
        npc.name.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  async function handleSelect(npc: NPC) {
    onSelect(npc);
    onOpenChange(false);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="m-4 p-4 pr-0">
        <div className="pr-4">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-2 pb-2">
            <label className="text-sm font-medium" htmlFor="name">
              {t("searchByName")}
            </label>
            <Input placeholder={t("search")} onChange={handleSearchTerm} />
          </div>
        </div>

        <div className="flex max-h-[300px] w-full overflow-hidden">
          <div className="scrollable-y w-full overflow-y-scroll pr-0.5">
            <div className="flex h-full w-full flex-col gap-4 p-1">
              {filteredNPCs.map((npc: NPC) => (
                <div key={`npcs-catalog-${npc.id}}`}>
                  <button
                    onClick={() => {
                      handleSelect(npc);
                    }}
                    className="focus-visible:ring-ring hover:bg-secondary/80 focus-within:bg-secondary/80 flex w-full items-start justify-start gap-2 rounded-md p-1 ring-offset-1 outline-black transition-colors focus-within:outline-1 hover:cursor-pointer focus-visible:ring-1"
                  >
                    <div className="hover:bg-accent relative grid h-16 w-16 place-content-center rounded-md">
                      <Avatar>
                        <AvatarImage
                          src={npc.image || undefined}
                          alt={npc.name}
                        />
                        <AvatarFallback>{npc.icon}</AvatarFallback>
                      </Avatar>
                      <span className="absolute top-0 right-0 min-h-6 min-w-6 rounded-full bg-white p-0.5 shadow">
                        {npc.icon}
                      </span>
                    </div>
                    <div className="flex w-full flex-col justify-between gap-1">
                      <div className="flex justify-between gap-2">
                        <span className="text-xl font-bold">{npc.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">LVL {npc.level}</Badge>
                        {npc.labels &&
                          npc.labels.map((label: string) => (
                            <Badge key={label} variant="outline">
                              {label}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NPCCatalog;
