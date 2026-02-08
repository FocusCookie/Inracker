import { OverlayHost } from "@/components/Overlay/OverlayHost";
import SettingsButton from "@/components/SettingsButton/SettingsButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import Database from "@/lib/database";
import i18n from "@/i18next";
import { useQuery } from "@tanstack/react-query";
import { useAppUpdates } from "@/hooks/useAppUpdates";

export const Route = createRootRoute({
  component: () => {
    const { checkForUpdates } = useAppUpdates();

    const { data: language } = useQuery({
      queryKey: ["settings", "language"],
      queryFn: async () => {
        return await Database.settings.get("language");
      },
    });

    useEffect(() => {
      if (language) {
        i18n.changeLanguage(language);
      }
    }, [language]);

    useEffect(() => {
      checkForUpdates();
    }, [checkForUpdates]);

    return (
      <TooltipProvider>
        <Outlet />

        <SettingsButton />

        <OverlayHost />

        {
          //         <TanStackRouterDevtools />
        }
      </TooltipProvider>
    );
  },
});
