import type { Party } from "@/types/party";

export type CancelReason = "cancel" | "dismissed";

export type OverlaySuccessMap = {
  "party.create": { partyId: number };
  // extend as you add more overlay kinds
};

export type OverlayMap = {
  "party.create": {
    onCreate: (party: Omit<Party, "id">) => Promise<{ id: number }>;
    onComplete: (r: OverlaySuccessMap["party.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };

  // add other overlay kinds with the same pattern as you refactor them
};

export type OverlayKind = keyof OverlayMap;
