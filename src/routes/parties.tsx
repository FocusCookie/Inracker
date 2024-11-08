import PartyCreateDrawer from "@/components/PartyCreateDrawer/PartyCreateDrawer";
import usePartyStore from "@/hooks/usePartyStore";
import PartySelection from "@/pages/PartySelection/PartySelection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/parties")({
  component: Parties,
});

function Parties() {
  const { parties } = usePartyStore();

  return (
    <PartySelection
      parties={parties}
      renderCreatePartyDrawer={<PartyCreateDrawer />}
    />
  );
}
