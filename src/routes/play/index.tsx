import { createFileRoute, useSearch } from "@tanstack/react-router";
import db from "@/lib/database";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import Play from "@/pages/Play/Play";

type PlaySearch = {
  partyId: number | null;
  chapterId: number | null;
};

export const Route = createFileRoute("/play/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): PlaySearch => {
    return {
      partyId: Number(search?.partyId || null),
      chapterId: Number(search?.chapterId || null),
    };
  },
});

function RouteComponent() {
  const { partyId, chapterId } = useSearch({ from: "/play/" });

  if (!partyId || !chapterId) throw new Error("No Chapter or Party id");

  const partyQuery = useQueryWithToast({
    queryKey: ["party"],
    queryFn: () => db.parties.getDetailedById(partyId!),
    enabled: !!partyId,
  });

  const chapterQuery = useQueryWithToast({
    queryKey: ["chapter"],
    queryFn: () => db.chapters.getByIdDetailed(chapterId),
    enabled: !!chapterId,
  });

  const encountersQuery = useQueryWithToast({
    queryKey: ["encounters"],
    queryFn: () => db.encounters.getDetailedEncountersByChapterId(chapterId),
    enabled: !!chapterId,
  });

  const tokensQuery = useQueryWithToast({
    queryKey: ["tokens"],
    queryFn: () => db.tokens.getChapterTokens(partyId, chapterId),
    enabled: !!chapterId && !!partyId,
  });

  const opponentsQuery = useQueryWithToast({
    queryKey: ["opponents"],
    queryFn: () => db.opponents.getAllDetailed(),
    enabled: !!chapterId && !!partyId,
  });

  return (
    <>
      {!chapterId || (!partyId && <span> No chapter or party id </span>)}

      {chapterQuery.isSuccess &&
        chapterQuery.data &&
        partyQuery.isSuccess &&
        chapterQuery.data && (
          <Play
            partyId={partyQuery.data.id}
            database={db}
            chapter={chapterQuery.data}
            encounters={encountersQuery.data || []}
            opponents={opponentsQuery.data || []}
            players={partyQuery.data.players || []}
            tokens={tokensQuery.data || []}
          />
        )}
    </>
  );
}
