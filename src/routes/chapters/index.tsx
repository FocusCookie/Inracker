import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import ChapterSelection from "@/pages/ChapterSelection/ChapterSelection";
import { storeImage } from "@/lib/utils";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { Immunity } from "@/types/immunitiy";
import { useQueryClient } from "@tanstack/react-query";
import { Resistance } from "@/types/resistances";
import { TCreatePlayer } from "@/types/player";
import { toast } from "@/hooks/use-toast";

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
    queryKey: [`players`],
    queryFn: async () => {
      // @ts-ignore
      const data = await db.players.getAllDetailed();
      return data;
    },
    enabled: !!partyId,
  });

  const immunitesQuery = useQueryWithToast({
    queryKey: [`immunities`],
    queryFn: async () => {
      // @ts-ignore
      const data = await db.immunitites.getAll();
      return data;
    },
    enabled: !!partyId,
  });

  const resistancesQuery = useQueryWithToast({
    queryKey: [`resistances`],
    queryFn: async () => {
      // @ts-ignore
      const data = await db.resistances.getAll();
      return data;
    },
    enabled: !!partyId,
  });

  const createImmunityMutation = useMutationWithErrorToast({
    mutationFn: (immunity: Immunity) => {
      return db.immunitites.create(immunity);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["immunities"] });
      toast({
        variant: "default",
        title: `${data.icon} ${data.name} created.`,
      });
      console.log({ data });
    },
    onError: (error) => console.log(error),
  });

  const createResistanceMutation = useMutationWithErrorToast({
    mutationFn: (resistance: Resistance) => {
      return db.resistances.create(resistance);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
      toast({
        variant: "default",
        title: `${data.icon} ${data.name} created.`,
      });
    },
    onError: (error) => console.log(error),
  });

  const createPlayerMutation = useMutationWithErrorToast({
    mutationFn: (player: Omit<TCreatePlayer, "id">) => {
      return db.players.create(player);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
    onError: (error) => console.log(error),
  });

  return (
    <ChapterSelection
      isCreatingImmunity={createImmunityMutation.isPending}
      isCreatingPlayer={createPlayerMutation.isPending}
      isCreatingResistance={createResistanceMutation.isPending}
      onCreatePlayer={createPlayerMutation.mutate}
      onCreateResistance={createResistanceMutation.mutate}
      onCreateImmunity={createImmunityMutation.mutate}
      resistances={resistancesQuery.data || []}
      immunities={immunitesQuery.data || []}
      onStorePlayerImage={storeImage}
      loading={chaptersQuery.isLoading || partyQuery.isLoading}
      players={partyQuery?.data?.players || []}
      chapters={chaptersQuery.data || []}
      playersCatalog={playersCatalogQuery.data || []}
    />
  );
}

// <div className="flex h-full w-full flex-col gap-4 pb-4">
