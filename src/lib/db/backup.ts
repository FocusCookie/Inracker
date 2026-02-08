import { select, execute } from "./core";

export const exportAllData = async () => {
  return {
    parties: await select("SELECT * FROM parties"),
    players: await select("SELECT * FROM players"),
    effects: await select("SELECT * FROM effects"),
    immunities: await select("SELECT * FROM immunities"),
    resistances: await select("SELECT * FROM resistances"),
    chapters: await select("SELECT * FROM chapters"),
    encounters: await select("SELECT * FROM encounters"),
    opponents: await select("SELECT * FROM opponents"),
    tokens: await select("SELECT * FROM tokens"),
    encounter_opponents: await select("SELECT * FROM encounter_opponents"),
    combats: await select("SELECT * FROM combats"),
    combat_participants: await select("SELECT * FROM combat_participants"),
    combat_effects: await select("SELECT * FROM combat_effects"),
    active_effects: await select("SELECT * FROM active_effects"),
    settings: await select("SELECT * FROM settings"),
    logs: await select("SELECT * FROM logs"),
  };
};

export const importAllData = async (data: any) => {
  // Disable foreign keys to avoid constraints issues during clear
  await execute("PRAGMA foreign_keys = OFF;");

  try {
    const tables = [
      "parties",
      "players",
      "effects",
      "immunities",
      "resistances",
      "chapters",
      "encounters",
      "opponents",
      "tokens",
      "encounter_opponents",
      "combats",
      "combat_participants",
      "combat_effects",
      "active_effects",
      "settings",
      "logs",
    ];

    // Clear all tables
    for (const table of tables) {
      await execute(`DELETE FROM ${table}`);
      // Try to reset auto increment if it exists in sqlite_sequence
      try {
        await execute(`DELETE FROM sqlite_sequence WHERE name = '${table}'`);
      } catch (e) {
        // Ignore if sqlite_sequence update fails (might not exist or other issue)
      }
    }

    // Helper to insert rows
    const insertRows = async (table: string, rows: any[]) => {
      if (!rows || rows.length === 0) return;
      
      // Assume all rows have same structure
      const keys = Object.keys(rows[0]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
      const columns = keys.join(", ");
      const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

      for (const row of rows) {
        const values = Object.values(row);
        await execute(sql, values);
      }
    };

    if (data.parties) await insertRows("parties", data.parties);
    if (data.players) await insertRows("players", data.players);
    if (data.effects) await insertRows("effects", data.effects);
    if (data.immunities) await insertRows("immunities", data.immunities);
    if (data.resistances) await insertRows("resistances", data.resistances);
    if (data.chapters) await insertRows("chapters", data.chapters);
    if (data.encounters) await insertRows("encounters", data.encounters);
    if (data.opponents) await insertRows("opponents", data.opponents);
    if (data.tokens) await insertRows("tokens", data.tokens);
    if (data.encounter_opponents) await insertRows("encounter_opponents", data.encounter_opponents);
    if (data.combats) await insertRows("combats", data.combats);
    if (data.combat_participants) await insertRows("combat_participants", data.combat_participants);
    if (data.combat_effects) await insertRows("combat_effects", data.combat_effects);
    if (data.active_effects) await insertRows("active_effects", data.active_effects);
    if (data.settings) await insertRows("settings", data.settings);
    if (data.logs) await insertRows("logs", data.logs);

  } catch (error) {
    console.error("Import failed", error);
    throw error;
  } finally {
    await execute("PRAGMA foreign_keys = ON;");
  }
};

export const mergeAllData = async (data: any) => {
  const conflicts: Record<string, any[]> = {};
  
  const tables = [
      "parties", "players", "effects", "immunities", "resistances",
      "chapters", "encounters", "opponents", "tokens",
      "encounter_opponents", "combats", "combat_participants",
      "combat_effects", "active_effects", "settings", "logs"
    ];

  // Helper to insert rows
  const insertRows = async (table: string, rows: any[]) => {
      if (!rows || rows.length === 0) return;
      
      const keys = Object.keys(rows[0]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
      const columns = keys.join(", ");
      const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

      for (const row of rows) {
        const values = Object.values(row);
        await execute(sql, values);
      }
    };

  for (const table of tables) {
    if (!data[table]) continue;

    let existingIds: Set<string | number>;
    
    if (table === 'settings') {
        const res = await select<{key: string}[]>("SELECT key FROM settings");
        existingIds = new Set(res.map(r => r.key));
    } else {
        const res = await select<{id: string | number}[]>(`SELECT id FROM ${table}`);
        existingIds = new Set(res.map(r => r.id));
    }

    const toInsert = [];
    const collisionRows = [];

    for (const row of data[table]) {
        const id = table === 'settings' ? row.key : row.id;
        if (existingIds.has(id)) {
            collisionRows.push(row);
        } else {
            toInsert.push(row);
        }
    }

    if (collisionRows.length > 0) {
        conflicts[table] = collisionRows;
    }

    if (toInsert.length > 0) {
        await insertRows(table, toInsert);
    }
  }

  return conflicts;
};
