import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import ChapterSelection from "@/pages/ChapterSelection/ChapterSelection";
import { useQueryClient } from "@tanstack/react-query";
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
      isLoading={chapters.isLoading || party.isLoading}
      chapters={chapters.data || []}
      party={party.data}
      onRemovePlayerFromParty={(data) =>
        db.parties.removePlayerFromParty(data.partyId, data.playerId)
      }
      onRemoveImmunityFromPlayer={(data) =>
        db.players.removeImmunityFromPlayer(data.playerId, data.immunityId)
      }
      onRemoveResistanceFromPlayer={(data) =>
        db.players.removeResistanceFromPlayer(data.playerId, data.resistanceId)
      }
      onRemoveEffectFromPlayer={(data) =>
        db.players.removeEffectFromPlayer(data.playerId, data.effectId)
      }
      onCreateChapter={db.chapters.create}
      onEditChapter={db.chapters.update}
      onDeleteChapter={db.chapters.delete}
      onCreatePlayer={db.players.create}
      onEditPlayer={db.players.update}
      onAddPlayerToParty={(data) =>
        db.parties.addPlayerToParty(data.partyId, data.playerId)
      }
      onCreateEffect={db.effects.create}
      onAddEffectToPlayer={(data) =>
        db.players.addEffectToPlayer(data.playerId, data.effectId)
      }
      onCreateImmunity={db.immunitites.create}
      onAddImmunityToPlayer={(data) =>
        db.players.addImmunityToPlayer(data.playerId, data.immunityId)
      }
      onCreateResistance={db.resistances.create}
      onAddResistanceToPlayer={(data) =>
        db.players.addResistanceToPlayer(data.playerId, data.resistanceId)
      }
    />
  ) : (
    <span>No Party ID set</span>
  );
}
