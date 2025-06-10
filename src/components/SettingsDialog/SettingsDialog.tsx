import { usePlayerStore } from "@/stores/usePlayerStore";
import { Player } from "@/types/player";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/shallow";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import SettingPlayerCard from "../SettingPlayerCard/SettingPlayerCard";
import { useEffectStore } from "@/stores/useEffectStore";
import { Effect } from "@/types/effect";
import SettingEffectCard from "../SettingEffectCard/SettingEffectCard";

type Props = {
  open: boolean;
  players: Player[];
  effects: Effect[];
  onOpenChange: (open: boolean) => void;
  onDeletePlayer: (playerId: Player["id"]) => void;
  onDeleteEffect: (effectId: Effect["id"]) => void;
};

function SettingsDialog({
  open,
  players,
  effects,
  onOpenChange,
  onDeletePlayer,
  onDeleteEffect,
}: Props) {
  const { t } = useTranslation("ComponentSettingsDialog");
  const [playerSearch, setPlayerSearch] = useState("");
  const [effectSearch, setEffectSearch] = useState("");

  const { setSelectedPlayer, openEditPlayerDrawer } = usePlayerStore(
    useShallow((state) => ({
      setSelectedPlayer: state.setSelectedPlayer,
      openEditPlayerDrawer: state.openEditPlayerDrawer,
    })),
  );

  const { openEditEffectDrawer, setSelectedEffect } = useEffectStore(
    useShallow((state) => ({
      openEditEffectDrawer: state.openEditEffectDrawer,
      setSelectedEffect: state.setSelectedEffect,
    })),
  );

  useEffect(() => {
    if (!open) {
      setPlayerSearch("");
      setEffectSearch("");
    }
  }, [open]);

  function handlePlayerSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    setPlayerSearch(event.target.value);
  }

  function handleEditPlayer(player: Player) {
    setSelectedPlayer(player);
    openEditPlayerDrawer();
    onOpenChange(false);
  }

  function handleEffectSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setEffectSearch(event.target.value);
  }

  function handleEditEffect(effect: Effect) {
    setSelectedEffect(effect);
    openEditEffectDrawer();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2/3">
        <DialogHeader>
          <DialogTitle>{t("settings")}</DialogTitle>

          <DialogDescription>{t("settingsDescription")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">{t("general")}</TabsTrigger>
            <TabsTrigger value="player-catalog">{t("players")}</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="cleanup">clean up</TabsTrigger>
            <TabsTrigger value="opponents">Opponents</TabsTrigger>
          </TabsList>

          <TabsContent value="general">{t("general")}</TabsContent>

          <TabsContent
            value="player-catalog"
            className="mt-4 flex flex-col gap-4"
          >
            <Input
              className="mt-4"
              placeholder="Search for a specific hero..."
              onChange={handlePlayerSearchTerm}
            />

            <div className="scrollable-y overflow-y-scroll p-0.5">
              <div className="flex h-full max-h-96 flex-col gap-4">
                {players
                  .filter((player) =>
                    player.name
                      .toLowerCase()
                      .includes(playerSearch.toLowerCase()),
                  )

                  .map((player) => (
                    <SettingPlayerCard
                      key={player.id}
                      player={player}
                      onDelete={() => onDeletePlayer(player.id)}
                      onEdit={() => handleEditPlayer(player)}
                    />
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effects">
            <Input
              className="mt-4"
              placeholder="Search for a specific effect..."
              onChange={handleEffectSearch}
            />

            <div className="scrollable-y overflow-y-scroll p-0.5 pt-4">
              <div className="flex h-full max-h-96 flex-col gap-4">
                {effects
                  .filter((effect) =>
                    effect.name
                      .toLowerCase()
                      .includes(effectSearch.toLowerCase()),
                  )

                  .map((effect) => (
                    <SettingEffectCard
                      key={effect.id}
                      effect={effect}
                      onDelete={onDeleteEffect}
                      onEdit={handleEditEffect}
                    />
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cleanup">
            //TODO: implement cleanup function button to clean up encounter
            opponeents which are not attached to any encounter
          </TabsContent>

          <TabsContent value="opponents">
            //TODO: implement edit and deletion of opponenets
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
