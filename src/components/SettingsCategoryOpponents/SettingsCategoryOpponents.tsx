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
import { Opponent } from "@/types/opponents";
import SettingsOpponentCard from "../SettingsOpponentCard/SettingsOpponentCard";
import {
  useCreateOpponent,
  useDeleteOpponent,
  useOpponents,
  useUpdateOpponent,
} from "@/hooks/useOpponents";

type Props = {
  database: typeof defaultDb;
};

function SettingsCategoryOpponents({ database }: Props) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("ComponentSettingsCategoryOpponents");
  const openOverlay = useOverlayStore((s) => s.open);
  const [search, setSearch] = useState<string>("");

  const opponents = useOpponents(database);
  const createOpponent = useCreateOpponent(database);
  const editOpponent = useUpdateOpponent(database);
  const deleteOpponent = useDeleteOpponent(database);

  function handleOpenCreateOpponent() {
    openOverlay("opponent.create", {
      onCreate: (opponent) => createOpponent.mutateAsync(opponent),
      onComplete: (opponent) => {
        toast({
          variant: "default",
          title: `Created ${opponent.icon} ${opponent.name}`,
        });
      },
    });
  }

  function handleOpponentSearchTerm(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setSearch(event.target.value);
  }

  function handleOpenEditOpponent(opponent: Opponent) {
    openOverlay("opponent.edit", {
      opponent: opponent,
      onEdit: (opponent) => editOpponent.mutateAsync(opponent),
      onComplete: (_) => {
        queryClient.invalidateQueries({ queryKey: ["opponents"] });
      },
    });
  }

  async function handleDeleteOpponent(opponentId: Opponent["id"]) {
    await deleteOpponent.mutateAsync(opponentId);
    toast({
      title: `Deleted opponent successfully`,
    });
  }

  return (
    <>
      <div className="flex justify-between gap-4">
        <TypographyH1>{t("opponents")}</TypographyH1>

        {opponents.data && opponents.data.length > 0 && (
          <Button onClick={handleOpenCreateOpponent} className="mt-2">
            {t("createOpponent")}
          </Button>
        )}
      </div>

      {!opponents.data ||
        (opponents.data.length === 0 && (
          <Alert>
            <MoonIcon />
            <AlertTitle>{t("noOpponents")}</AlertTitle>
            <AlertDescription>
              {t("noOpponentsDescription")}
              <div className="flex w-full justify-center">
                <Button onClick={handleOpenCreateOpponent} className="mt-2">
                  {t("createOpponent")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}

      {opponents.data && opponents.data.length > 0 && (
        <>
          <Input
            className="mt-4"
            placeholder={t("searchPlaceholder")}
            onChange={handleOpponentSearchTerm}
          />

          <div className="scrollable-y h-full overflow-y-scroll p-0.5">
            <div className="flex h-full max-h-96 flex-col gap-4">
              {opponents.data
                .filter((opponent) =>
                  opponent.name.toLowerCase().includes(search.toLowerCase()),
                )

                .map((opponent) => (
                  <SettingsOpponentCard
                    key={opponent.id}
                    opponent={opponent}
                    onDelete={() => handleDeleteOpponent(opponent.id)}
                    onEdit={() => handleOpenEditOpponent(opponent)}
                  />
                ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SettingsCategoryOpponents;

