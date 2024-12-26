import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import ChapterSelection from "@/pages/ChapterSelection/ChapterSelection";
import { storeImage } from "@/lib/utils";

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

  const partyQuery = useQueryWithToast({
    queryKey: [`party-${partyId}`],
    queryFn: async () => {
      // @ts-ignore
      const data = await db.parties.getDetailedById(partyId);
      return data;
    },
    enabled: !!partyId,
  });

  const chaptersQuery = useQueryWithToast({
    queryKey: [`chapters-party-${partyId}`],
    queryFn: async () => {
      // @ts-ignore
      const data = await db.chapters.getChaptersByPartyId(partyId);
      return data;
    },
    enabled: !!partyId,
  });

  const playersCatalogQuery = useQueryWithToast({
    queryKey: [`all-players`],
    queryFn: async () => {
      // @ts-ignore
      const data = await db.players.getAllDetailed();
      return data;
    },
    enabled: !!partyId,
  });

  return (
    <ChapterSelection
      onStorePlayerImage={storeImage}
      loading={chaptersQuery.isLoading || partyQuery.isLoading}
      players={partyQuery?.data?.players || []}
      chapters={chaptersQuery.data || []}
      playersCatalog={playersCatalogQuery.data || []}
    />
  );
}

// <div className="flex h-full w-full flex-col gap-4 pb-4">
