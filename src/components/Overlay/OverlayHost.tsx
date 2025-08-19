import { useOverlayStore } from "@/stores/useOverlayStore";
import type { OverlayKind, OverlayMap } from "@/types/overlay";
import CreatePartyDrawer from "@/components/CreatePartyDrawer/CreatePartyDrawer";

type RuntimeOverlayProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void; // set false to close (plays exit)
  onExitComplete: () => void;
};

type OverlayComponent<K extends OverlayKind> = React.FC<
  OverlayMap[K] & RuntimeOverlayProps
>;

const registry: Record<OverlayKind, OverlayComponent<any>> = {
  "party.create": CreatePartyDrawer,
  // "player.create": PlayerCreateDrawer,
  // "player.edit": PlayerEditDrawer,
};

export function OverlayHost() {
  const stack = useOverlayStore((s) => s.stack);
  const close = useOverlayStore((s) => s.close);
  const remove = useOverlayStore((s) => s.remove);

  return (
    <>
      {stack.map((item, i) => {
        const Cmp = registry[item.type] as OverlayComponent<typeof item.type>;
        const z = 1000 + i;
        return (
          <div key={item.id} style={{ position: "fixed", inset: 0, zIndex: z }}>
            <Cmp
              {...(item.props as any)} // your domain props (e.g., onCreate)
              open={item.open}
              onOpenChange={(o) => {
                if (!o) close(item.id);
              }}
              onExitComplete={() => remove(item.id)}
            />
          </div>
        );
      })}
    </>
  );
}
