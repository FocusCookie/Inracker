import { createLazyFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useTranslation("PageWelcome");

  return (
    <div className="p-2">
      <h3 className={cn("text-emerald-500 text-4xl")}>{t("title")}</h3>

      <Button size="sm">Hello</Button>
    </div>
  );
}
