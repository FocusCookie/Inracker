import PartySelection from "@/pages/PartySelection/PartySelection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/parties")({
  component: Parties,
});

function Parties() {
  return <PartySelection />;
}
