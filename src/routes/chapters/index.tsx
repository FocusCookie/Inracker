import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import ChapterSelection from "@/pages/ChapterSelection/ChapterSelection";
import { DBImmunity } from "@/types/immunitiy";
import { Player } from "@/types/player";
import { DBResistance } from "@/types/resistances";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

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

  const players = useQueryWithToast({
    queryKey: ["players"],
    queryFn: () => db.players.getAllDetailed(),
  });

  const removePlayerFromParty = useMutationWithErrorToast({
    mutationFn: (id: Player["id"]) => {
      return db.parties.removePlayerFromParty(partyId!, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["party"],
      });
    },
  });

  const removeImmunityFromPlayer = useMutationWithErrorToast({
    mutationFn: async ({
      playerId,
      immunityId,
    }: {
      playerId: Player["id"];
      immunityId: DBImmunity["id"];
    }) => {
      return db.players.removeImmunityFromPlayer(playerId, immunityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["party"],
      });
      queryClient.invalidateQueries({
        queryKey: ["players"],
      });
    },
  });

  const removeResistanceFromPlayer = useMutationWithErrorToast({
    mutationFn: async ({
      playerId,
      resistanceId: immunityId,
    }: {
      playerId: Player["id"];
      resistanceId: DBResistance["id"];
    }) => {
      return db.players.removeResistanceFromPlayer(playerId, immunityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["party"],
      });
      queryClient.invalidateQueries({
        queryKey: ["players"],
      });
    },
  });

  return !!party.data ? (
    <ChapterSelection
      isLoading={chapters.isLoading || party.isLoading}
      chapters={chapters.data || []}
      party={party.data}
      players={players.data || []}
      onRemovePlayerFromParty={removePlayerFromParty.mutate}
      onRemoveImmunityFromPlayer={(playerId, immunityId) =>
        removeImmunityFromPlayer.mutate({ playerId, immunityId })
      }
      onRemoveResistanceFromPlayer={(playerId, resistanceId) =>
        removeResistanceFromPlayer.mutate({ playerId, resistanceId })
      }
    />
  ) : (
    <span>No Party ID set</span>
  );
}
