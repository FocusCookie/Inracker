import {
  DBEncounterNPC,
  DBNPC,
  EncounterNPC,
  NPC,
} from "@/types/npcs";
import { Effect } from "@/types/effect";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import { DBWeakness } from "@/types/weakness";
import {
  execute,
  select,
  createDatabaseError,
} from "./core";
import { getEffectById } from "./effects";
import { getImmunityById } from "./immunities";
import { getResistanceById } from "./resistances";
import { getWeaknessById } from "./weaknesses";
import {
  deleteTokenById,
  createToken,
  getEncounterNPCToken,
} from "./tokens";

//* NPCS (Blueprints)

export const getAllNPCs = async (): Promise<DBNPC[]> =>
  await select<DBNPC[]>("SELECT * FROM npcs");

export const getNPCById = async (
  id: DBNPC["id"],
): Promise<DBNPC> => {
  const result = await select<DBNPC[]>(
    "SELECT * FROM npcs WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`NPC with ID ${id} not found`);
  }

  return result[0];
};

export const getDetailedNPCById = async (
  npcId: NPC["id"],
): Promise<NPC> => {
  const dbNPC = await getNPCById(npcId);
  const {
    details,
    effects: dbEffects,
    health,
    icon,
    id,
    image,
    immunities: dbImmunities,
    labels,
    level,
    max_health,
    name,
    resistances: dbResistances,
    weaknesses: dbWeaknesses,
  } = dbNPC;

  const effectsIds = (JSON.parse(dbEffects || "[]") as number[]).filter((id) => id != null);
  const immunitiesIds = (JSON.parse(dbImmunities || "[]") as number[]).filter((id) => id != null);
  const resistancesIds = (JSON.parse(dbResistances || "[]") as number[]).filter((id) => id != null);
  const weaknessesIds = (JSON.parse(dbWeaknesses || "[]") as number[]).filter((id) => id != null);
  const labelList = JSON.parse(labels || "[]") as string[];

  let effects: Effect[] = [];
  let immunities: DBImmunity[] = [];
  let resistances: DBResistance[] = [];
  let weaknesses: DBWeakness[] = [];

  for (const effectId of effectsIds) {
    try {
      const effect = await getEffectById(effectId);
      effects.push(effect);
    } catch (e) {
      console.warn(`Failed to load effect ${effectId}`, e);
    }
  }

  for (const immunityId of immunitiesIds) {
    try {
      const immunity = await getImmunityById(immunityId);
      immunities.push(immunity);
    } catch (e) {
      console.warn(`Failed to load immunity ${immunityId}`, e);
    }
  }

  for (const resistanceId of resistancesIds) {
    try {
      const resistance = await getResistanceById(resistanceId);
      resistances.push(resistance);
    } catch (e) {
      console.warn(`Failed to load resistance ${resistanceId}`, e);
    }
  }

  for (const weaknessId of weaknessesIds) {
    try {
      const weakness = await getWeaknessById(weaknessId);
      weaknesses.push(weakness);
    } catch (e) {
      console.warn(`Failed to load weakness ${weaknessId}`, e);
    }
  }

  const npc: NPC = {
    details,
    effects,
    health,
    icon,
    id,
    image,
    immunities,
    labels: labelList,
    level,
    max_health,
    name,
    resistances,
    weaknesses,
  };

  return npc;
};

export const getAllDetailedNPCs = async (): Promise<NPC[]> => {
  const npcsRaw = await getAllNPCs();
  const detailedNPCs: NPC[] = [];

  for (const npc of npcsRaw) {
    const detailedNPC = await getDetailedNPCById(npc.id);
    detailedNPCs.push(detailedNPC);
  }

  return detailedNPCs;
};

