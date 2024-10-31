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
    <div className="h-full w-full bg-white flex  justify-center items-center rounded-md">
      <div className="flex flex-col items-center max-w-xl text-center">
        <div className="flex gap-4">
          <motion.div
            className="origin-bottom-right"
            initial={{ rotate: 0 }}
            animate={{ rotate: 15 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}>
            <TypographyH1>👋</TypographyH1>
          </motion.div>
          <TypographyH1>{t("title")}</TypographyH1>
        </div>

        <TypographyP>{t("description")}</TypographyP>

        <Button onClick={() => onLetUsRole()} size="lg" className="mt-4">
          {t("letsRole")} <FaDiceD20 />
        </Button>
      </div>
    </div>
  );
}

export default Welcome;
