import { Toaster } from "@/components/ui/toaster";
import "@fontsource-variable/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import "./i18next";
import { routeTree } from "./routeTree.gen";
import "./styles/global.css";
import { appDataDir } from "@tauri-apps/api/path";
import { createTauriAppDataSubfolders } from "./lib/utils";

const queryClient = new QueryClient();
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;

//* This prints out the app data dir
appDataDir().then((dir) => console.info("Inracker app data directory: " + dir));

createTauriAppDataSubfolders().then(() =>
  console.info("Images folders initialized"),
);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {
        // <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
      }

      <div className="h-full w-full bg-black p-4">
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>

    <div id="drawer-portal" />

    <div className="z-50">
      <Toaster />
    </div>
  </React.StrictMode>,
);