export const createNPC = async (
  npc: Omit<NPC, "id">,
): Promise<NPC> => {
  const {
    details,
    effects,
    health,
    icon,
    image,
    immunities,
    labels,
    level,
    max_health,
    name,
    resistances,
    weaknesses,
  } = npc;

  const result = await execute(
    "INSERT INTO npcs (details, effects, health, icon, image, immunities, labels, level, max_health, name, resistances, weaknesses) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
    [
      details,
      JSON.stringify(effects.map((e: Effect) => e.id)),
      health,
      icon,
      image,
      JSON.stringify(immunities.map((i: DBImmunity) => i.id)),
      JSON.stringify(labels),
      level,
      max_health,
      name,
      JSON.stringify(resistances.map((r: DBResistance) => r.id)),
      JSON.stringify(weaknesses.map((w: DBWeakness) => w.id)),
    ],
  );

  return getDetailedNPCById(result!.lastInsertId as number);
};

export const updateNPC = async (
  npc: NPC,
): Promise<NPC> => {
  const {
    details,
    effects,
    health,
    icon,
    id,
    image,
    immunities,
    labels,
    level,
    max_health,
    name,
    resistances,
    weaknesses,
  } = npc;

  await execute(
    "UPDATE npcs SET details = $2, effects = $3, health = $4, icon = $5, image = $6, immunities = $7, labels = $8, level = $9, max_health = $10, name = $11, resistances = $12, weaknesses = $13 WHERE id = $1",
    [
      id,
      details,
      JSON.stringify(effects.map((effect: Effect) => effect.id)),
      health,
      icon,
      image,
      JSON.stringify(immunities.map((immunity: DBImmunity) => immunity.id)),
      JSON.stringify(labels),
      level,
      max_health,
      name,
      JSON.stringify(
        resistances.map((resistance: DBResistance) => resistance.id),
      ),
      JSON.stringify(weaknesses.map((weakness: DBWeakness) => weakness.id)),
    ],
  );

  return getDetailedNPCById(id);
};

export const deleteNPCById = async (
  id: NPC["id"],
): Promise<DBNPC> => {
  const deletedNPC = await getNPCById(id);

  await execute("DELETE FROM npcs WHERE id = $1", [id]);

  return deletedNPC;
};

//* ENCOUNTER NPCS (Instances)

export const getEncounterNPCById = async (
  id: DBEncounterNPC["id"],
): Promise<DBEncounterNPC> => {
  const result = await select<DBEncounterNPC[]>(
    "SELECT * FROM encounter_npcs WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Encounter NPC with ID ${id} not found`);
  }

  return result[0];
};

export const getAllEncounterNPCs = async (): Promise<
  DBEncounterNPC[]
> => await select<DBEncounterNPC[]>("SELECT * FROM encounter_npcs");

export const getDetailedEncounterNPCById = async (
  encounterNPCId: DBEncounterNPC["id"],
): Promise<EncounterNPC> => {
  const dbNPC = await getEncounterNPCById(encounterNPCId);
  const {
    details,
    effects: dbEffects,
    health,
    icon,
    id,
    image,
    immunities: dbImmunities,
    labels,
    level,
    max_health,
    name,
    resistances: dbResistances,
    weaknesses: dbWeaknesses,
    blueprint,
  } = dbNPC;

  const effectsIds = (JSON.parse(dbEffects || "[]") as number[]).filter((id) => id != null);
  const immunitiesIds = (JSON.parse(dbImmunities || "[]") as number[]).filter((id) => id != null);
  const resistancesIds = (JSON.parse(dbResistances || "[]") as number[]).filter((id) => id != null);
  const weaknessesIds = (JSON.parse(dbWeaknesses || "[]") as number[]).filter((id) => id != null);
  const labelList = JSON.parse(labels || "[]") as string[];

  let effects: Effect[] = [];
  let immunities: DBImmunity[] = [];
  let resistances: DBResistance[] = [];
  let weaknesses: DBWeakness[] = [];

  for (const effectId of effectsIds) {
    try {
      const buff = await getEffectById(effectId);

      const {
        description,
        duration: catalogDuration,
        durationType,
        icon,
        id,
        name,
        type,
        value,
      } = buff;

      // Try to get remaining duration from active_effects
      const activeEffect = await select<{ remaining_duration: number }[]>(
        "SELECT remaining_duration FROM active_effects WHERE entity_id = $1 AND entity_type = 'npc' AND effect_id = $2",
        [encounterNPCId, effectId],
      );

      const duration = activeEffect.length > 0 ? activeEffect[0].remaining_duration : catalogDuration;

      effects.push({
        description,
        duration,
        durationType,
        icon,
        id,
        name,
        type,
        value,
      });
    } catch (e) {
      console.warn(`Failed to load effect ${effectId}`, e);
    }
  }

  for (const immunityId of immunitiesIds) {
    try {
      const immunity = await getImmunityById(immunityId);
      immunities.push(immunity);
    } catch (e) {
      console.warn(`Failed to load immunity ${immunityId}`, e);
    }
  }

  for (const resistanceId of resistancesIds) {
    try {
      const resistance = await getResistanceById(resistanceId);
      resistances.push(resistance);
    } catch (e) {
      console.warn(`Failed to load resistance ${resistanceId}`, e);
    }
  }

  for (const weaknessId of weaknessesIds) {
    try {
      const weakness = await getWeaknessById(weaknessId);
      weaknesses.push(weakness);
    } catch (e) {
      console.warn(`Failed to load weakness ${weaknessId}`, e);
    }
  }

  const encounterNPC: EncounterNPC = {
    details,
    effects,
    health,
    icon,
    id,
    image,
    immunities,
    labels: labelList,
    level,
    max_health,
    name,
    resistances,
    weaknesses,
    blueprint,
  };

  return encounterNPC;
};

