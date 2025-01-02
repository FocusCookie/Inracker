import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ComponentImmunityCatalogEN from "@/translations/en/components/ImmunityCatalog.json";
import ComponentImmunityCatalogDE from "@/translations/de/components/ImmunityCatalog.json"; 
import ComponentResistanceCatalogEN from "@/translations/en/components/ResistanceCatalog.json";
import ComponentResistanceCatalogDE from "@/translations/de/components/ResistanceCatalog.json"; 
import ComponentCatalogEN from "@/translations/en/components/Catalog.json";
import ComponentCatalogDE from "@/translations/de/components/Catalog.json";
import LanguageDetector from "i18next-browser-languagedetector";
import PageWelcomeEN from "@/translations/en/pages/welcome.json";
import PageWelcomeDE from "@/translations/de/pages/welcome.json";
import PagePartySelectionEN from "@/translations/en/pages/PartySelection.json";
import PagePartySelectionDE from "@/translations/de/pages/PartySelection.json";
import PageChapterSelectionEN from "@/translations/en/pages/ChapterSelection.json";
import PageChapterSelectionDE from "@/translations/de/pages/ChapterSelection.json";
import ComponentPartyCreateDrawerEN from "@/translations/en/components/PartyCreateDrawer.json";
import ComponentPartyCreateDrawerDE from "@/translations/de/components/PartyCreateDrawer.json";
import ComponentPartyEditDrawerEN from "@/translations/en/components/PartyEditDrawer.json";
import ComponentPartyEditDrawerDE from "@/translations/de/components/PartyEditDrawer.json";
import ComponentDrawerEN from "@/translations/en/components/Drawer.json";
import ComponentDrawerDE from "@/translations/de/components/Drawer.json";
import ComponentPartyCardEN from "@/translations/en/components/PartyCard.json";
import ComponentPartyCardDE from "@/translations/de/components/PartyCard.json";
import ComponentResistanceCardEN from "@/translations/en/components/ResistanceCard.json";
import ComponentResistanceCardDE from "@/translations/de/components/ResistanceCard.json";
import ComponentCreateImmunityDrawerEN from "@/translations/en/components/CreateImmunityDrawer.json";
import ComponentCreateImmunityDrawerDE from "@/translations/de/components/CreateImmunityDrawer.json";
import ComponentCreatePlayerDrawerEN from "@/translations/en/components/CreatePlayerDrawer.json";
import ComponentCreatePlayerDrawerDE from "@/translations/de/components/CreatePlayerDrawer.json";
import HookUseMutationWithErrorTaostEN from "@/translations/en/hooks/useMutationWithErrorTaost.json";
import HookUseMutationWithErrorTaostDE from "@/translations/de/hooks/useMutationWithErrorTaost.json";

const resources = {
  en: {
    // hygen-en-components - DO NOT DELETE THIS LINE
    ComponentImmunityCatalog: ComponentImmunityCatalogEN,
    ComponentResistanceCatalog: ComponentResistanceCatalogEN,
    ComponentPartyCreateDrawer: ComponentPartyCreateDrawerEN,
    ComponentPartyEditDrawer: ComponentPartyEditDrawerEN,
    ComponentDrawer: ComponentDrawerEN,
    ComponentPartyCard: ComponentPartyCardEN,
    ComponentResistanceCard: ComponentResistanceCardEN,
    ComponentCreateImmunityDrawer: ComponentCreateImmunityDrawerEN,
    ComponentCreatePlayerDrawer: ComponentCreatePlayerDrawerEN,
    ComponentCatalog: ComponentCatalogEN,

    // hygen-en-hooks - DO NOT DELETE THIS LINE
    HookUseMutationWithErrorTaost: HookUseMutationWithErrorTaostEN,

    // hygen-en-pages - DO NOT DELETE THIS LINE
    PageWelcome: PageWelcomeEN,
    PagePartySelection: PagePartySelectionEN,
    PageChapterSelection: PageChapterSelectionEN,
  },
  de: {
    // hygen-de-components - DO NOT DELETE THIS LINE
    ComponentImmunityCatalog: ComponentImmunityCatalogDE,
    ComponentResistanceCatalog: ComponentResistanceCatalogDE,
    ComponentPartyCreateDrawer: ComponentPartyCreateDrawerDE,
    ComponentPartyEditDrawer: ComponentPartyEditDrawerDE,
    ComponentDrawer: ComponentDrawerDE,
    ComponentResistanceCard: ComponentResistanceCardDE,
    ComponentPartyCard: ComponentPartyCardDE,
    ComponentCreateImmunityDrawer: ComponentCreateImmunityDrawerDE,
    ComponentCreatePlayerDrawer: ComponentCreatePlayerDrawerDE,
    ComponentCatalog: ComponentCatalogDE,

    // hygen-de-hooks - DO NOT DELETE THIS LINE
    HookUseMutationWithErrorTaost: HookUseMutationWithErrorTaostDE,

    // hygen-de-pages - DO NOT DELETE THIS LINE
    PageWelcome: PageWelcomeDE,
    PagePartySelection: PagePartySelectionDE,
    PageChapterSelection: PageChapterSelectionDE,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)

  .init({
    resources,
    lng: "de",
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
