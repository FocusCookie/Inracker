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

type RuntimeOverlayProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void; // set false to close (plays exit)
  onExitComplete: () => void;
};

type OverlayComponent<K extends OverlayKind> = React.FC<
  OverlayMap[K] & RuntimeOverlayProps
>;

const registry: Record<OverlayKind, OverlayComponent<any>> = {
  "effect.create": CreateEffectDrawer,
  "effect.catalog": EffectsCatalog,
  "party.create": CreatePartyDrawer,
  "party.edit": PartyEditDrawer,
  "player.create": CreatePlayerDrawer,
  "player.catalog": PlayerCatalog,
  "immunity.create": CreateImmunityDrawer,
  "resistance.create": CreateResistanceDrawer,
  "immunity.catalog": ImmunitiesCatalog,
  "resistance.catalog": ResistancesCatalog,
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