export const getAllEncounterNPCsDetailed = async (): Promise<
  EncounterNPC[]
> => {
  const encounterNPCsRaw = await getAllEncounterNPCs();
  const detailedEncounterNPCs: EncounterNPC[] = [];

  for (const npc of encounterNPCsRaw) {
    const detailedNPC = await getDetailedEncounterNPCById(
      npc.id,
    );
    detailedEncounterNPCs.push(detailedNPC);
  }

  return detailedEncounterNPCs;
};

export const createEncounterNPC = async (
  npc: Omit<EncounterNPC, "id">,
): Promise<EncounterNPC> => {
  const {
    details,
    effects,
    health,
    icon,
    image,
    immunities,
    labels,
    level,
    max_health,
    name,
    resistances,
    weaknesses,
    blueprint
  } = npc;

  const result = await execute(
    "INSERT INTO encounter_npcs (details, effects, health, icon, image, immunities, labels, level, max_health, name, resistances, weaknesses, blueprint) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
    [
      details,
      JSON.stringify(effects.map((e: Effect) => e.id)),
      health,
      icon,
      image,
      JSON.stringify(immunities.map((i: DBImmunity) => i.id)),
      JSON.stringify(labels),
      level,
      max_health,
      name,
      JSON.stringify(resistances.map((r: DBResistance) => r.id)),
      JSON.stringify(weaknesses.map((w: DBWeakness) => w.id)),
      blueprint,
    ],
  );

  return getDetailedEncounterNPCById(result!.lastInsertId as number);
};

export const createEncounterNPCWithToken = async (
  npc: Omit<EncounterNPC, "id">,
  chapterId: number,
): Promise<EncounterNPC> => {
  // 1. Create the Encounter NPC
  const createdNPC = await createEncounterNPC(npc);

  // 2. Create the Token
  await createToken({
    chapter: chapterId,
    type: "npc",
    // @ts-ignore
    entity: createdNPC.id,
    coordinates: { x: 0, y: 0 },
  });

  return createdNPC;
};

