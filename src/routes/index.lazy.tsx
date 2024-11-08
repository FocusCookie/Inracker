import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import Welcome from "@/pages/Welcome/Welcome";
import usePartyStore from "@/hooks/usePartyStore";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { getParties: getPartys } = usePartyStore();

  //TODO: REact query usage for loading?
  useEffect(() => {
    getPartys();
  }, []);

  return <Welcome onLetUsRole={() => navigate({ to: "/parties" })} />;
}
