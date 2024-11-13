import { Toaster } from "@/components/ui/toaster";
import "@fontsource-variable/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import "./i18next";
import { routeTree } from "./routeTree.gen";
import "./styles/global.css";

const queryClient = new QueryClient();
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="h-full w-full bg-black p-4">
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
    <div id="drawer-portal" />
    <Toaster />
  </React.StrictMode>,
);

//TODO: Error handling for the query with soner notifications.