export const updateEncounterNPC = async (
  encounterNPC: EncounterNPC,
): Promise<EncounterNPC> => {
  const {
    details,
    effects,
    health,
    icon,
    id,
    image,
    immunities,
    labels,
    level,
    max_health,
    name,
    resistances,
    weaknesses,
    blueprint,
  } = encounterNPC;

  await execute(
    "UPDATE encounter_npcs SET details = $2, effects = $3, health = $4, icon = $5, image = $6, immunities = $7, labels = $8, level = $9, max_health = $10, name = $11, resistances = $12, weaknesses = $13, blueprint = $14 WHERE id = $1",
    [
      id,
      details,
      JSON.stringify(effects.map((effect: Effect) => effect.id)),
      health,
      icon,
      image,
      JSON.stringify(immunities.map((immunity: DBImmunity) => immunity.id)),
      JSON.stringify(labels),
      level,
      max_health,
      name,
      JSON.stringify(
        resistances.map((resistance: DBResistance) => resistance.id),
      ),
      JSON.stringify(weaknesses.map((weakness: DBWeakness) => weakness.id)),
      blueprint,
    ],
  );

  return getDetailedEncounterNPCById(id);
};

export const deleteEncounterNPCById = async (
  id: EncounterNPC["id"],
): Promise<DBEncounterNPC> => {
  const deletedEncounterNPC = await getEncounterNPCById(id);
  const token = await getEncounterNPCToken(id);

  if (token) {
    await deleteTokenById(token.id);
  }

  await execute("DELETE FROM encounter_npcs WHERE id = $1", [id]);

  return deletedEncounterNPC;
};

export const addEffectToEncounterNPC = async (
  npcId: number,
  effectId: number,
): Promise<EncounterNPC> => {
  const { effects } = await getDetailedEncounterNPCById(npcId);
  const isAlreadySet = effects.some((effect: Effect) => effect.id === effectId);
  const update = effects.map((effect: Effect) => effect.id);

  if (!isAlreadySet) {
    update.push(effectId);

    await execute("UPDATE encounter_npcs SET effects = $2 WHERE id = $1", [
      npcId,
      JSON.stringify(update.map((id: number) => id)),
    ]);

    // Populate active_effects
    const catalogEffect = await getEffectById(effectId);
    await execute(
      "INSERT INTO active_effects (id, effect_id, entity_id, entity_type, remaining_duration, duration_type) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        crypto.randomUUID(),
        effectId,
        npcId,
        "npc",
        catalogEffect.duration,
        catalogEffect.durationType,
      ],
    );
  }

  return getDetailedEncounterNPCById(npcId);
};

export const removeEffectFromEncounterNPC = async (
  npcId: number,
  effectId: number,
) => {
  const { effects } = await getDetailedEncounterNPCById(npcId);
  const removedEffect = effects.find((effect: Effect) => effect.id === effectId);
  const update = effects.filter((effect: Effect) => effect.id !== effectId);

  await execute("UPDATE encounter_npcs SET effects = $2 WHERE id = $1", [
    npcId,
    JSON.stringify(update.map((id: number) => id)),
  ]);

  // Remove from active_effects tracking
  await execute(
    "DELETE FROM active_effects WHERE entity_id = $1 AND entity_type = 'npc' AND effect_id = $2",
    [npcId, effectId],
  );

  return removedEffect as Effect;
};

export const npcs = {
  getAllDetailed: async () => {
    return getAllDetailedNPCs();
  },
  create: async (npc: Omit<NPC, "id">) => {
    return createNPC(npc);
  },
  update: async (npc: NPC) => {
    return updateNPC(npc);
  },
  delete: async (id: number) => {
    return deleteNPCById(id);
  },
};

export const encounterNPCs = {
  getAllDetailed: async () => {
    return getAllEncounterNPCsDetailed();
  },
  create: async (npc: Omit<EncounterNPC, "id">) => {
    return createEncounterNPC(npc);
  },
  createWithToken: async (
    npc: Omit<EncounterNPC, "id">,
    chapterId: number,
  ) => {
    return createEncounterNPCWithToken(npc, chapterId);
  },
  update: async (npc: EncounterNPC) => {
    return updateEncounterNPC(npc);
  },
  delete: async (id: number) => {
    return deleteEncounterNPCById(id);
  },
  addEffect: async (npcId: number, effectId: number) => {
    return addEffectToEncounterNPC(npcId, effectId);
  },
  removeEffect: async (npcId: number, effectId: number) => {
    return removeEffectFromEncounterNPC(npcId, effectId);
  },
};
