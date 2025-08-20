import type { Party } from "@/types/party";

export type CancelReason = "cancel" | "dismissed";

export type OverlaySuccessMap = {
  "party.create": { partyId: Party["id"] };
  "party.edit": { partyId: Party["id"] };
};

export type OverlayMap = {
  "party.create": {
    onCreate: (party: Omit<Party, "id">) => Promise<{ id: number }>;
    onComplete: (r: OverlaySuccessMap["party.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "party.edit": {
    party: Party;
    onEdit: (party: Party) => Promise<Party>;
    onComplete: (r: OverlaySuccessMap["party.edit"]) => void;
    onCancel?: (reason: CancelReason) => void;
    onDelete: (partyId: Party["id"]) => Promise<Party["id"]>;
  };

  // add other overlay kinds with the same pattern as you refactor them
};

export type OverlayKind = keyof OverlayMap;
