import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaDiceD20 } from "react-icons/fa";

type Props = {
  onLetUsRole: () => void;
};

function Welcome({ onLetUsRole }: Props) {
  const { t } = useTranslation("PageWelcome");

  return (
    <div className="flex h-full w-full items-center justify-center rounded-md bg-white">
      <div className="w-content flex flex-col items-center gap-4 text-center">
        <div className="flex gap-4">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <motion.div
              className="origin-bottom-right"
              initial={{ rotate: 0 }}
              animate={{ rotate: 15 }}
              transition={{
                duration: 0.5,
                repeat: 3,
                repeatType: "reverse",
              }}
            >
              <TypographyH1>👋</TypographyH1>
            </motion.div>
          </motion.div>

          <div className="flex gap-0.5">
            {t("title")
              .split("")
              .map((letter, index) => (
                <motion.h1
                  key={`title-${index}-${letter}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="min-w-2 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
                >
                  {letter}
                </motion.h1>
              ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: "2rem" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TypographyP>{t("description")}</TypographyP>
          <Button onClick={() => onLetUsRole()} size="lg" className="mt-4">
            {t("letsRole")}{" "}
            <motion.span
              animate={{ rotate: 360 }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: 1,
              }}
            >
              <FaDiceD20 />
            </motion.span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
<FaDiceD20 />;
export default Welcome;
