import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import ChapterSelection from "@/pages/ChapterSelection/ChapterSelection";
import { createFileRoute, useSearch } from "@tanstack/react-router";

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
  const partyId = useSearch({
    from: "/chapters/",
    select: (search) => search.partyId,
  });

  const chapters = useQueryWithToast({
    queryKey: ["chapters"],
    queryFn: () => db.chapters.getChaptersByPartyId(partyId!),
    enabled: !!partyId,
  });

  const party = useQueryWithToast({
    queryKey: ["party"],
    queryFn: () => db.parties.getDetailedById(partyId!),
    enabled: !!partyId,
  });

  return !!party.data ? (
    <ChapterSelection
      loading={chapters.isLoading}
      chapters={chapters.data || []}
      party={party.data}
    />
  ) : (
    <span>No Party ID set</span>
  );
}
