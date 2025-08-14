import "i18next";
import ComponentEditResistanceDrawer from "@/translations/en/component/EditResistanceDrawer.json";
import ComponentSettingResistanceCard from "@/translations/en/component/SettingResistanceCard.json";
import ComponentEditImmunityDrawer from "@/translations/en/component/EditImmunityDrawer.json";
import ComponentSettingImmunityCard from "@/translations/en/component/SettingImmunityCard.json";
import ComponentSettingEffectCard from "@/translations/en/component/SettingEffectCard.json";
import ComponentSettingPlayerCard from "@/translations/en/component/SettingPlayerCard.json";
import ComponentEditEffectDrawer from "@/translations/en/component/EditEffectDrawer.json";
import ComponentCreateEffectDrawer from "@/translations/en/component/CreateEffectDrawer.json";
import ComponentOpponentsCatalog from "@/translations/en/component/OpponentsCatalog.json";
import ComponentOpponentCard from "@/translations/en/component/OpponentCard.json";
import ComponentCreateEncounterDrawer from "@/translations/en/component/CreateEncounterDrawer.json";
import ComponentCreateOpponentDrawer from "@/translations/en/component/CreateOpponentDrawer.json";
import ComponentCreateOpponentForm from "@/translations/en/component/CreateOpponentForm.json";
import ComponentChapterCard from "@/translations/en/component/ChapterCard.json";
import Component from "@/translations/en/component/.json";
import ComponentEditChapterDrawer from "@/translations/en/component/EditChapterDrawer.json";
import ComponentCreateChapterDrawer from "@/translations/en/component/CreateChapterDrawer.json";
import ComponentPlayerCard from "@/translations/en/component/PlayerCard.json";
import ComponentSettingsDialog from "@/translations/en/component/SettingsDialog.json";
import ComponentPlayerCatalog from "@/translations/en/component/PlayerCatalog.json";
import ComponentEditPlayerDrawer from "@/translations/en/component/EditPlayerDrawer.json";
import ComponentComponentEditPlayerDrawer from "@/translations/en/component/ComponentEditPlayerDrawer.json";
import ComponentEffectsCatalog from "@/translations/en/component/EffectsCatalog.json";
import ComponentCreateResistanceDrawer from "@/translations/en/component/CreateResistanceDrawer.json";
import ComponentImmunitiesCatalog from "@/translations/en/component/ImmunitiesCatalog.json";
import ComponentResistanceCatalog from "@/translations/en/component/ResistanceCatalog.json";
import PageWelcome from "@/translations/en/pages/Welcome.json";
import PagePartySelection from "@/translations/en/pages/PartySelection.json";
import PageChapterSelection from "@/translations/en/pages/ChapterSelection.json";
import ComponentPartyCreateDrawer from "@/translations/en/components/PartyCreateDrawer.json";
import ComponentPartyEditDrawer from "@/translations/en/components/PartyEditDrawer.json";
import ComponentDrawer from "@/translations/en/components/Drawer.json";
import ComponentPartyCard from "@/translations/en/components/PartyCard.json";
import ComponentResistanceCard from "@/translations/en/components/ResistanceCard.json";
import ComponentCreateImmunityDrawer from "@/translations/en/components/CreateImmunityDrawer.json";
import ComponentCreatePlayerDrawer from "@/translations/en/components/CreatePlayerDrawer.json";
import ComponentCatalog from "@/translations/en/components/Catalog.json";
import HookUseMutationWithErrorTaost from "@/translations/en/hooks/useMutationWithErrorTaost.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      // hygen-components - DO NOT DELETE THIS LINE
      ComponentEditResistanceDrawer: typeof ComponentEditResistanceDrawer;
      ComponentSettingResistanceCard: typeof ComponentSettingResistanceCard;
      ComponentEditImmunityDrawer: typeof ComponentEditImmunityDrawer;
      ComponentSettingImmunityCard: typeof ComponentSettingImmunityCard;
      ComponentSettingEffectCard: typeof ComponentSettingEffectCard;
      ComponentSettingPlayerCard: typeof ComponentSettingPlayerCard;
      ComponentEditEffectDrawer: typeof ComponentEditEffectDrawer;
      ComponentCreateEffectDrawer: typeof ComponentCreateEffectDrawer;
      ComponentOpponentsCatalog: typeof ComponentOpponentsCatalog;
      ComponentOpponentCard: typeof ComponentOpponentCard;
      ComponentCreateEncounterDrawer: typeof ComponentCreateEncounterDrawer;
      ComponentCreateOpponentDrawer: typeof ComponentCreateOpponentDrawer;
      ComponentCreateOpponentForm: typeof ComponentCreateOpponentForm;
      ComponentChapterCard: typeof ComponentChapterCard;
      ComponentEditChapterDrawer: typeof ComponentEditChapterDrawer;
      ComponentCreateChapterDrawer: typeof ComponentCreateChapterDrawer;
      ComponentPlayerCard: typeof ComponentPlayerCard;
      ComponentSettingsDialog: typeof ComponentSettingsDialog;
      ComponentPlayerCatalog: typeof ComponentPlayerCatalog;
      ComponentEditPlayerDrawer: typeof ComponentEditPlayerDrawer;
      ComponentComponentEditPlayerDrawer: typeof ComponentComponentEditPlayerDrawer;
      ComponentEffectsCatalog: typeof ComponentEffectsCatalog;
      ComponentCreateResistanceDrawer: typeof ComponentCreateResistanceDrawer;
      ComponentImmunitiesCatalog: typeof ComponentImmunitiesCatalog;
      ComponentResistanceCatalog: typeof ComponentResistanceCatalog;
      ComponentPartyCreateDrawer: typeof ComponentPartyCreateDrawer;
      ComponentDrawer: typeof ComponentDrawer;
      ComponentPartyEditDrawer: typeof ComponentPartyEditDrawer;
      ComponentPartyCard: typeof ComponentPartyCard;
      ComponentResistanceCard: typeof ComponentResistanceCard;
      ComponentCreateImmunityDrawer: typeof ComponentCreateImmunityDrawer;
      ComponentCreatePlayerDrawer: typeof ComponentCreatePlayerDrawer;
      ComponentCatalog: typeof ComponentCatalog;

      // hygen-hooks - DO NOT DELETE THIS LINE
      HookUseMutationWithErrorTaost: typeof HookUseMutationWithErrorTaost;

      // hygen-pages - DO NOT DELETE THIS LINE
      PageWelcome: typeof PageWelcome;
      PagePartySelection: typeof PagePartySelection;
      PageChapterSelection: typeof PageChapterSelection;
    };
  }
}
