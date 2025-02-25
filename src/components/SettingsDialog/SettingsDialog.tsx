import { Player } from "@/types/player";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useShallow } from "zustand/shallow";
import IconAvatar from "../IconAvatar/IconAvatar";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  onDeletePlayer: (playerId: Player["id"]) => void;
};

function SettingsDialog({
  open,
  players,
  onOpenChange,
  onDeletePlayer,
}: Props) {
  const { t } = useTranslation("ComponentSettingsDialog");
  const [search, setSearch] = useState("");

  const { setSelectedPlayer, openEditPlayerDrawer } = usePlayerStore(
    useShallow((state) => ({
      setSelectedPlayer: state.setSelectedPlayer,
      openEditPlayerDrawer: state.openEditPlayerDrawer,
    })),
  );

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  function handleSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  function handleEditPlayer(player: Player) {
    setSelectedPlayer(player);
    openEditPlayerDrawer();
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">{t("general")}</TabsTrigger>
            <TabsTrigger value="player-catalog">{t("players")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general">{t("general")}</TabsContent>

          <TabsContent
            value="player-catalog"
            className="mt-4 flex flex-col gap-4"
          >
            <Input
              className="mt-4"
              placeholder="Search for a specific hero..."
              onChange={handleSearchTerm}
            />

            <ScrollArea className="h-full">
              <div className="flex h-full flex-col gap-4">
                {players
                  .filter((player) =>
                    player.name.toLowerCase().includes(search.toLowerCase()),
                  )

                  .map((player) => (
                    <button
                      key={player.id}
                      className="focus-visible:ring-ring hover:bg-secondary/80 focus-within:bg-secondary/80 group/player flex w-full items-center justify-start gap-2 rounded-md p-4 ring-offset-1 outline-black transition-colors focus-within:outline-1 hover:cursor-pointer focus-visible:ring-1"
                    >
                      <IconAvatar player={player} />

                      <div className="flex grow flex-col items-start justify-start">
                        <span className="text-xl font-bold">{player.name}</span>

                        <div className="flex gap-2">
                          <Badge variant="outline">{player.role}</Badge>
                          <Badge variant="outline">
                            {t("level")} {player.level}
                          </Badge>
                        </div>
                      </div>

                      <div className="invisible flex gap-4 group-focus-within/player:visible group-hover/player:visible">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost">{t("delete")}</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>
                                {t("delete")} {player.name}
                              </DialogTitle>
                              <DialogDescription>
                                {t("deletionWarning")}
                              </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                              <Button
                                variant="destructive"
                                type="button"
                                onClick={() => onDeletePlayer(player.id)}
                              >
                                {t("delete")}
                                {player.name}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          onClick={() => handleEditPlayer(player)}
                          variant="outline"
                        >
                          {t("edit")}
                        </Button>
                      </div>
                    </button>
                  ))}
              </div>
            </ScrollArea>
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
