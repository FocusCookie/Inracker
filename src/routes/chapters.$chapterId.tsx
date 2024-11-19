import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chapters/$chapterId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { chapterId } = Route.useParams();

  return (
    <div className="bg-white p-4">
      "Hello /chapters/$chapterId!" {chapterId}
    </div>
  );
}
