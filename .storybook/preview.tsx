import React, { useEffect } from "react";
import type { Preview } from "@storybook/react";
import "../src/styles/global.css";
import i18n from "../src/i18next";
import "@fontsource-variable/inter";
import { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute();
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/" });
const memoryHistory = createMemoryHistory({ initialEntries: ["/"] });
const routeTree = rootRoute.addChildren([indexRoute]);
const router = createRouter({ routeTree, history: memoryHistory });

//* For i18n support follow https://storybook.js.org/recipes/react-i18next

export const globalTypes = {
  locale: {
    name: "Locale",
    description: "Internationalization locale",
    toolbar: {
      icon: "globe",
      items: [
        { value: "en", title: "🇺🇸 English" },
        { value: "de", title: "🇩🇪 Deutsch" },
      ],
      showName: true,
    },
  },
};

const withI18next = (Story, context) => {
  const { locale } = context.globals;

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    </Suspense>
  );
};

const withRouter = (Story, context) => {
  return (
    <RouterProvider
      router={router}
      defaultComponent={() => <Story {...context} />}
    />
  );
};

const preview: Preview = {
  decorators: [
    withI18next,
    withRouter,
    (Story) => <div className="h-full w-full bg-black p-4">{Story()}</div>,
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
