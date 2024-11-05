export type Party = {
  readonly id: number;
  name: string;
  icon: string;
  description: string;
  /**
   * Player IDs
   */
  players: number[];
  state: "finished" | "ongoing" | "draft";
};
