import "i18next";
// import all namespaces (for the default language, only)
import PageWelcome from "@/translations/en/pages/Welcome.json";
import PagePartySelection from "@/translations/en/pages/PartySelection.json";
import ComponentPartyCreateDrawer from "@/translations/en/components/PartyCreateDrawer.json";
import ComponentDrawer from "@/translations/en/components/Drawer.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      PageWelcome: typeof PageWelcome;
      PagePartySelection: typeof PagePartySelection;
      ComponentPartyCreateDrawer: typeof ComponentPartyCreateDrawer;
      ComponentDrawer: typeof ComponentDrawer;
    };
  }
}
