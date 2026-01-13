import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  ArrowBigRightDashIcon,
  ChevronLeftIcon,
  CircleCheckBigIcon,
  ClockIcon,
  ListIcon,
  SwordsIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

type Props = {
  round: number;
  time: number;
  onFinish: () => void;
  onNext: () => void;
  onInitiative: () => void;
};

function CombatControls({
  round = 1,
  time = 0,
  onFinish,
  onInitiative,
  onNext,
}: Props) {
  const { t } = useTranslation("ComponentCombatControls");
  const [open, setOpen] = useState(false);

  function handleToggleOpen() {
    setOpen((c) => !c);
  }

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute top-4 left-4 flex gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur-sm"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleOpen();
              }}
              className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div
                    key="close"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <SwordsIcon className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </TooltipTrigger>
          <TooltipContent>{open ? t("close") : t("open")}</TooltipContent>
        </Tooltip>

        <AnimatePresence>
          {open && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0, width: 0 },
                visible: {
                  opacity: 1,
                  width: "auto",
                  transition: {
                    staggerChildren: 0.02,
                    delayChildren: 0.01,
                    duration: 0.1,
                  },
                },
                exit: {
                  opacity: 0,
                  width: 0,
                  transition: {
                    duration: 0.1,
                    staggerChildren: 0.02,
                    staggerDirection: -1,
                  },
                },
              }}
              className="flex gap-2 overflow-hidden"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.5 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.02 },
                  },
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInitiative();
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                    >
                      <ListIcon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{t("initiative")}</TooltipContent>
                </Tooltip>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.5 },
                  visible: { opacity: 1, scale: 1 },
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFinish();
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                    >
                      <CircleCheckBigIcon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{t("finishCombat")}</TooltipContent>
                </Tooltip>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.5 },
                  visible: { opacity: 1, scale: 1 },
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                    >
                      <ArrowBigRightDashIcon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{t("nextTurn")}</TooltipContent>
                </Tooltip>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.5 },
                  visible: { opacity: 1, scale: 1 },
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.span className="flex h-8 w-fit items-center justify-center rounded-full bg-white/40 px-4 font-medium whitespace-nowrap text-white">
                      # {round}
                    </motion.span>
                  </TooltipTrigger>
                  <TooltipContent>{t("round")}</TooltipContent>
                </Tooltip>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.5 },
                  visible: { opacity: 1, scale: 1 },
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex h-8 w-fit items-center justify-center gap-2 rounded-full bg-white/40 px-4 whitespace-nowrap">
                      <ClockIcon className="h-4 w-4 text-white" />
                      <span className="font-medium text-white">{time}s</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{t("time")}</TooltipContent>
                </Tooltip>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </motion.div>
  );
}

export default CombatControls;
