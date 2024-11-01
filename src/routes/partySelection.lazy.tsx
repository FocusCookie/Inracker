import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/partySelection")({
  component: PartySelection,
});

function PartySelection() {
  return <div className="p-2">Select a party</div>;
}
