import {
  DBEncounterOpponent,
  DBOpponent,
  EncounterOpponent,
  Opponent,
} from "@/types/opponents";
import { Effect } from "@/types/effect";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import { DBWeakness } from "@/types/weakness";
import {
  execute,
  select,
  createDatabaseError,
} from "./core"; // Updated import
import { getEffectById } from "./effects";
import { getImmunityById } from "./immunities";
import { getResistanceById } from "./resistances";
import { getWeaknessById } from "./weaknesses";
import {
  deleteTokenById,
  createToken,
  getEncounterOpponentToken,
} from "./tokens";

//* OPPONENTS (Blueprints)

export const getAllOpponents = async (): Promise<DBOpponent[]> =>
  await select<DBOpponent[]>("SELECT * FROM opponents");

export const getOpponentById = async (
  id: DBOpponent["id"],
): Promise<DBOpponent> => {
  const result = await select<DBOpponent[]>(
    "SELECT * FROM opponents WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Opponent with ID ${id} not found`);
  }

  return result[0];
};

export const getDetailedOpponentById = async (
  opponentId: Opponent["id"],
): Promise<Opponent> => {
  const dbOpponent = await getOpponentById(opponentId);
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
  } = dbOpponent;

  const effectsIds = (JSON.parse(dbEffects) as number[]).filter((id) => id != null);
  const immunitiesIds = (JSON.parse(dbImmunities) as number[]).filter((id) => id != null);
  const resistancesIds = (JSON.parse(dbResistances) as number[]).filter((id) => id != null);
  const weaknessesIds = (JSON.parse(dbWeaknesses || "[]") as number[]).filter((id) => id != null);
  const labelList = JSON.parse(labels) as string[];

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

  const opponent: Opponent = {
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

  return opponent;
};

export const getAllDetailedOpponents = async (): Promise<Opponent[]> => {
  const opponentsRaw = await getAllOpponents();
  const detailedOpponents: Opponent[] = [];

  for (const opponent of opponentsRaw) {
    const detailedOpponent = await getDetailedOpponentById(opponent.id);
    detailedOpponents.push(detailedOpponent);
  }

  return detailedOpponents as unknown as Opponent[];
};

export const createOpponent = async (
  opponent: Omit<Opponent, "id">,
): Promise<Opponent> => {
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
  } = opponent;

  const result = await execute(
    "INSERT INTO opponents (details, effects, health, icon, image, immunities, labels, level, max_health, name, resistances, weaknesses) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
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

  return getDetailedOpponentById(result!.lastInsertId as number);
};

export const updateOpponent = async (
  opponent: Opponent,
): Promise<Opponent> => {
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
  } = opponent;

  await execute(
    "UPDATE opponents SET details = $2, effects = $3, health = $4, icon = $5, image = $6, immunities = $7, labels = $8, level = $9, max_health = $10, name = $11, resistances = $12, weaknesses = $13 WHERE id = $1",
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

  return getDetailedOpponentById(id);
};

export const deleteOpponentById = async (
  id: Opponent["id"],
): Promise<DBOpponent> => {
  const deletedOpponent = await getOpponentById(id);

  await execute("DELETE FROM opponents WHERE id = $1", [id]);

  return deletedOpponent;
};

//* ENCOUNTER OPPONENTS (Instances)

export const getEncounterOpponentById = async (
  id: DBEncounterOpponent["id"],
): Promise<DBEncounterOpponent> => {
  const result = await select<DBEncounterOpponent[]>(
    "SELECT * FROM encounter_opponents WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Encounter Opponent with ID ${id} not found`);
  }

  return result[0];
};

export const getAllEncounterOpponents = async (): Promise<
  DBEncounterOpponent[]
> => await select<DBEncounterOpponent[]>("SELECT * FROM encounter_opponents");

