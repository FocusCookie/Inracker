import { Chapter, DBChapter } from "@/types/chapters";
import { motion } from "framer-motion";
import { TypographyH2 } from "../ui/typographyh2";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { TypographyP } from "../ui/typographyP";
import { RiEdit2Fill } from "react-icons/ri";

type Props = {
  chapter: DBChapter;
  onEdit: (chapterId: Chapter["id"]) => void;
};

function ChapterCard({ chapter, onEdit }: Props) {
  function handleEdit() {
    onEdit(chapter.id);
  }

  return (
    <motion.div
      className="flex w-full flex-col gap-4"
      initial={{ opacity: 0, x: "-2rem" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "2rem" }}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <TypographyH2>{chapter.name}</TypographyH2>

          <Button
            aria-label={`Edit chapter ${chapter.name}`}
            onClick={handleEdit}
            variant="ghost"
            size="icon"
          >
            <RiEdit2Fill />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge>{chapter.state}</Badge>
          {chapter.experience && <Badge>{chapter.experience} EP</Badge>}
        </div>
      </div>

      <TypographyP className="line-clamp-6">{chapter.description}</TypographyP>
    </motion.div>
  );
}

export default ChapterCard;
