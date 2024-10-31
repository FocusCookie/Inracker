import i18n from "i18next";
// Bindings for React: allow components to
// re-render when language changes.
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import PageWelcomeEN from "@/translations/en/pages/Welcome.json";
import PageWelcomeDE from "@/translations/de/pages/Welcome.json";

const resources = {
  en: {
    PageWelcome: PageWelcomeEN,
  },
  de: {
    PageWelcome: PageWelcomeDE,
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
