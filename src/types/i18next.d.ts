import "i18next";
import PageWelcome from "@/translations/en/pages/Welcome.json";
import PagePartySelection from "@/translations/en/pages/PartySelection.json";
import PageChapterSelection from "@/translations/en/pages/ChapterSelection.json";
import ComponentPartyCreateDrawer from "@/translations/en/components/PartyCreateDrawer.json";
import ComponentPartyEditDrawer from "@/translations/en/components/PartyEditDrawer.json";
import ComponentDrawer from "@/translations/en/components/Drawer.json";
import ComponentPartyCard from "@/translations/en/components/PartyCard.json";
import ComponentResistanceCard from "@/translations/en/components/ResistanceCard.json";
import HookUseMutationWithErrorTaost from "@/translations/en/hooks/useMutationWithErrorTaost.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      ComponentPartyCreateDrawer: typeof ComponentPartyCreateDrawer;
      ComponentDrawer: typeof ComponentDrawer;
      ComponentPartyEditDrawer: typeof ComponentPartyEditDrawer;
      ComponentPartyCard: typeof ComponentPartyCard;
      ComponentResistanceCard: typeof ComponentResistanceCard;
      HookUseMutationWithErrorTaost: typeof HookUseMutationWithErrorTaost;
      PageWelcome: typeof PageWelcome;
      PagePartySelection: typeof PagePartySelection;
      PageChapterSelection: typeof PageChapterSelection;
    };
  }
}
