import { TypographyH4 } from "../ui/typographyH4";
import { Button } from "../ui/button";
import { ClockIcon, XIcon, SparklesIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTranslation } from "react-i18next";
import { Player } from "@/types/player";
import { EncounterOpponent } from "@/types/opponents";
import { Effect } from "@/types/effect";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type Props = {
  players: Player[];
  encounterOpponents: EncounterOpponent[];
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
};

function ActiveEffectsMenue({
  players,
  encounterOpponents,
  isOpen,
  setIsOpen,
}: Props) {
  const { t } = useTranslation("ComponentActiveEffectsMenue");

  function handleClose() {
    setIsOpen(false);
  }

  // Combine entities that have active effects
  const entitiesWithEffects = [
    ...players.map(p => ({ ...p, type: 'player' as const })),
    ...encounterOpponents.map(o => ({ ...o, type: 'opponent' as const }))
  ].filter(e => e.effects && e.effects.length > 0);

  return (
    <aside className="max-w-72">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="overflow-hidden rounded-l-lg bg-white shadow-md border-l"
            initial={{ width: 0, x: 300 }}
            animate={{
              width: "100%",
              x: 0
            }}
            exit={{
              width: 0,
              x: 300
            }}
          >
            <div className="flex w-72 flex-col gap-4 p-4">
              <header className="flex items-center justify-between gap-2">
                <TypographyH4><SparklesIcon className="inline mr-2 w-5 h-5"/>{t("title")}</TypographyH4>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <XIcon className="w-4 h-4"/>
                </Button>
              </header>

              <div className="flex flex-col gap-6 overflow-y-auto max-h-[70vh] pr-2">
                {entitiesWithEffects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{t("noEffects")}</p>
                ) : (
                  entitiesWithEffects.map((entity) => (
                    <div key={`${entity.type}-${entity.id}`} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 border-b pb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={entity.image || undefined} alt={entity.name} />
                          <AvatarFallback>{entity.icon}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-sm truncate">{entity.name}</span>
                      </div>
                      
                      <ul className="flex flex-col gap-1.5 pl-2">
                        {entity.effects.map((effect: Effect) => (
                          <li key={effect.id}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <span className="text-sm">{effect.icon}</span>
                                      <span className="text-xs font-medium truncate">{effect.name}</span>
                                    </div>
                                    <Badge 
                                      variant={effect.type === 'positive' ? 'secondary' : 'destructive'} 
                                      className="h-5 px-1.5 gap-1 text-[10px]"
                                    >
                                      <ClockIcon className="w-2.5 h-2.5"/>
                                      {effect.duration}
                                    </Badge>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-xs">
                                  <p className="font-bold mb-1">{effect.name}</p>
                                  <p className="text-sm">{effect.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

export default ActiveEffectsMenue;
