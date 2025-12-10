import { useChaptersQuery } from "@/hooks/useChapters";
import { usePartyQuery } from "@/hooks/useParties";
import ChapterSelection from "@/pages/ChapterSelection/ChapterSelection";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import database from "@/lib/database";

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
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["encounters"],
    });
  }, []);

  const partyId = useSearch({
    from: "/chapters/",
    select: (search) => search.partyId,
  });

  const chapters = useChaptersQuery(partyId, database);
  const party = usePartyQuery(partyId, database);

  return !!party.data ? (
    <ChapterSelection
      database={database}
      isLoading={chapters.isLoading || party.isLoading}
      chapters={chapters.data || []}
      party={party.data}
    />
  ) : (
    //TODO: create nice 404 page for this
    <span>No Party ID set</span>
  );
}
