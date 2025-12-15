import { OverlayHost } from "@/components/Overlay/OverlayHost";
import SettingsButton from "@/components/SettingsButton/SettingsButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <TooltipProvider>
      <Outlet />

      <SettingsButton />

      <OverlayHost />

      <TanStackRouterDevtools />
    </TooltipProvider>
  ),
});
