import { createLazyFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3 className={cn("text-emerald-500 text-4xl")}>Welcome Home!</h3>

      <Button size="sm">Hello</Button>
    </div>
  );
}
