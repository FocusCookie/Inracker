import ChapterSelection from "@/pages/ChapterSelection/ChapterSelection";
import { useChapterStore } from "@/stores/ChaptersState";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";

type ChapterSearch = {
  partyId: number | null;
};

export const Route = createFileRoute("/chapters/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ChapterSearch => {
    return {
      partyId: Number(search?.partyId || null),
    };
  },
});

function RouteComponent() {
  const { getAllChapters } = useChapterStore();
  const partyId = useSearch({
    from: "/chapters/",
    select: (search) => search.partyId,
  });

  useEffect(() => {
    if (partyId) {
      getAllChapters(partyId);
    }
  }, []);

  return partyId ? (
    <ChapterSelection partyId={partyId} />
  ) : (
    <span>No Party ID set</span>
  );
}
