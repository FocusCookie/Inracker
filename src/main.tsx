import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import { routeTree } from "./routeTree.gen";
import "./i18next";
import "@fontsource-variable/inter";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <div className="h-full w-full bg-black p-4">
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>,
);
