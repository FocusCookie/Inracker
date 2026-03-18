import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EyeNoneIcon } from "@radix-ui/react-icons";
import { CircleX, Sword, UsersRound } from "lucide-react";
import { Player } from "@/types/player";
import { Token } from "@/types/tokens";
import { Opponent } from "@/types/opponents";

type TokenPanelsProps = {
  players: Player[];
  opponents: Opponent[];
  tokens: Token[];
  tokenVisibility: Record<string, boolean>;
  isPlayersPanelOpen: boolean;
  isOpponentsPanelOpen: boolean;
  onTogglePlayersPanel: () => void;
  onToggleOpponentsPanel: () => void;
  onToggleToken: (token: Token) => void;
};

const TokenPanels: React.FC<TokenPanelsProps> = ({
  players,
  opponents,
  tokens,
  tokenVisibility,
  isPlayersPanelOpen,
  isOpponentsPanelOpen,
  onTogglePlayersPanel,
  onToggleOpponentsPanel,
  onToggleToken,
}) => {
  const { t } = useTranslation("ComponentCanvas");

  const playerTokens = React.useMemo(() => {
    const map = new Map<number, Token>();
    tokens.forEach((t) => {
      if (t.type === "player") map.set(t.entity, t);
    });
    return map;
  }, [tokens]);

  const opponentTokens = React.useMemo(() => {
    const map = new Map<number, Token>();
    tokens.forEach((t) => {
      if (t.type === "opponent") map.set(t.entity, t);
    });
    return map;
  }, [tokens]);

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-4">
      {players.length > 0 && (
        <div className="flex flex-col gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onTogglePlayersPanel}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-xs"
                >
                  {isPlayersPanelOpen ? (
                    <CircleX className="h-4 w-4" />
                  ) : (
                    <UsersRound className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{t("playerTokens")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isPlayersPanelOpen && (
            <div className="flex flex-col gap-2">
              {players.map((player) => {
                const token = playerTokens.get(player.id);
                if (!token) return null;
                return (
                  <TooltipProvider
                    key={`player-${player.id}-token-state-provider`}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onToggleToken(token)}
                          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                        >
                          <div className="grid grid-cols-1 grid-rows-1 items-center justify-items-center">
                            {player.image && player.image !== "" ? (
                              <img
                                className="col-start-1 col-end-1 row-start-1 row-end-2"
                                src={player.image}
                                alt={`Picture of Player ${player.name}`}
                              />
                            ) : (
                              <span className="col-start-1 col-end-1 row-start-1 row-end-2">
                                {player.icon}
                              </span>
                            )}

                            {!(tokenVisibility[token.id.toString()] ?? true) && (
                              <div className="col-start-1 col-end-1 row-start-1 row-end-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <EyeNoneIcon className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{player.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          )}
        </div>
      )}

      {opponents.length > 0 && (
        <div className="flex flex-col gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleOpponentsPanel}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                >
                  {isOpponentsPanelOpen ? (
                    <CircleX className="h-4 w-4" />
                  ) : (
                    <Sword className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{t("opponentTokens")}</TooltipContent>
            </Tooltip>

            {isOpponentsPanelOpen && (
              <div className="flex flex-col gap-2">
                {opponents.map((opponent) => {
                  const token = opponentTokens.get(opponent.id);
                  if (!token) return null;
                  return (
                    <TooltipProvider
                      key={`opponent-${opponent.id}-token-state-provider`}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onToggleToken(token)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                          >
                            <div className="grid grid-cols-1 grid-rows-1 items-center justify-items-center">
                              {opponent.image && opponent.image !== "" ? (
                                <img
                                  className="col-start-1 col-end-1 row-start-1 row-end-2 rounded-full"
                                  src={opponent.image}
                                  alt={`Picture of Opponent ${opponent.name}`}
                                />
                              ) : (
                                <span className="col-start-1 col-end-1 row-start-1 row-end-2">
                                  {opponent.icon}
                                </span>
                              )}

                              {!(tokenVisibility[token.id.toString()] ?? true) && (
                                <div className="col-start-1 col-end-1 row-start-1 row-end-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                  <EyeNoneIcon className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{opponent.name}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            )}
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default memo(TokenPanels);
