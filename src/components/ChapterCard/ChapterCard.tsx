import { Chapter as TChapter } from "@/types/chapters";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  Pencil1Icon,
  PlayIcon,
} from "@radix-ui/react-icons";
import { useMeasure } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { TypographyH3 } from "../ui/typographyH3";

type Props = {
  chapter: TChapter;
  animationDelay?: number;
  onEdit: (chapter: TChapter) => void;
  onPlay: (id: TChapter["id"]) => void;
};

function ChapterCard({ chapter, onEdit, onPlay, animationDelay }: Props) {
  const { t } = useTranslation("ComponentChapterCard");
  const [ref, { height }] = useMeasure();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState<boolean>(false);

  function handleEdit() {
    onEdit(chapter);
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

  function handleToggleDescription() {
    setIsDescriptionOpen((c) => !c);
  }

  function handlePlay() {
    onPlay(chapter.id);
  }

  return (
    <motion.div
      className="flex w-full flex-col"
      initial={{ opacity: 0, x: "-2rem" }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
      exit={{ opacity: 0, x: "2rem" }}
    >
      <Card className="px-0">
        <CardHeader className="px-4 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex grow gap-2">
              <span className="w-8 text-center text-2xl">{chapter.icon}</span>

              <TypographyH3>{chapter.name}</TypographyH3>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex gap-2 capitalize">
                {chapterStateIcon} {chapter.state}
              </Badge>

              <Button onClick={handleEdit} variant="ghost">
                <Pencil1Icon />
              </Button>

              <Button variant="ghost" onClick={handleToggleDescription}>
                {isDescriptionOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence mode="wait">
          {isDescriptionOpen && chapter.description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: height ? height + 8 : 0, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <CardContent
                className="flex flex-col border-t border-b border-neutral-300 p-4"
                ref={ref}
              >
                <MarkdownReader markdown={chapter.description} />
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        <CardFooter className="flex justify-end gap-2 px-4 pt-2">
          <Button onClick={handlePlay}>{t("select")}</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default ChapterCard;
