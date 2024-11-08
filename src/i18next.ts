import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import PageWelcomeEN from "@/translations/en/pages/welcome.json";
import PageWelcomeDE from "@/translations/de/pages/welcome.json";
import PagePartySelectionDE from "@/translations/de/pages/PartySelection.json";
import PagePartySelectionEN from "@/translations/en/pages/PartySelection.json";
import ComponentPartyCreateDrawerEN from "@/translations/en/components/PartyCreateDrawer.json";
import ComponentPartyCreateDrawerDE from "@/translations/de/components/PartyCreateDrawer.json";
import ComponentDrawerDE from "@/translations/de/components/Drawer.json";
import ComponentDrawerEN from "@/translations/en/components/Drawer.json";

const resources = {
  en: {
    PageWelcome: PageWelcomeEN,
    PagePartySelection: PagePartySelectionEN,
    ComponentPartyCreateDrawer: ComponentPartyCreateDrawerEN,
    ComponentDrawer: ComponentDrawerEN,
  },
  de: {
    PageWelcome: PageWelcomeDE,
    PagePartySelection: PagePartySelectionDE,
    ComponentPartyCreateDrawer: ComponentPartyCreateDrawerDE,
    ComponentDrawer: ComponentDrawerDE,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)

  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
