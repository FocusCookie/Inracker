import { Party } from "@/types/party";
import { Player } from "@/types/player";
import TauriDatabase from "@tauri-apps/plugin-sql";

const environment = import.meta.env.VITE_ENV;

class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Sub Database interfaces
interface IPlayerRepository {
  getAll(): Promise<Player[]>;
  getById(id: number): Promise<Player>;
  create(player: Omit<Player, "id">): Promise<Player>;
}

interface IPartyRepository {
  getAll(): Promise<Party[]>;
  getById(id: number): Promise<Party>;
  create(party: Omit<Party, "id">): Promise<Party>;
}

// Database sub reposetories
class PlayerRepository implements IPlayerRepository {
  constructor(private db: TauriDatabase) {}

  async getAll(): Promise<Player[]> {
    const result = await this.db.select<Player[]>("SELECT * FROM players");

    return result;
  }

  async getById(id: number): Promise<Player> {
    const result = await this.db.select<Player[]>(
      "SELECT * FROM players WHERE id = $1",
      [id],
    );

    if (!result.length) {
      throw new DatabaseError(`Player with ID ${id} not found`);
    }

    return result[0];
  }

  async create(player: Omit<Player, "id">): Promise<Player> {
    const result = await this.db.execute(
      "INSERT INTO players (name) VALUES ($1) RETURNING *",
      [player.name],
    );
    const createdPlayer = await this.getById(result.lastInsertId);

    return createdPlayer;
  }
}

class PartyRepository implements IPartyRepository {
  constructor(private db: TauriDatabase) {}

  async getAll(): Promise<Party[]> {
    const result = await this.db.select<Party[]>("SELECT * FROM parties");
    return result;
  }

  async getById(id: number): Promise<Party> {
    const result = await this.db.select<Party[]>(
      "SELECT * FROM parties WHERE id = $1",
      [id],
    );

    if (!result.length) {
      throw new DatabaseError(`Party with ID ${id} not found`);
    }

    return result[0];
  }

  async create(party: Omit<Party, "id">): Promise<Party> {
    const { name, icon, description, players, state } = party;

    const result = await this.db.execute(
      "INSERT INTO parties (name, icon, description, players, state) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, icon, description, JSON.stringify(players), state],
    );
    const createdParty = await this.getById(result.lastInsertId);

    return createdParty;
  }
}

export class Database {
  private static instance: TauriDatabase | null = null;
  private static _players: PlayerRepository | null = null;
  private static _party: PartyRepository | null = null;

  private constructor() {}

  /**
   * Gets the players repository
   */
  public static get players(): PlayerRepository {
    if (!this._players || !this.instance) {
      throw new DatabaseError("Database not connected");
    }
    return this._players;
  }

  /**
   * Gets the party repository
   */
  public static get party(): PartyRepository {
    if (!this._party || !this.instance) {
      throw new DatabaseError("Database not connected");
    }
    return this._party;
  }

  public static async connect(): Promise<void> {
    try {
      if (this.instance) return;

      this.instance = await TauriDatabase.load(
        `sqlite:${environment ?? ""}.db`,
      );

      this._players = new PlayerRepository(this.instance);
      this._party = new PartyRepository(this.instance);
    } catch (error) {
      throw new DatabaseError("Error establishing database connection", error);
    }
  }

  public static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.close?.();
      this.instance = null;
      this._players = null;
      this._party = null;
    }
  }
}

export default Database;