export const getDetailedEncounterOpponentById = async (
  encounterOpponentId: DBEncounterOpponent["id"],
): Promise<EncounterOpponent> => {
  const dbOpponent = await getEncounterOpponentById(encounterOpponentId);
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
  } = dbOpponent;

  const effectsIds = (JSON.parse(dbEffects) as number[]).filter((id) => id != null);
  const immunitiesIds = (JSON.parse(dbImmunities) as number[]).filter((id) => id != null);
  const resistancesIds = (JSON.parse(dbResistances) as number[]).filter((id) => id != null);
  const weaknessesIds = (JSON.parse(dbWeaknesses || "[]") as number[]).filter((id) => id != null);
  const labelList = JSON.parse(labels) as string[];

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
        "SELECT remaining_duration FROM active_effects WHERE entity_id = $1 AND entity_type = 'opponent' AND effect_id = $2",
        [encounterOpponentId, effectId],
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

  const encounterOpponent: EncounterOpponent = {
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

  return encounterOpponent;
};

export const getAllEncounterOpponentsDetailed = async (): Promise<
  EncounterOpponent[]
> => {
  const encounterOpponentsRaw = await getAllEncounterOpponents();
  const detailedEncounterOpponents: EncounterOpponent[] = [];

  for (const opponent of encounterOpponentsRaw) {
    const detailedOpponent = await getDetailedEncounterOpponentById(
      opponent.id,
    );
    detailedEncounterOpponents.push(detailedOpponent);
  }

  return detailedEncounterOpponents; // Return the array of detailed encounter opponents
};

export const getDetailedEncounterOpponentsByIds = async (
  ids: Array<DBEncounterOpponent["id"]>,
): Promise<EncounterOpponent[]> => {
  const promises = ids.map((id) => getDetailedEncounterOpponentById(id));
  const settled = await Promise.allSettled(promises);

  const detailed = settled
    .filter(
      (s): s is PromiseFulfilledResult<EncounterOpponent> =>
        s.status === "fulfilled",
    )
    .map((s) => s.value);

  return detailed;
};

export const createEncounterOpponent = async (
  opponent: Omit<EncounterOpponent, "id">,
): Promise<EncounterOpponent> => {
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
  } = opponent;

  const blueprint = opponent.blueprint;

  const result = await execute(
    "INSERT INTO encounter_opponents (details, effects, health, icon, image, immunities, labels, level, max_health, name, resistances, weaknesses, blueprint) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
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

  return getDetailedEncounterOpponentById(result!.lastInsertId as number);
};

export const createEncounterOpponents = async (
  opponents: Array<Omit<EncounterOpponent, "id">>,
): Promise<EncounterOpponent[]> => {
  const createOpponentPromises = opponents.map((opponent) => {
    return createEncounterOpponent(opponent);
  });

  const createOpponentsResult = await Promise.allSettled(
    createOpponentPromises,
  );
  const createdOpponents = createOpponentsResult
    .filter(
      (s): s is PromiseFulfilledResult<DBEncounterOpponent> =>
        s.status === "fulfilled",
    )
    .map((s) => s.value);

  return createdOpponents;
};

// NEW FUNCTION: Atomic creation of Opponent + Token
export const createEncounterOpponentWithToken = async (
  opponent: Omit<EncounterOpponent, "id">,
  chapterId: number,
): Promise<EncounterOpponent> => {
  // 1. Create the Encounter Opponent
  const createdOpponent = await createEncounterOpponent(opponent);

  // 2. Create the Token
  // Defaulting to 0,0 or a safe spawn position.
  await createToken({
    chapter: chapterId,
    type: "opponent",
    // @ts-ignore
    entity: createdOpponent.id, // encounter_opponents id
    coordinates: { x: 0, y: 0 },
  });

  return createdOpponent;
};

export const updateEncounterOpponent = async (
  encounterOpponent: EncounterOpponent,
): Promise<EncounterOpponent> => {
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
  } = encounterOpponent;

  await execute(
    "UPDATE encounter_opponents SET details = $2, effects = $3, health = $4, icon = $5, image = $6, immunities = $7, labels = $8, level = $9, max_health = $10, name = $11, resistances = $12, weaknesses = $13, blueprint = $14 WHERE id = $1",
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

  return getDetailedEncounterOpponentById(id);
};

