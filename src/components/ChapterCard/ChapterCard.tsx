import { Chapter as TChapter } from "@/types/chapters";
import { motion } from "framer-motion";
import { TypographyH2 } from "../ui/typographyh2";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { TypographyP } from "../ui/typographyP";
import { RiEdit2Fill } from "react-icons/ri";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ClockIcon,
  DoubleArrowUpIcon,
  Pencil1Icon,
  PlayIcon,
} from "@radix-ui/react-icons";

type Props = {
  chapter: TChapter;
  onEdit: (chapterId: TChapter["id"]) => void;
  onPushUp: (id: TChapter["id"]) => void;
  onPushDown: (id: TChapter["id"]) => void;
};

function ChapterCard({ chapter, onEdit, onPushDown, onPushUp }: Props) {
  function handleEdit() {
    onEdit(chapter.id);
  }

  const chapterStateIcon =
    chapter.state === "draft" ? (
      <Pencil1Icon className="h-3 w-3" />
    ) : chapter.state === "ongoing" ? (
      <PlayIcon className="h-3 w-3" />
    ) : chapter.state === "completed" ? (
      <ClockIcon className="h-3 w-3" />
    ) : (
      <CheckIcon className="h-3 w-3" />
    );

  function handlePushDown() {
    onPushDown(chapter.id);
  }

  function handlePushUp() {
    onPushUp(chapter.id);
  }

  return (
    <motion.div
      className="flex w-full flex-col"
      initial={{ opacity: 0, x: "-2rem" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "2rem" }}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <div className="flex grow gap-2">
            <TypographyH2>
              {chapter.icon} {chapter.name}
            </TypographyH2>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handlePushDown} variant="ghost" size="icon">
              <ArrowDownIcon />
            </Button>

            <Button onClick={handlePushUp} variant="ghost" size="icon">
              <ArrowUpIcon />
            </Button>

            <Button
              aria-label={`Edit chapter ${chapter.name}`}
              onClick={handleEdit}
              variant="ghost"
              size="icon"
            >
              <RiEdit2Fill />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Badge className="flex gap-1">
          {chapterStateIcon} {chapter.state}
        </Badge>
        {chapter.experience && (
          <Badge className="flex gap-2">
            <DoubleArrowUpIcon className="h-3 w-3" />
            {chapter.experience} EP
          </Badge>
        )}
      </div>

      {chapter.battlemap && (
        <img
          className="mt-3 max-h-96 w-full overflow-hidden rounded-md object-cover"
          src={chapter.battlemap}
          alt="battlemap"
        />
      )}

      <TypographyP className="mt-3 line-clamp-6">
        {chapter.description}
      </TypographyP>
    </motion.div>
  );
}

export default ChapterCard;
