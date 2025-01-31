import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import Welcome from "@/pages/Welcome/Welcome";
import { useEffect } from "react";
import { usePlayerStore } from "@/stores/PlayersState";
import { useImmunityStore } from "@/stores/ImmunitiesState";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  //TODO: create a hook for the initial data loading
  const { getAllPlayers } = usePlayerStore();
  const { getAllImmunities } = useImmunityStore();

  useEffect(() => {
    getAllImmunities();
    getAllPlayers();
  }, []);

  const navigate = useNavigate();

  return <Welcome onLetUsRole={() => navigate({ to: "/parties" })} />;
}