export const deleteEncounterOpponentById = async (
  id: EncounterOpponent["id"],
): Promise<DBEncounterOpponent> => {
  const deletedEncounterOpponent = await getEncounterOpponentById(id);
  const token = await getEncounterOpponentToken(id);

  if (token) {
    await deleteTokenById(token.id);
  }

  await execute("DELETE FROM encounter_opponents WHERE id = $1", [id]);

  return deletedEncounterOpponent;
};

export const deleteEncounterOpponents = async (
  ids: Array<EncounterOpponent["id"]>,
): Promise<DBEncounterOpponent[]> => {
  const deletePromises = ids.map((id) => {
    return deleteEncounterOpponentById(id);
  });
  const deleteOpponentsResults = await Promise.allSettled(deletePromises);

  const deletedOpponents = deleteOpponentsResults
    .filter(
      (s): s is PromiseFulfilledResult<DBEncounterOpponent> =>
        s.status === "fulfilled",
    )
    .map((s) => s.value);

  return deletedOpponents;
};

export const addEffectToEncounterOpponent = async (
  opponentId: number,
  effectId: number,
): Promise<EncounterOpponent> => {
  const { effects } = await getDetailedEncounterOpponentById(opponentId);
  const isAlreadySet = effects.some((effect: Effect) => effect.id === effectId);
  const update = effects.map((effect: Effect) => effect.id);

  if (!isAlreadySet) {
    update.push(effectId);

    await execute("UPDATE encounter_opponents SET effects = $2 WHERE id = $1", [
      opponentId,
      JSON.stringify(update.map((id: number) => id)),
    ]);

    // Populate active_effects
    const catalogEffect = await getEffectById(effectId);
    await execute(
      "INSERT INTO active_effects (id, effect_id, entity_id, entity_type, remaining_duration, duration_type) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        crypto.randomUUID(),
        effectId,
        opponentId,
        "opponent",
        catalogEffect.duration,
        catalogEffect.durationType,
      ],
    );
  }

  return getDetailedEncounterOpponentById(opponentId);
};

export const removeEffectFromEncounterOpponent = async (
  opponentId: number,
  effectId: number,
) => {
  const { effects } = await getDetailedEncounterOpponentById(opponentId);
  const removedEffect = effects.find((effect: Effect) => effect.id === effectId);
  const update = effects.filter((effect: Effect) => effect.id !== effectId);

  await execute("UPDATE encounter_opponents SET effects = $2 WHERE id = $1", [
    opponentId,
    JSON.stringify(update.map((id: number) => id)),
  ]);

  // Remove from active_effects tracking
  await execute(
    "DELETE FROM active_effects WHERE entity_id = $1 AND entity_type = 'opponent' AND effect_id = $2",
    [opponentId, effectId],
  );

  return removedEffect as Effect;
};

export const opponents = {
  getAllDetailed: async () => {
    return getAllDetailedOpponents();
  },
  create: async (opponent: Omit<Opponent, "id">) => {
    return createOpponent(opponent);
  },
  update: async (opponent: Opponent) => {
    return updateOpponent(opponent);
  },
  delete: async (id: number) => {
    return deleteOpponentById(id);
  },
};

export const encounterOpponents = {
  getAllDetailed: async () => {
    return getAllEncounterOpponentsDetailed();
  },
  create: async (opponent: Omit<EncounterOpponent, "id">) => {
    return createEncounterOpponent(opponent);
  },
  createWithToken: async (
    opponent: Omit<EncounterOpponent, "id">,
    chapterId: number,
  ) => {
    return createEncounterOpponentWithToken(opponent, chapterId);
  },
  createMultiple: async (opponents: Array<Omit<EncounterOpponent, "id">>) => {
    return createEncounterOpponents(opponents);
  },
  update: async (opponent: EncounterOpponent) => {
    return updateEncounterOpponent(opponent);
  },
  delete: async (id: number) => {
    return deleteEncounterOpponentById(id);
  },
  addEffect: async (opponentId: number, effectId: number) => {
    return addEffectToEncounterOpponent(opponentId, effectId);
  },
  removeEffect: async (opponentId: number, effectId: number) => {
    return removeEffectFromEncounterOpponent(opponentId, effectId);
  },
};