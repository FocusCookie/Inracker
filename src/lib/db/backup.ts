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
    npcs: await select("SELECT * FROM npcs"),
    tokens: await select("SELECT * FROM tokens"),
    encounter_opponents: await select("SELECT * FROM encounter_opponents"),
    encounter_npcs: await select("SELECT * FROM encounter_npcs"),
    combats: await select("SELECT * FROM combats"),
    combat_participants: await select("SELECT * FROM combat_participants"),
    combat_effects: await select("SELECT * FROM combat_effects"),
    active_effects: await select("SELECT * FROM active_effects"),
    settings: await select("SELECT * FROM settings"),
    logs: await select("SELECT * FROM logs"),
    weaknesses: await select("SELECT * FROM weaknesses"),
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
      "npcs",
      "tokens",
      "encounter_opponents",
      "encounter_npcs",
      "combats",
      "combat_participants",
      "combat_effects",
      "active_effects",
      "settings",
      "logs",
      "weaknesses",
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
    if (data.npcs) await insertRows("npcs", data.npcs);
    if (data.tokens) await insertRows("tokens", data.tokens);
    if (data.encounter_opponents) await insertRows("encounter_opponents", data.encounter_opponents);
    if (data.encounter_npcs) await insertRows("encounter_npcs", data.encounter_npcs);
    if (data.combats) await insertRows("combats", data.combats);
    if (data.combat_participants) await insertRows("combat_participants", data.combat_participants);
    if (data.combat_effects) await insertRows("combat_effects", data.combat_effects);
    if (data.active_effects) await insertRows("active_effects", data.active_effects);
    if (data.settings) await insertRows("settings", data.settings);
    if (data.logs) await insertRows("logs", data.logs);
    if (data.weaknesses) await insertRows("weaknesses", data.weaknesses);

  } catch (error) {
    console.error("Import failed", error);
    throw error;
  } finally {
    await execute("PRAGMA foreign_keys = ON;");
  }
};

export const exportCategoryData = async (category: string, ids?: (number | string)[]) => {
  const data: Record<string, any[]> = {};

  const idFilter = (table: string, customIds?: (number | string)[]) => {
    const targetIds = customIds || ids;
    if (!targetIds || targetIds.length === 0) return "";
    const idColumn = table === "settings" ? "key" : "id";
    const quotedIds = targetIds.map((id) => (typeof id === "string" ? `'${id}'` : id));
    return ` WHERE ${idColumn} IN (${quotedIds.join(", ")})`;
  };

  const getDependencies = async (items: any[]) => {
    const effectIds = new Set<number>();
    const immunityIds = new Set<number>();
    const resistanceIds = new Set<number>();
    const weaknessIds = new Set<number>();

    items.forEach(item => {
        if (item.effects) {
            try {
                const ids = JSON.parse(item.effects);
                if (Array.isArray(ids)) ids.forEach(id => effectIds.add(id));
            } catch(e) {}
        }
        if (item.immunities) {
            try {
                const ids = JSON.parse(item.immunities);
                if (Array.isArray(ids)) ids.forEach(id => immunityIds.add(id));
            } catch(e) {}
        }
        if (item.resistances) {
            try {
                const ids = JSON.parse(item.resistances);
                if (Array.isArray(ids)) ids.forEach(id => resistanceIds.add(id));
            } catch(e) {}
        }
        if (item.weaknesses) {
            try {
                const ids = JSON.parse(item.weaknesses);
                if (Array.isArray(ids)) ids.forEach(id => weaknessIds.add(id));
            } catch(e) {}
        }
    });

    if (effectIds.size > 0) {
        data.effects = await select(`SELECT * FROM effects WHERE id IN (${Array.from(effectIds).join(", ")})`);
    }
    if (immunityIds.size > 0) {
        data.immunities = await select(`SELECT * FROM immunities WHERE id IN (${Array.from(immunityIds).join(", ")})`);
    }
    if (resistanceIds.size > 0) {
        data.resistances = await select(`SELECT * FROM resistances WHERE id IN (${Array.from(resistanceIds).join(", ")})`);
    }
    if (weaknessIds.size > 0) {
        data.weaknesses = await select(`SELECT * FROM weaknesses WHERE id IN (${Array.from(weaknessIds).join(", ")})`);
    }
  };

  switch (category) {
    case "players":
      data.players = await select(`SELECT * FROM players${idFilter("players")}`);
      await getDependencies(data.players);
      break;
    case "opponents":
      data.opponents = await select(`SELECT * FROM opponents${idFilter("opponents")}`);
      await getDependencies(data.opponents);
      break;
    case "npcs":
      data.npcs = await select(`SELECT * FROM npcs${idFilter("npcs")}`);
      await getDependencies(data.npcs);
      break;
    case "effects":
      data.effects = await select(`SELECT * FROM effects${idFilter("effects")}`);
      break;
    case "immunities":
      data.immunities = await select(`SELECT * FROM immunities${idFilter("immunities")}`);
      break;
    case "resistances":
      data.resistances = await select(`SELECT * FROM resistances${idFilter("resistances")}`);
      break;
    case "weaknesses":
      data.weaknesses = await select(`SELECT * FROM weaknesses${idFilter("weaknesses")}`);
      break;
    case "chapters": {
      const chapters = await select<any[]>(`SELECT * FROM chapters${idFilter("chapters")}`);
      data.chapters = chapters;

      const chapterIds = chapters.map((c) => c.id);
      if (chapterIds.length > 0) {
        const idList = chapterIds.join(", ");
        
        // Get tokens for these chapters
        const tokens = await select<any[]>(`SELECT * FROM tokens WHERE chapter IN (${idList})`);
        data.tokens = tokens;

        const allEncounterIds = new Set<number>();
        chapters.forEach(c => {
            if (c.encounters) {
                try {
                    const ids = JSON.parse(c.encounters);
                    if (Array.isArray(ids)) ids.forEach(id => allEncounterIds.add(id));
                } catch(e) {}
            }
        });

        if (allEncounterIds.size > 0) {
            const encIdList = Array.from(allEncounterIds).join(", ");
            const encounters = await select<any[]>(`SELECT * FROM encounters WHERE id IN (${encIdList})`);
            data.encounters = encounters;

            // Get encounter_opponents and opponents from encounters
            const encounterOpponentIds = new Set<number>();
            encounters.forEach(e => {
                if (e.opponents) {
                    try {
                        const ids = JSON.parse(e.opponents);
                        if (Array.isArray(ids)) ids.forEach(id => encounterOpponentIds.add(id));
                    } catch(e) {}
                }
            });

            // Also check tokens for encounter_opponents
            tokens.forEach(t => {
                if (t.type === 'opponent') {
                    encounterOpponentIds.add(t.entity);
                }
            });

            if (encounterOpponentIds.size > 0) {
                const encOppIdList = Array.from(encounterOpponentIds).join(", ");
                const encounterOpponents = await select<any[]>(`SELECT * FROM encounter_opponents WHERE id IN (${encOppIdList})`);
                data.encounter_opponents = encounterOpponents;

                // Now get the templates (opponents) from blueprints
                const blueprintIds = new Set<number>();
                encounterOpponents.forEach(eo => {
                    if (eo.blueprint) blueprintIds.add(eo.blueprint);
                });

                if (blueprintIds.size > 0) {
                    const blueprintIdList = Array.from(blueprintIds).join(", ");
                    data.opponents = await select(`SELECT * FROM opponents WHERE id IN (${blueprintIdList})`);
                    
                    // Also get dependencies for these opponents and encounter_opponents
                    const allEntities = [...encounterOpponents, ...(data.opponents || [])];
                    await getDependencies(allEntities);
                } else {
                    await getDependencies(encounterOpponents);
                }
            }

            const encounterNpcIds = new Set<number>();
            tokens.forEach(t => {
                if (t.type === 'npc') {
                    encounterNpcIds.add(t.entity);
                }
            });

            if (encounterNpcIds.size > 0) {
                const encNpcIdList = Array.from(encounterNpcIds).join(", ");
                const encounterNpcs = await select<any[]>(`SELECT * FROM encounter_npcs WHERE id IN (${encNpcIdList})`);
                data.encounter_npcs = encounterNpcs;

                const blueprintIds = new Set<number>();
                encounterNpcs.forEach(en => {
                    if (en.blueprint) blueprintIds.add(en.blueprint);
                });

                if (blueprintIds.size > 0) {
                    const blueprintIdList = Array.from(blueprintIds).join(", ");
                    data.npcs = await select(`SELECT * FROM npcs WHERE id IN (${blueprintIdList})`);
                    
                    const allEntities = [...encounterNpcs, ...(data.npcs || [])];
                    await getDependencies(allEntities);
                } else {
                    await getDependencies(encounterNpcs);
                }
            }
        }
      }
      break;
    }
    default:
      throw new Error(`Unknown category: ${category}`);
  }

  return data;
};

