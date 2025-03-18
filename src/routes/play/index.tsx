import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/play/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="bg-white">Hello "/play/"!</div>;
}
