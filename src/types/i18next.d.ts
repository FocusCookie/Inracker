import "i18next";
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