export const importCategoryData = async (data: any, mode: "restore" | "merge") => {
  const conflicts: Record<string, any[]> = {};
  await execute("PRAGMA foreign_keys = OFF;");

  try {
    const tables = Object.keys(data);

    for (const table of tables) {
      const rows = data[table];
      if (!rows || rows.length === 0) continue;

      if (mode === "restore") {
        // For partial restore, we might not want to DELETE ALL from the table, 
        // but maybe just the ones we are importing? 
        // User asked for "restore (override) and merge". 
        // If it's a category restore, it probably means override existing IDs.
        const idColumn = table === "settings" ? "key" : "id";
        const ids = rows.map((r: any) => (typeof r[idColumn] === "string" ? `'${r[idColumn]}'` : r[idColumn]));
        if (ids.length > 0) {
            await execute(`DELETE FROM ${table} WHERE ${idColumn} IN (${ids.join(", ")})`);
        }
      }

      const idColumn = table === "settings" ? "key" : "id";
      const res = await select<{id: string | number}[]>(`SELECT ${idColumn} as id FROM ${table}`);
      const existingIds = new Set(res.map(r => r.id));

      const toInsert = [];
      const collisionRows = [];

      for (const row of rows) {
        const id = row[idColumn];
        if (mode === "merge" && existingIds.has(id)) {
          collisionRows.push(row);
        } else {
          toInsert.push(row);
        }
      }

      if (collisionRows.length > 0) {
        conflicts[table] = collisionRows;
      }

      if (toInsert.length > 0) {
        const keys = Object.keys(toInsert[0]);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
        const columns = keys.join(", ");
        const sql = `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`;

        for (const row of toInsert) {
          const values = Object.values(row);
          await execute(sql, values);
        }
      }
    }
  } catch (error) {
    console.error("Category import failed", error);
    throw error;
  } finally {
    await execute("PRAGMA foreign_keys = ON;");
  }

  return conflicts;
};

export const mergeAllData = async (data: any) => {
  const conflicts: Record<string, any[]> = {};
  
  const tables = [
      "parties", "players", "effects", "immunities", "resistances",
      "chapters", "encounters", "opponents", "npcs", "tokens",
      "encounter_opponents", "encounter_npcs", "combats", "combat_participants",
      "combat_effects", "active_effects", "settings", "logs", "weaknesses"
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
