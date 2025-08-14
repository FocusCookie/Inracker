import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ComponentEditResistanceDrawerEN from "@/translations/en/components/EditResistanceDrawer.json";
import ComponentEditResistanceDrawerDE from "@/translations/de/components/EditResistanceDrawer.json"; 
import ComponentSettingResistanceCardEN from "@/translations/en/components/SettingResistanceCard.json";
import ComponentSettingResistanceCardDE from "@/translations/de/components/SettingResistanceCard.json"; 
import ComponentEditImmunityDrawerEN from "@/translations/en/components/EditImmunityDrawer.json";
import ComponentEditImmunityDrawerDE from "@/translations/de/components/EditImmunityDrawer.json"; 
import ComponentSettingImmunityCardEN from "@/translations/en/components/SettingImmunityCard.json";
import ComponentSettingImmunityCardDE from "@/translations/de/components/SettingImmunityCard.json"; 
import ComponentSettingEffectCardEN from "@/translations/en/components/SettingEffectCard.json";
import ComponentSettingEffectCardDE from "@/translations/de/components/SettingEffectCard.json"; 
import ComponentSettingPlayerCardEN from "@/translations/en/components/SettingPlayerCard.json";
import ComponentSettingPlayerCardDE from "@/translations/de/components/SettingPlayerCard.json"; 
import ComponentEditEffectDrawerEN from "@/translations/en/components/EditEffectDrawer.json";
import ComponentEditEffectDrawerDE from "@/translations/de/components/EditEffectDrawer.json"; 
import ComponentCreateEffectDrawerEN from "@/translations/en/components/CreateEffectDrawer.json";
import ComponentCreateEffectDrawerDE from "@/translations/de/components/CreateEffectDrawer.json"; 
import ComponentOpponentsCatalogEN from "@/translations/en/components/OpponentsCatalog.json";
import ComponentOpponentsCatalogDE from "@/translations/de/components/OpponentsCatalog.json"; 
import ComponentOpponentCardEN from "@/translations/en/components/OpponentCard.json";
import ComponentOpponentCardDE from "@/translations/de/components/OpponentCard.json"; 
import ComponentCreateEncounterDrawerEN from "@/translations/en/components/CreateEncounterDrawer.json";
import ComponentCreateEncounterDrawerDE from "@/translations/de/components/CreateEncounterDrawer.json"; 
import ComponentCreateOpponentDrawerEN from "@/translations/en/components/CreateOpponentDrawer.json";
import ComponentCreateOpponentDrawerDE from "@/translations/de/components/CreateOpponentDrawer.json";
import ComponentCreateOpponentFormEN from "@/translations/en/components/CreateOpponentForm.json";
import ComponentCreateOpponentFormDE from "@/translations/de/components/CreateOpponentForm.json";
import ComponentChapterCardEN from "@/translations/en/components/ChapterCard.json";
import ComponentChapterCardDE from "@/translations/de/components/ChapterCard.json";
import ComponentEditChapterDrawerEN from "@/translations/en/components/EditChapterDrawer.json";
import ComponentEditChapterDrawerDE from "@/translations/de/components/EditChapterDrawer.json";
import ComponentCreateChapterDrawerEN from "@/translations/en/components/CreateChapterDrawer.json";
import ComponentCreateChapterDrawerDE from "@/translations/de/components/CreateChapterDrawer.json";
import ComponentPlayerCardEN from "@/translations/en/components/PlayerCard.json";
import ComponentPlayerCardDE from "@/translations/de/components/PlayerCard.json";
import ComponentSettingsDialogEN from "@/translations/en/components/SettingsDialog.json";
import ComponentSettingsDialogDE from "@/translations/de/components/SettingsDialog.json";
import ComponentPlayerCatalogEN from "@/translations/en/components/PlayerCatalog.json";
import ComponentPlayerCatalogDE from "@/translations/de/components/PlayerCatalog.json";
import ComponentEditPlayerDrawerEN from "@/translations/en/components/EditPlayerDrawer.json";
import ComponentEditPlayerDrawerDE from "@/translations/de/components/EditPlayerDrawer.json";
import ComponentEffectsCatalogEN from "@/translations/en/components/EffectsCatalog.json";
import ComponentEffectsCatalogDE from "@/translations/de/components/EffectsCatalog.json";
import ComponentCreateResistanceDrawerEN from "@/translations/en/components/CreateResistanceDrawer.json";
import ComponentCreateResistanceDrawerDE from "@/translations/de/components/CreateResistanceDrawer.json";
import ComponentImmunitiesCatalogEN from "@/translations/en/components/ImmunitiesCatalog.json";
import ComponentImmunitiesCatalogDE from "@/translations/de/components/ImmunitiesCatalog.json";
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
    ComponentEditResistanceDrawer: ComponentEditResistanceDrawerEN,
    ComponentSettingResistanceCard: ComponentSettingResistanceCardEN,
    ComponentEditImmunityDrawer: ComponentEditImmunityDrawerEN,
    ComponentSettingImmunityCard: ComponentSettingImmunityCardEN,
    ComponentSettingEffectCard: ComponentSettingEffectCardEN,
    ComponentSettingPlayerCard: ComponentSettingPlayerCardEN,
    ComponentEditEffectDrawer: ComponentEditEffectDrawerEN,
    ComponentCreateEffectDrawer: ComponentCreateEffectDrawerEN,
    ComponentOpponentsCatalog: ComponentOpponentsCatalogEN,
    ComponentOpponentCard: ComponentOpponentCardEN,
    ComponentCreateEncounterDrawer: ComponentCreateEncounterDrawerEN,
    ComponentCreateOpponentDrawer: ComponentCreateOpponentDrawerEN,
    ComponentCreateOpponentForm: ComponentCreateOpponentFormEN,
    ComponentChapterCard: ComponentChapterCardEN,
    ComponentEditChapterDrawer: ComponentEditChapterDrawerEN,
    ComponentCreateChapterDrawer: ComponentCreateChapterDrawerEN,
    ComponentPlayerCard: ComponentPlayerCardEN,
    ComponentSettingsDialog: ComponentSettingsDialogEN,
    ComponentPlayerCatalog: ComponentPlayerCatalogEN,
    ComponentEditPlayerDrawer: ComponentEditPlayerDrawerEN,
    ComponentEffectsCatalog: ComponentEffectsCatalogEN,
    ComponentCreateResistanceDrawer: ComponentCreateResistanceDrawerEN,
    ComponentImmunitiesCatalog: ComponentImmunitiesCatalogEN,
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
    ComponentEditResistanceDrawer: ComponentEditResistanceDrawerDE,
    ComponentSettingResistanceCard: ComponentSettingResistanceCardDE,
    ComponentEditImmunityDrawer: ComponentEditImmunityDrawerDE,
    ComponentSettingImmunityCard: ComponentSettingImmunityCardDE,
    ComponentSettingEffectCard: ComponentSettingEffectCardDE,
    ComponentSettingPlayerCard: ComponentSettingPlayerCardDE,
    ComponentEditEffectDrawer: ComponentEditEffectDrawerDE,
    ComponentCreateEffectDrawer: ComponentCreateEffectDrawerDE,
    ComponentOpponentsCatalog: ComponentOpponentsCatalogDE,
    ComponentOpponentCard: ComponentOpponentCardDE,
    ComponentCreateEncounterDrawer: ComponentCreateEncounterDrawerDE,
    ComponentCreateOpponentDrawer: ComponentCreateOpponentDrawerDE,
    ComponentCreateOpponentForm: ComponentCreateOpponentFormDE,
    ComponentChapterCard: ComponentChapterCardDE,
    ComponentEditChapterDrawer: ComponentEditChapterDrawerDE,
    ComponentCreateChapterDrawer: ComponentCreateChapterDrawerDE,
    ComponentPlayerCard: ComponentPlayerCardDE,
    ComponentSettingsDialog: ComponentSettingsDialogDE,
    ComponentPlayerCatalog: ComponentPlayerCatalogDE,
    ComponentEditPlayerDrawer: ComponentEditPlayerDrawerDE,
    ComponentEffectsCatalog: ComponentEffectsCatalogDE,
    ComponentCreateResistanceDrawer: ComponentCreateResistanceDrawerDE,
    ComponentImmunitiesCatalog: ComponentImmunitiesCatalogDE,
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
