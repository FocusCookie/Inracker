import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import ChapterSelection from "@/pages/ChapterSelection/ChapterSelection";
import { useChapterStore } from "@/stores/useChapterStore";
import { DBEffect } from "@/types/effect";
import { DBImmunity } from "@/types/immunitiy";
import { Player } from "@/types/player";
import { DBResistance } from "@/types/resistances";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";

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

  const { currentChapter, setCurrentChapter } = useChapterStore(
    useShallow((state) => ({
      currentChapter: state.currentChapter,
      setCurrentChapter: state.setCurrentChapter,
    })),
  );

  useEffect(() => {
    setCurrentChapter(null);
    queryClient.invalidateQueries({
      queryKey: ["encounters"],
    });
  }, []);

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
      resistanceId,
    }: {
      playerId: Player["id"];
      resistanceId: DBResistance["id"];
    }) => {
      return await db.players.removeResistanceFromPlayer(
        playerId,
        resistanceId,
      );
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

  const removeEffectFromPlayer = useMutationWithErrorToast({
    mutationFn: async ({
      playerId,
      effectId,
    }: {
      playerId: Player["id"];
      effectId: DBEffect["id"];
    }) => {
      return await db.players.removeEffectFromPlayer(playerId, effectId);
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
      onRemovePlayerFromParty={removePlayerFromParty.mutate}
      onRemoveImmunityFromPlayer={(playerId, immunityId) =>
        removeImmunityFromPlayer.mutate({ playerId, immunityId })
      }
      onRemoveResistanceFromPlayer={(playerId, resistanceId) =>
        removeResistanceFromPlayer.mutate({ playerId, resistanceId })
      }
      onRemoveEffectFromPlayer={(playerId, effectId) =>
        removeEffectFromPlayer.mutate({ playerId, effectId })
      }
    />
  ) : (
    <span>No Party ID set</span>
  );
}
