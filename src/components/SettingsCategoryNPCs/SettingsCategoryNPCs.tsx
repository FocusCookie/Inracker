import React, { useState } from "react";
import defaultDb from "@/lib/database";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryClient } from "@tanstack/react-query";
import { TypographyH1 } from "../ui/typographyH1";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "lucide-react";
import { Button } from "../ui/button";
import { NPC } from "@/types/npcs";
import SettingsNPCCard from "../SettingsNPCCard/SettingsNPCCard";
import { useDeleteNPC, useNPCs, useUpdateNPC } from "@/hooks/useNPCs";

type Props = {
  database: typeof defaultDb;
};

function SettingsCategoryNPCs({ database }: Props) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("ComponentSettingsCategoryNPCs");
  const openOverlay = useOverlayStore((s) => s.open);
  const [search, setSearch] = useState<string>("");

  const npcs = useNPCs(database);
  const editNPC = useUpdateNPC(database);
  const deleteNPC = useDeleteNPC(database);

  function handleOpenCreateNPC() {
    openOverlay("npc.create", {
      onCreate: (npc) => database.npcs.create(npc),
      onComplete: (npc) => {
        queryClient.invalidateQueries({ queryKey: ["npcs"] });
        toast({
          variant: "default",
          title: `Created ${npc.icon} ${npc.name}`,
        });
      },
    });
  }

  function handleNPCSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  function handleOpenEditNPC(npc: NPC) {
    openOverlay("npc.edit", {
      npc: npc,
      onEdit: (updatedNpc) => editNPC.mutateAsync(updatedNpc),
      onComplete: (_) => {
        queryClient.invalidateQueries({ queryKey: ["npcs"] });
      },
    });
  }

  async function handleDeleteNPC(npcId: NPC["id"]) {
    await deleteNPC.mutateAsync(npcId);
    toast({
      title: `Deleted NPC successfully`,
    });
  }

  return (
    <>
      <div className="flex justify-between gap-4">
        <TypographyH1>{t("npcs")}</TypographyH1>

        {npcs.data && npcs.data.length > 0 && (
          <Button onClick={handleOpenCreateNPC} className="mt-2">
            {t("createNPC")}
          </Button>
        )}
      </div>

      {!npcs.data ||
        (npcs.data.length === 0 && (
          <Alert>
            <MoonIcon />
            <AlertTitle>{t("noNPCs")}</AlertTitle>
            <AlertDescription>
              {t("noNPCsDescription")}
              <div className="flex w-full justify-center">
                <Button onClick={handleOpenCreateNPC} className="mt-2">
                  {t("createNPC")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}

      {npcs.data && npcs.data.length > 0 && (
        <>
          <Input
            className="mt-4"
            placeholder={t("searchPlaceholder")}
            onChange={handleNPCSearchTerm}
          />

          <div className="scrollable-y h-full overflow-y-scroll p-0.5">
            <div className="mt-4 flex h-full max-h-96 flex-col gap-4">
              {npcs.data
                .filter((npc) =>
                  npc.name.toLowerCase().includes(search.toLowerCase()),
                )

                .map((npc) => (
                  <SettingsNPCCard
                    key={npc.id}
                    npc={npc}
                    onDelete={() => handleDeleteNPC(npc.id)}
                    onEdit={() => handleOpenEditNPC(npc)}
                  />
                ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SettingsCategoryNPCs;
