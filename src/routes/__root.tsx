import GlobalModals from "@/components/GlobalModals/GlobalModals";
import { OverlayHost } from "@/components/Overlay/OverlayHost";
import SettingsButton from "@/components/SettingsButton/SettingsButton";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />

      <SettingsButton />

      <GlobalModals />

      <OverlayHost />

      <TanStackRouterDevtools />
    </>
  ),
});
