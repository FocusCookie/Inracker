import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FaDiceD20 } from "react-icons/fa";

type Props = {
  size?: "base" | "large";
  title?: string;
};

function Loader({ size = "base", title }: Props) {
  const sizes = {
    base: "text-base",
    large: "text-2xl",
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={cn("origin-center", sizes[size])}
        animate={{ rotate: 360 }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      >
        <FaDiceD20 />
      </motion.div>

      {!!title && <p className="text-muted-default text-sm">{title}</p>}
    </motion.div>
  );
}

export default Loader;
