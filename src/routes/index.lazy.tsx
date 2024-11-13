import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import Welcome from "@/pages/Welcome/Welcome";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  return <Welcome onLetUsRole={() => navigate({ to: "/parties" })} />;
}
