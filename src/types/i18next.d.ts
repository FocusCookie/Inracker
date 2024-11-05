import "i18next";
// import all namespaces (for the default language, only)
import PageWelcome from "@/translations/en/pages/Welcome.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      PageWelcome: typeof PageWelcome;
    };
  }
}
