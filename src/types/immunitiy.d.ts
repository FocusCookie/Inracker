export type DBImmunity = {
  readonly id: number;
  name: string;
  icon: string;
  description: string;
};

export type Immunity = Omit<DBImmunity, "id">;
