import { useOverlayStore } from "@/stores/useOverlayStore";
import type { OverlayKind, OverlayMap } from "@/types/overlay";
import CreatePartyDrawer from "@/components/CreatePartyDrawer/CreatePartyDrawer";
import PartyEditDrawer from "../PartyEditDrawer/PartyEditDrawer";
import CreatePlayerDrawer from "../CreatePlayerDrawer/CreatePlayerDrawer";
import CreateImmunityDrawer from "../CreateImmunityDrawer/CreateImmunityDrawer";
import CreateResistanceDrawer from "../CreateResistanceDrawer/CreateResistanceDrawer";
import ImmunitiesCatalog from "../ImmunitiesCatalog/ImmunitiesCatalog";
import ResistancesCatalog from "../ResistancesCatalog/ResistancesCatalog";
import PlayerCatalog from "../PlayerCatalog/PlayerCatalog";
import CreateEffectDrawer from "../CreateEffectDrawer/CreateEffectDrawer";
import EffectsCatalog from "../EffectsCatalog/EffectsCatalog";
import CreateChapterDrawer from "../CreateChapterDrawer/CreateChapterDrawer";
import EditPlayerDrawer from "../EditPlayerDrawer/EditPlayerDrawer";
import EditChapterDrawer from "../EditChapterDrawer/EditChapterDrawer";
import SettingsDrawer from "../SettingsDrawer/SettingsDrawer";
import EditEffectDrawer from "../EditEffectDrawer/EditEffectDrawer";
import EditImmunityDrawer from "../EditImmunityDrawer/EditImmunityDrawer";
import EditResistanceDrawer from "../EditResistanceDrawer/EditResistanceDrawer";
import CreateEncounterDrawer from "../CreateEncounterDrawer/CreateEncounterDrawer";
import CreateOpponentDrawer from "../CreateOpponentDrawer/CreateOpponentDrawer";
import EditEncounterDrawer from "../EditEncounterDrawer/EditEncounterDrawer";
import EncounterSelection from "../EncounterSelection/EncounterSelection";
import OpponentsCatalog from "../OpponentsCatalog/OpponentsCatalog";
import EditOpponentDrawer from "../EditOpponentDrawer/EditOpponentDrawer";

type RuntimeOverlayProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void; // set false to close (plays exit)
  onExitComplete: () => void;
};

type OverlayComponent<K extends OverlayKind> = React.FC<
  OverlayMap[K] & RuntimeOverlayProps
>;

const registry: Record<OverlayKind, OverlayComponent<any>> = {
  "chapter.create": CreateChapterDrawer,
  "chapter.edit": EditChapterDrawer,
  "effect.create": CreateEffectDrawer,
  "effect.catalog": EffectsCatalog,
  "effect.edit": EditEffectDrawer,
  "encounter.create": CreateEncounterDrawer,
  "encounter.edit": EditEncounterDrawer,
  "encounter.selection": EncounterSelection,
  "immunity.edit": EditImmunityDrawer,
  "immunity.create": CreateImmunityDrawer,
  "immunity.catalog": ImmunitiesCatalog,
  "opponent.create": CreateOpponentDrawer,
  "opponent.edit": EditOpponentDrawer,
  "opponent.catalog": OpponentsCatalog,
  "party.create": CreatePartyDrawer,
  "party.edit": PartyEditDrawer,
  "player.create": CreatePlayerDrawer,
  "player.catalog": PlayerCatalog,
  "player.edit": EditPlayerDrawer,
  "resistance.create": CreateResistanceDrawer,
  "resistance.catalog": ResistancesCatalog,
  "resistance.edit": EditResistanceDrawer,
  settings: SettingsDrawer,
};

export function OverlayHost() {
  const stack = useOverlayStore((s) => s.stack);
  const close = useOverlayStore((s) => s.close);
  const remove = useOverlayStore((s) => s.remove);

  return (
    <>
      {stack.map((item) => {
        const Cmp = registry[item.type] as OverlayComponent<typeof item.type>;
        return (
          <Cmp
            key={item.id}
            open={item.open}
            onOpenChange={(o) => {
              if (!o) close(item.id);
            }}
            onExitComplete={() => remove(item.id)}
            {...(item.props as any)}
          />
        );
      })}
    </>
  );
}
