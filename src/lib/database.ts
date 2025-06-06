import { CanvasElement } from "@/components/Canvas/Canvas";
import { Chapter, ChapterStatus, DBChapter } from "@/types/chapters";
import { DBEffect, Effect } from "@/types/effect";
import {
  DBEncounter,
  Encounter,
  EncounterDifficulty,
  EncounterType,
} from "@/types/encounter";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import {
  DBEncounterOpponent,
  DBOpponent,
  EncounterOpponent,
  Opponent,
} from "@/types/opponents";
import { DBParty, Party } from "@/types/party";
import { DBPlayer, Player, TCreatePlayer } from "@/types/player";
import { DBResistance, Resistance } from "@/types/resistances";
import { DBToken, Token, TokenCoordinates } from "@/types/tokens";
import TauriDatabase from "@tauri-apps/plugin-sql";
import { deleteImage } from "./utils";

const environment = import.meta.env.VITE_ENV;
let dbInstance: TauriDatabase | null = null;

const createDatabaseError = (message: string, originalError?: unknown) => ({
  name: "DatabaseError",
  message,
  originalError,
});

const connect = async (): Promise<TauriDatabase> => {
  try {
    if (!dbInstance) {
      dbInstance = await TauriDatabase.load(
        `sqlite:${environment ?? "dev"}.db`,
      );
    }

    return dbInstance;
  } catch (error) {
    throw createDatabaseError("Error establishing database connection", error);
  }
};

const disconnect = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.close?.();
    dbInstance = null;
  }
};

//* Effects
const getAllEffects = async (db: TauriDatabase): Promise<DBEffect[]> =>
  await db.select<DBEffect[]>("SELECT * FROM effects");

const getEffectById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBEffect> => {
  const result = await db.select<DBEffect[]>(
    "SELECT * FROM effects WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Effect with ID ${id} not found`);
  }

  return result[0];
};

const createEffect = async (
  db: TauriDatabase,
  effect: Omit<Effect, "id">,
): Promise<DBEffect> => {
  const { name, icon, description, duration, durationType, type, value } =
    effect;
  const result = await db.execute(
    "INSERT INTO effects (name, icon, description, duration, duration_type, type, value) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [name, icon, description, duration, durationType, type, value],
  );

  return getEffectById(db, result!.lastInsertId as number);
};

//* Immunities
const getAllImmunities = async (db: TauriDatabase): Promise<DBImmunity[]> =>
  await db.select<DBImmunity[]>("SELECT * FROM immunities");

const getImmunityById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBImmunity> => {
  const result = await db.select<DBImmunity[]>(
    "SELECT * FROM immunities WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Immunity with ID ${id} not found`);
  }

  return result[0];
};

const createImmunitiy = async (
  db: TauriDatabase,
  immunity: Omit<Immunity, "id">,
): Promise<DBImmunity> => {
  const { description, icon, name } = immunity;
  const result = await db.execute(
    "INSERT INTO immunities (description, icon, name) VALUES ($1, $2, $3) RETURNING *",
    [description, icon, name],
  );

  return getImmunityById(db, result!.lastInsertId as number);
};

//* Resistances
const getAllResistances = async (db: TauriDatabase): Promise<DBResistance[]> =>
  await db.select<DBResistance[]>("SELECT * FROM resistances");

const getResistanceById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBResistance> => {
  const result = await db.select<DBResistance[]>(
    "SELECT * FROM resistances WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Resistance with ID ${id} not found`);
  }

  return result[0];
};

const createResistance = async (
  db: TauriDatabase,
  immunity: Omit<Resistance, "id">,
): Promise<DBResistance> => {
  const { description, icon, name } = immunity;
  const result = await db.execute(
    "INSERT INTO resistances (description, icon, name) VALUES ($1, $2, $3) RETURNING *",
    [description, icon, name],
  );

  return getResistanceById(db, result!.lastInsertId as number);
};

//* Party
const getAllParties = async (db: TauriDatabase): Promise<DBParty[]> =>
  await db.select<DBParty[]>("SELECT * FROM parties");

const getPartyById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBParty> => {
  const result = await db.select<DBParty[]>(
    "SELECT * FROM parties WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Party with ID ${id} not found`);
  }

  return result[0];
};

const getPartyDetailedById = async (
  db: TauriDatabase,
  id: number,
): Promise<Party> => {
  const dbParties = await db.select<DBParty[]>(
    "SELECT * FROM parties WHERE id = $1",
    [id],
  );

  if (!dbParties.length) {
    throw createDatabaseError(`Party with ID ${id} not found`);
  }

  const dbParty = dbParties[0];
  const playerIds = JSON.parse(dbParty.players) as number[];
  let players: Player[] = [];

  for (const id of playerIds) {
    const player = await getDetailedPlayerById(db, id);
    players.push(player);
  }

  return { ...dbParty, players };
};

const createParty = async (
  db: TauriDatabase,
  party: Omit<Party, "id">,
): Promise<DBParty> => {
  const { name, icon, description, players } = party;
  const result = await db.execute(
    "INSERT INTO parties (name, icon, description, players ) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, icon, description, JSON.stringify(players)],
  );

  const createdParty = await getPartyById(db, result!.lastInsertId as number);

  return createdParty;
};

const updateParty = async (db: TauriDatabase, party: Party): Promise<Party> => {
  const { id, name, icon, description } = party;

  await db.execute(
    "UPDATE parties SET id = $1, name = $2, icon = $3, description = $4 WHERE id = $1",
    [id, name, icon, description],
  );

  const updatedParty = getPartyDetailedById(db, party.id);

  return updatedParty;
};

const addPlayerToParty = async (
  db: TauriDatabase,
  partyId: number,
  playerId: number,
) => {
  const dbParty = await getPartyById(db, partyId);
  const players = JSON.parse(dbParty.players) as number[];
  players.push(playerId);

  await db.execute("UPDATE parties SET id = $1, players = $2 WHERE id = $1", [
    partyId,
    JSON.stringify(players),
  ]);

  const updatedParty = await getPartyDetailedById(db, partyId);

  return updatedParty;
};

const removePlayerFromParty = async (
  db: TauriDatabase,
  partyId: number,
  playerId: number,
) => {
  const dbParty = await getPartyById(db, partyId);
  const players = JSON.parse(dbParty.players) as number[];
  const newPlayers = players.filter((id) => id !== playerId);

  await db.execute("UPDATE parties SET id = $1, players = $2 WHERE id = $1", [
    partyId,
    JSON.stringify(newPlayers),
  ]);
};

const deletePartyById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBParty> => {
  const deletedParty = await getPartyById(db, id);
  const chapters = await getAllChaptersForParty(db, id);

  for (const chapter of chapters) {
    const encounters = await getDetailedEncountersByIds(db, chapter.encounters);
    for (const encounter of encounters) {
      if (encounter.opponents) {
        for (const opponentId of encounter.opponents) {
          try {
            await deleteEncounterOpponentById(db, Number(opponentId));
          } catch (error) {
            console.error(
              `Failed to delete opponent ${opponentId} from encounter ${encounter.id}:`,
              error,
            );
          }
        }
      }
    }
  }

  for (const chapter of chapters) {
    const encounters = await getDetailedEncountersByIds(db, chapter.encounters);
    for (const encounter of encounters) {
      try {
        await deleteEncounterById(db, encounter.id);
      } catch (error) {
        console.error(`Failed to delete encounter ${encounter.id}:`, error);
      }
    }
  }

  for (const chapter of chapters) {
    try {
      await deleteChapterById(db, chapter.id);
    } catch (error) {
      console.error(`Failed to delete chapter ${chapter.id}:`, error);
    }
  }

  await db.execute("DELETE FROM parties WHERE id = $1", [id]);

  return deletedParty;
};

//* Player
const getDetailedPlayerById = async (
  db: TauriDatabase,
  playerId: Player["id"],
) => {
  const dbPlayer = await getPlayerById(db, playerId);
  const {
    effects: dbEffects,
    image,
    immunities: dbImmunities,
    details,
    ep,
    health,
    icon,
    id,
    level,
    name,
    max_health,
    resistances: dbResistances,
    role,
    overview,
  } = dbPlayer;

  const effectsIds = JSON.parse(dbEffects) as number[];
  const immunitiesIds = JSON.parse(dbImmunities) as number[];
  const resistancesIds = JSON.parse(dbResistances) as number[];

  let effects: DBEffect[] = [];
  let immunities: DBImmunity[] = [];
  let resistances: DBResistance[] = [];

  for (const effectId of effectsIds) {
    const buff = await getEffectById(db, effectId);

    const {
      description,
      duration,
      duration_type,
      icon,
      id,
      name,
      type,
      value,
    } = buff;

    effects.push({
      description,
      duration,
      duration_type,
      icon,
      id,
      name,
      type,
      value,
    });
  }

  for (const immunityId of immunitiesIds) {
    const immunity = await getImmunityById(db, immunityId);
    immunities.push(immunity);
  }

  for (const resistanceId of resistancesIds) {
    const resistance = await getResistanceById(db, resistanceId);
    resistances.push(resistance);
  }

  const player: Player = {
    details,
    effects,
    ep,
    health,
    max_health,
    id,
    image,
    icon,
    immunities,
    level,
    name,
    overview,
    resistances,
    role,
  };

  return player;
};

const getAllPlayers = async (db: TauriDatabase): Promise<DBPlayer[]> =>
  await db.select<DBPlayer[]>("SELECT * FROM players");

const getPlayerById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBPlayer> => {
  const result = await db.select<DBPlayer[]>(
    "SELECT * FROM players WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Player with ID ${id} not found`);
  }

  return result[0];
};

const createPlayer = async (
  db: TauriDatabase,
  player: TCreatePlayer,
): Promise<Player> => {
  const {
    details,
    effects,
    ep,
    health,
    max_health,
    image,
    icon,
    immunities,
    level,
    name,
    overview,
    resistances,
    role,
  } = player;

  const result = await db.execute(
    "INSERT INTO players (details, effects, ep, health, max_health, image, icon, immunities, level, name, overview, resistances, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)  RETURNING *",
    [
      details,
      effects.length > 0
        ? JSON.stringify(effects.map((id) => id).join(", "))
        : "[]",
      ep,
      health,
      max_health,
      image,
      icon,
      immunities.length > 0
        ? JSON.stringify(immunities.map((id) => id).join(", "))
        : "[]",
      level,
      name,
      overview,
      resistances.length > 0
        ? JSON.stringify(resistances.map((id) => id).join(", "))
        : "[]",
      role,
    ],
  );

  return getDetailedPlayerById(db, result!.lastInsertId as number);
};

const updatePlayer = async (
  db: TauriDatabase,
  player: Player,
): Promise<Player> => {
  const {
    details,
    effects,
    ep,
    health,
    max_health,
    id,
    image,
    icon,
    immunities,
    level,
    name,
    overview,
    resistances,
    role,
  } = player;

  await db.execute(
    "UPDATE players SET details = $2, effects = $3, ep = $4, health = $5, max_health = $6, image = $7, icon = $8, immunities = $9, level = $10, name = $11, overview = $12, resistances = $13, role = $14 WHERE id = $1",
    [
      id, // 1
      details, // 2
      JSON.stringify(effects.map((id) => id).join(", ")), // 3
      ep, // 4
      health, // 5
      max_health, // 6
      image, // 7
      icon, // 8
      JSON.stringify(immunities.map((id) => id).join(", ")), // 9
      level, // 10
      name, // 11
      overview, // 12
      JSON.stringify(resistances.map((id) => id).join(", ")), // 13
      role, // 14
    ],
  );

  return getDetailedPlayerById(db, id);
};

const addImmunityToPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  immunityId: DBImmunity["id"],
) => {
  const { immunities } = await getDetailedPlayerById(db, playerId);
  const isAlreadySet = immunities.some(
    (immunity) => immunity.id === immunityId,
  );
  const update = immunities.map((immunity) => immunity.id);

  if (!isAlreadySet) {
    update.push(immunityId);

    await db.execute("UPDATE players SET immunities = $2 WHERE id = $1", [
      playerId,
      JSON.stringify(update.map((id: number) => id).join(", ")),
    ]);
  }

  return getDetailedPlayerById(db, playerId);
};

const removeImmunityFromPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  immunityId: DBImmunity["id"],
) => {
  const { immunities } = await getDetailedPlayerById(db, playerId);
  const update = immunities.filter((immunity) => immunity.id !== immunityId);

  await db.execute("UPDATE players SET immunities = $2 WHERE id = $1", [
    playerId,
    JSON.stringify(
      update
        .map((im) => im.id)
        .map((id: number) => id)
        .join(", "),
    ),
  ]);

  return getDetailedPlayerById(db, playerId);
};

const addResistanceToPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  resistanceId: DBResistance["id"],
) => {
  const { resistances } = await getDetailedPlayerById(db, playerId);
  const isAlreadySet = resistances.some(
    (resistance) => resistance.id === resistanceId,
  );
  const update = resistances.map((resistance) => resistance.id);

  if (!isAlreadySet) {
    update.push(resistanceId);

    await db.execute("UPDATE players SET resistances = $2 WHERE id = $1", [
      playerId,
      JSON.stringify(update.map((id: number) => id).join(", ")),
    ]);
  }

  return getDetailedPlayerById(db, playerId);
};

const removeResistanceFromPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  resistanceId: DBResistance["id"],
) => {
  const { resistances } = await getDetailedPlayerById(db, playerId);
  const update = resistances.filter(
    (resistance) => resistance.id !== resistanceId,
  );

  await db.execute("UPDATE players SET resistances = $2 WHERE id = $1", [
    playerId,
    JSON.stringify(
      update
        .map((im) => im.id)
        .map((id: number) => id)
        .join(", "),
    ),
  ]);

  return getDetailedPlayerById(db, playerId);
};

const deletePlayerById = async (
  db: TauriDatabase,
  id: Player["id"],
): Promise<Player> => {
  const deletedPlayer = await getDetailedPlayerById(db, id);
  const allParties = await getAllParties(db);
  const partiesWithPlayer = allParties.filter((party) =>
    party.players.includes(id.toString()),
  );

  await db.execute("DELETE FROM players WHERE id = $1", [id]);
  //TODO: Implement deletion of the image

  for (const party of partiesWithPlayer) {
    const players = JSON.parse(party.players) as number[];
    const updatedPlayers = players.filter(
      (playerId: number) => playerId !== id,
    );

    await db.execute("UPDATE parties SET id = $1, players = $2 WHERE id = $1", [
      party.id,
      JSON.stringify(updatedPlayers),
    ]);
  }

  return deletedPlayer;
};

//* Chapters
const getChapterById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBChapter> => {
  const result = await db.select<DBChapter[]>(
    "SELECT * FROM chapters WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Chapter with ID ${id} not found`);
  }

  return result[0];
};

const getDetailedChapterById = async (
  db: TauriDatabase,
  id: number,
): Promise<Chapter> => {
  const dbChapters = await db.select<DBChapter[]>(
    "SELECT * FROM chapters WHERE id = $1",
    [id],
  );

  if (!dbChapters.length) {
    throw createDatabaseError(`Chapter with ID ${id} not found`);
  }

  const dbChapter = dbChapters[0];
  const state = dbChapter.state as ChapterStatus;
  const encounters = JSON.parse(dbChapter.encounters) as number[];

  return { ...dbChapter, state, encounters };
};

const createChapter = async (
  db: TauriDatabase,
  chapter: Omit<Chapter, "id">,
): Promise<DBChapter> => {
  const { name, icon, description, battlemap, state, party, encounters } =
    chapter;

  const result = await db.execute(
    "INSERT INTO chapters(name, icon, description, battlemap, state, party, encounters) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [name, icon, description, battlemap, state, party, encounters],
  );

  const createdChapter = await getChapterById(
    db,
    result!.lastInsertId as number,
  );

  return createdChapter;
};

const getAllChaptersForParty = async (
  db: TauriDatabase,
  partyId: Party["id"],
): Promise<Chapter[]> => {
  const dbChapters = await db.select<DBChapter[]>(
    "SELECT * FROM chapters WHERE party = $1",
    [partyId],
  );
  const prettyfiedChapters: Chapter[] = [];

  for (const dbChapter of dbChapters) {
    const prettyChapter = await getDetailedChapterById(db, dbChapter.id);
    prettyfiedChapters.push(prettyChapter);
  }

  return prettyfiedChapters;
};

const updateChapter = async (
  db: TauriDatabase,
  chapter: Chapter,
): Promise<Chapter> => {
  const { id, battlemap, description, icon, name, party, state } = chapter;

  await db.execute(
    "UPDATE chapters SET battlemap = $2, description = $3, icon = $4, name = $5, party = $6, state = $7 WHERE id = $1",
    [id, battlemap, description, icon, name, party, state],
  );

  return getDetailedChapterById(db, id);
};

const updateChapterProperty = async <
  T extends keyof Chapter,
  V extends Chapter[T],
>(
  db: TauriDatabase,
  chapterId: Chapter["id"],
  property: T,
  value: V,
): Promise<Chapter> => {
  const sql = `UPDATE chapters SET ${property} = $2 WHERE id = $1`;

  await db.execute(sql, [chapterId, value]);

  const updated = await getDetailedChapterById(db, chapterId);

  return getDetailedChapterById(db, chapterId);
};

const deleteChapterById = async (
  db: TauriDatabase,
  id: Chapter["id"],
): Promise<DBChapter> => {
  const deletedChapter = await getChapterById(db, id);

  const chapter = await getDetailedChapterById(db, id);
  const encounters = await getDetailedEncountersByIds(db, chapter.encounters);

  for (const encounter of encounters) {
    if (encounter.opponents) {
      for (const opponentId of encounter.opponents) {
        try {
          await deleteEncounterOpponentById(db, Number(opponentId));
        } catch (error) {
          console.error(
            `Failed to delete opponent ${opponentId} from encounter ${encounter.id}:`,
            error,
          );
        }
      }
    }
  }

  for (const encounter of encounters) {
    try {
      await deleteEncounterById(db, encounter.id);
    } catch (error) {
      console.error(`Failed to delete encounter ${encounter.id}:`, error);
    }
  }

  if (chapter.battlemap) {
    try {
      const imageName = decodeURIComponent(chapter.battlemap).split("/").pop();

      if (imageName) {
        await deleteImage(imageName, "battlemaps");
      }
    } catch (error) {
      console.error(
        `Failed to delete battlemap image ${chapter.battlemap}:`,
        error,
      );
    }
  }

  await db.execute("DELETE FROM chapters WHERE id = $1", [id]);

  return deletedChapter;
};

//* TOKENS
const getTokenById = async (
  db: TauriDatabase,
  id: Token["id"],
): Promise<DBToken> => {
  const result = await db.select<DBToken[]>(
    "SELECT * FROM tokens WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Token with ID ${id} not found`);
  }

  return result[0];
};

const existsTokenForChapterAndPlayerId = async (
  db: TauriDatabase,
  chapter: Token["chapter"],
  player: Player["id"],
): Promise<boolean> => {
  const result = await db.select<DBToken[]>(
    "SELECT * FROM tokens WHERE chapter = $1 AND entity = $2 AND type = $3",
    [chapter, player, "player"],
  );

  return result.length > 0;
};

const getDetailedTokenById = async (
  db: TauriDatabase,
  id: Token["id"],
): Promise<Token> => {
  const dbTokens = await db.select<DBToken[]>(
    "SELECT * FROM tokens WHERE id = $1",
    [id],
  );

  if (!dbTokens.length) {
    throw createDatabaseError(`Token with ID ${id} not found`);
  }

  const dbToken = dbTokens[0];
  const coordinates = dbToken.coordinates
    ? (JSON.parse(dbToken.coordinates) as TokenCoordinates)
    : { x: 0, y: 0 };

  return { ...dbToken, coordinates };
};

const getTokensForChapter = async (
  db: TauriDatabase,
  chapter: Chapter["id"],
): Promise<Token[]> => {
  const dbTokens = await db.select<DBToken[]>(
    "SELECT * FROM tokens WHERE chapter = $1",
    [chapter],
  );

  const detailedTokens = [];

  for (const dbToken of dbTokens) {
    const detailedToken = await getDetailedTokenById(db, dbToken.id);

    detailedTokens.push(detailedToken);
  }

  return detailedTokens;
};

const createToken = async (
  db: TauriDatabase,
  token: Omit<Token, "id">,
): Promise<Token> => {
  const { coordinates, entity, chapter, type } = token;

  const result = await db.execute(
    "INSERT INTO tokens(entity, coordinates, chapter, type) VALUES ($1, $2, $3, $4) RETURNING *",
    [entity, JSON.stringify(coordinates), chapter, type],
  );

  const createdToken = await getDetailedTokenById(
    db,
    result!.lastInsertId as number,
  );

  return createdToken;
};

const updateToken = async (db: TauriDatabase, token: Token): Promise<Token> => {
  const { id, coordinates } = token;

  await db.execute("UPDATE tokens SET coordinates = $2 WHERE id = $1", [
    id,
    coordinates,
  ]);

  const updatedToken = await getDetailedTokenById(db, id);

  return updatedToken;
};

const deleteTokenById = async (
  db: TauriDatabase,
  id: Token["id"],
): Promise<DBToken> => {
  const deletedToken = await getTokenById(db, id);

  await db.execute("DELETE FROM tokens WHERE id = $1", [id]);

  return deletedToken;
};

//* Encounters
const getAllEncounters = async (db: TauriDatabase): Promise<DBEncounter[]> => {
  return await db.select<DBEncounter[]>("SELECT * FROM encounters");
};

const getEncounterById = async (
  db: TauriDatabase,
  id: DBEncounter["id"],
): Promise<DBEncounter> => {
  const result = await db.select<DBEncounter[]>(
    "SELECT * FROM encounters WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Encounter with ID ${id} not found`);
  }

  return result[0];
};

const getDetailedEncounterById = async (
  db: TauriDatabase,
  id: number,
): Promise<Encounter> => {
  const dbEncounters = await db.select<DBEncounter[]>(
    "SELECT * FROM encounters WHERE id = $1",
    [id],
  );

  if (!dbEncounters.length) {
    throw createDatabaseError(`Encounter with ID ${id} not found`);
  }

  const dbEncounter = dbEncounters[0];
  const type = dbEncounter.type as EncounterType;
  let difficulties: EncounterDifficulty[] | null = null;
  let images: string[] | null = null;
  let opponents: string[] | null = null;
  let element: CanvasElement | null = null;

  if (dbEncounter.difficulties) {
    difficulties = JSON.parse(
      dbEncounter.difficulties,
    ) as EncounterDifficulty[];
  }

  if (dbEncounter.images) {
    images = JSON.parse(dbEncounter.images) as string[];
  }

  if (dbEncounter.opponents) {
    opponents = JSON.parse(dbEncounter.opponents) as string[];
  }

  if (dbEncounter.element) {
    element = JSON.parse(dbEncounter.element) as CanvasElement;
  }

  return {
    ...dbEncounter,
    type: type,
    difficulties,
    images,
    opponents,
    passed: Boolean(dbEncounter.passed),
    element,
  } as Encounter;
};

const getDetailedEncountersByIds = async (
  db: TauriDatabase,
  encounterIds: Array<DBEncounter["id"]>,
): Promise<Encounter[]> => {
  const encounterPromises = encounterIds.map((id) =>
    getDetailedEncounterById(db, id),
  );
  const encounters = await Promise.allSettled(encounterPromises);

  //@ts-ignore
  return encounters.map((enc) => enc.value) as unknown as Encounter[];
};

const createEncounter = async (
  db: TauriDatabase,
  encounter: Omit<Encounter, "id">,
): Promise<Encounter> => {
  const {
    name,
    description,
    color,
    dice,
    difficulties,
    experience,
    images,
    opponents,
    passed,
    skill,
    type,
    element,
  } = encounter;
  const result = await db.execute(
    "INSERT INTO encounters(name,description,color,dice,difficulties,experience,images,opponents,passed,skill,type, element) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
    [
      name,
      description,
      color,
      dice,
      difficulties,
      experience,
      images,
      opponents,
      passed,
      skill,
      type,
      element,
    ],
  );

  const createdEncounter = await getDetailedEncounterById(
    db,
    result!.lastInsertId as number,
  );

  return createdEncounter;
};

const updateEncounter = async (
  db: TauriDatabase,
  encounter: Encounter,
): Promise<Encounter> => {
  const {
    id,
    name,
    description,
    color,
    dice,
    difficulties,
    experience,
    images,
    opponents,
    passed,
    skill,
    type,
    element,
  } = encounter;
  await db.execute(
    "UPDATE encounters SET name = $2, description = $3, color = $4, dice = $5, difficulties = $6, experience = $7, images = $8, opponents = $9, passed = $10, skill = $11, type = $12, element = $13 WHERE id = $1",
    [
      id,
      name,
      description,
      color,
      dice,
      difficulties,
      experience,
      images,
      opponents,
      passed,
      skill,
      type,
      element,
    ],
  );

  return getDetailedEncounterById(db, id);
};

const deleteEncounterById = async (
  db: TauriDatabase,
  id: Encounter["id"],
): Promise<DBEncounter> => {
  const deletedParty = await getEncounterById(db, id);

  await db.execute("DELETE FROM encounters WHERE id = $1", [id]);

  return deletedParty;
};

// OPPONENTS
const getAllDetailedOpponents = async (
  db: TauriDatabase,
): Promise<Opponent[]> => {
  const opponentsRaw = await getAllOpponents(db);
  const detailedOpponents: Opponent[] = [];

  for (const opponent of opponentsRaw) {
    const detailedOpponent = await getDetailedOpponentById(db, opponent.id);
    detailedOpponents.push(detailedOpponent);
  }

  return detailedOpponents;
};

const getDetailedOpponentById = async (
  db: TauriDatabase,
  opponentId: Opponent["id"],
): Promise<Opponent> => {
  const dbOpponent = await getOpponentById(db, opponentId);
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
  } = dbOpponent;

  const effectsIds = JSON.parse(dbEffects) as number[];
  const immunitiesIds = JSON.parse(dbImmunities) as number[];
  const resistancesIds = JSON.parse(dbResistances) as number[];
  const labelList = JSON.parse(labels) as string[];

  let effects: DBEffect[] = [];
  let immunities: DBImmunity[] = [];
  let resistances: DBResistance[] = [];

  for (const effectId of effectsIds) {
    const effect = await getEffectById(db, effectId);
    effects.push(effect);
  }

  for (const immunityId of immunitiesIds) {
    const immunity = await getImmunityById(db, immunityId);
    immunities.push(immunity);
  }

  for (const resistanceId of resistancesIds) {
    const resistance = await getResistanceById(db, resistanceId);
    resistances.push(resistance);
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
  };

  return opponent;
};

const getAllOpponents = async (db: TauriDatabase): Promise<DBOpponent[]> =>
  await db.select<DBOpponent[]>("SELECT * FROM opponents");

const getOpponentById = async (
  db: TauriDatabase,
  id: DBOpponent["id"],
): Promise<DBOpponent> => {
  const result = await db.select<DBOpponent[]>(
    "SELECT * FROM opponents WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Opponent with ID ${id} not found`);
  }

  return result[0];
};

const createOpponent = async (
  db: TauriDatabase,
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
  } = opponent;

  const result = await db.execute(
    "INSERT INTO opponents (details, effects, health, icon, image, immunities, labels, level, max_health, name, resistances) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
    [
      details,
      JSON.stringify(effects),
      health,
      icon,
      image,
      JSON.stringify(immunities),
      JSON.stringify(labels),
      level,
      max_health,
      name,
      JSON.stringify(resistances),
    ],
  );

  return getDetailedOpponentById(db, result!.lastInsertId as number);
};

const updateOpponent = async (
  db: TauriDatabase,
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
  } = opponent;

  await db.execute(
    "UPDATE opponents SET details = $2, effects = $3, health = $4, icon = $5, image = $6, immunities = $7, labels = $8, level = $9, max_health = $10, name = $11, resistances = $12 WHERE id = $1",
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
    ],
  );

  return getDetailedOpponentById(db, id);
};

const deleteOpponentById = async (
  db: TauriDatabase,
  id: Opponent["id"],
): Promise<DBOpponent> => {
  const deletedOpponent = await getOpponentById(db, id);

  await db.execute("DELETE FROM opponents WHERE id = $1", [id]);

  return deletedOpponent;
};

const updateOpponentProperty = async <
  T extends keyof Opponent,
  V extends Opponent[T],
>(
  db: TauriDatabase,
  opponentId: Opponent["id"],
  property: T,
  value: V,
): Promise<Opponent> => {
  const sql = `UPDATE opponents SET ${String(property)} = $2 WHERE id = $1`;

  await db.execute(sql, [opponentId, value]);

  return getDetailedOpponentById(db, opponentId);
};

// Encounter opponents
const getEncounterOpponentById = async (
  db: TauriDatabase,
  id: DBEncounterOpponent["id"],
): Promise<DBEncounterOpponent> => {
  const result = await db.select<DBEncounterOpponent[]>(
    "SELECT * FROM encounter_opponents WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Encounter Opponent with ID ${id} not found`);
  }

  return result[0];
};

const getAllEncounterOpponents = async (
  db: TauriDatabase,
): Promise<DBEncounterOpponent[]> =>
  await db.select<DBEncounterOpponent[]>("SELECT * FROM encounter_opponents");

const getDetailedEncounterOpponentById = async (
  db: TauriDatabase,
  encounterOpponentId: DBEncounterOpponent["id"],
): Promise<EncounterOpponent> => {
  const dbOpponent = await getEncounterOpponentById(db, encounterOpponentId);
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
    blueprint,
  } = dbOpponent;

  const effectsIds = JSON.parse(dbEffects) as number[];
  const immunitiesIds = JSON.parse(dbImmunities) as number[];
  const resistancesIds = JSON.parse(dbResistances) as number[];
  const labelList = JSON.parse(labels) as string[];

  let effects: DBEffect[] = [];
  let immunities: DBImmunity[] = [];
  let resistances: DBResistance[] = [];

  for (const effectId of effectsIds) {
    const effect = await getEffectById(db, effectId);
    effects.push(effect);
  }

  for (const immunityId of immunitiesIds) {
    const immunity = await getImmunityById(db, immunityId);
    immunities.push(immunity);
  }

  for (const resistanceId of resistancesIds) {
    const resistance = await getResistanceById(db, resistanceId);
    resistances.push(resistance);
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
    blueprint,
  };

  const getAllEncounterOpponentsDetailed = async (
    db: TauriDatabase,
  ): Promise<EncounterOpponent[]> => {
    const encounterOpponentsRaw = await getAllEncounterOpponents(db); // Fetch basic encounter opponents
    const detailedEncounterOpponents: EncounterOpponent[] = [];

    for (const opponent of encounterOpponentsRaw) {
      const detailedOpponent = await getDetailedEncounterOpponentById(
        db,
        opponent.id,
      ); // Get detailed opponent data
      detailedEncounterOpponents.push(detailedOpponent); // Store it in the array
    }

    return detailedEncounterOpponents; // Return the array of detailed encounter opponents
  };

  return encounterOpponent;
};

const getAllEncounterOpponentsDetailed = async (
  db: TauriDatabase,
): Promise<EncounterOpponent[]> => {
  const encounterOpponentsRaw = await getAllEncounterOpponents(db);
  const detailedEncounterOpponents: EncounterOpponent[] = [];

  for (const opponent of encounterOpponentsRaw) {
    const detailedOpponent = await getDetailedEncounterOpponentById(
      db,
      opponent.id,
    );
    detailedEncounterOpponents.push(detailedOpponent);
  }

  return detailedEncounterOpponents; // Return the array of detailed encounter opponents
};

const createEncounterOpponent = async (
  db: TauriDatabase,
  encounterOpponent: Omit<EncounterOpponent, "id">,
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
    blueprint, // additional prop
  } = encounterOpponent;

  const result = await db.execute(
    "INSERT INTO encounter_opponents (details, effects, health, icon, image, immunities, labels, level, max_health, name, resistances, blueprint) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
    [
      details,
      JSON.stringify(effects),
      health,
      icon,
      image,
      JSON.stringify(immunities),
      JSON.stringify(labels),
      level,
      max_health,
      name,
      JSON.stringify(resistances),
      blueprint,
    ],
  );

  return getDetailedEncounterOpponentById(db, result!.lastInsertId as number);
};

const updateEncounterOpponent = async (
  db: TauriDatabase,
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
    blueprint,
  } = encounterOpponent;

  await db.execute(
    "UPDATE encounter_opponents SET details = $2, effects = $3, health = $4, icon = $5, image = $6, immunities = $7, labels = $8, level = $9, max_health = $10, name = $11, resistances = $12, blueprint = $13 WHERE id = $1",
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
      blueprint,
    ],
  );

  return getDetailedEncounterOpponentById(db, id);
};

const deleteEncounterOpponentById = async (
  db: TauriDatabase,
  id: EncounterOpponent["id"],
): Promise<DBEncounterOpponent> => {
  const deletedEncounterOpponent = await getEncounterOpponentById(db, id);

  await db.execute("DELETE FROM encounter_opponents WHERE id = $1", [id]);

  return deletedEncounterOpponent;
};

const getEncountersByIds = async (
  db: TauriDatabase,
  encounterIds: number[],
): Promise<Encounter[]> => {
  const encounters: Encounter[] = [];

  for (const id of encounterIds) {
    try {
      const encounter = await getDetailedEncounterById(db, id);
      encounters.push(encounter);
    } catch (error) {
      console.error(`Failed to fetch encounter with id ${id}:`, error);
    }
  }

  return encounters;
};

export const Database = {
  connect,
  disconnect,

  effects: {
    getAll: async () => {
      const db = await connect();
      return getAllEffects(db);
    },
    getById: async (id: number) => {
      const db = await connect();
      return getEffectById(db, id);
    },
    create: async (effect: Omit<Effect, "id">) => {
      const db = await connect();
      return createEffect(db, effect);
    },
  },

  immunitites: {
    getAll: async () => {
      const db = await connect();
      return getAllImmunities(db);
    },
    getById: async (id: number) => {
      const db = await connect();
      return getImmunityById(db, id);
    },
    create: async (immunity: Omit<DBResistance, "id">) => {
      const db = await connect();
      return createImmunitiy(db, immunity);
    },
  },

  resistances: {
    getAll: async () => {
      const db = await connect();
      return getAllResistances(db);
    },
    getById: async (id: number) => {
      const db = await connect();
      return getResistanceById(db, id);
    },
    create: async (resistance: Omit<DBResistance, "id">) => {
      const db = await connect();
      return createResistance(db, resistance);
    },
  },

  parties: {
    getAll: async () => {
      const db = await connect();
      return getAllParties(db);
    },
    getAllDetailed: async () => {
      const db = await connect();
      const dbParties = await getAllParties(db);
      const parties: Party[] = [];

      for (const dbParty of dbParties) {
        const party = await getPartyDetailedById(db, dbParty.id);
        parties.push(party);
      }

      return parties;
    },
    getById: async (id: number) => {
      const db = await connect();
      return getPartyById(db, id);
    },
    getDetailedById: async (id: number) => {
      const db = await connect();
      return getPartyDetailedById(db, id);
    },
    create: async (party: Omit<Party, "id">) => {
      const db = await connect();
      return createParty(db, party);
    },
    deleteById: async (id: Party["id"]) => {
      const db = await connect();
      return deletePartyById(db, id);
    },
    updateByParty: async (party: Party) => {
      const db = await connect();
      return updateParty(db, party);
    },
    addPlayerToParty: async (partyId: Party["id"], playerId: Player["id"]) => {
      const db = await connect();
      return addPlayerToParty(db, partyId, playerId);
    },
    removePlayerFromParty: async (
      partyId: Party["id"],
      playerId: Player["id"],
    ) => {
      const db = await connect();
      return removePlayerFromParty(db, partyId, playerId);
    },
  },

  players: {
    getAll: async () => {
      const db = await connect();
      return getAllPlayers(db);
    },
    getById: async (id: number) => {
      const db = await connect();
      return getPlayerById(db, id);
    },
    getDetailedById: async (id: number) => {
      const db = await connect();
      return getDetailedPlayerById(db, id);
    },
    getAllDetailed: async () => {
      const db = await connect();
      const playersRaw = await getAllPlayers(db);
      const detailedPlayers: Player[] = [];

      for (const player of playersRaw) {
        const detailedPlayer = await getDetailedPlayerById(db, player.id);
        detailedPlayers.push(detailedPlayer);
      }

      return detailedPlayers;
    },
    create: async (player: TCreatePlayer) => {
      const db = await connect();
      return createPlayer(db, player);
    },
    /**
     * Updates a specific player
     * @param player
     * @returns  the updated player
     */
    update: async (player: Player) => {
      const db = await connect();
      return updatePlayer(db, player);
    },
    addImmunityToPlayer: async (
      playerId: Player["id"],
      immunityId: DBImmunity["id"],
    ) => {
      const db = await connect();
      return addImmunityToPlayer(db, playerId, immunityId);
    },
    removeImmunityFromPlayer: async (
      playerId: Player["id"],
      immunityId: DBImmunity["id"],
    ) => {
      const db = await connect();
      return removeImmunityFromPlayer(db, playerId, immunityId);
    },
    addResistanceToPlayer: async (
      playerId: Player["id"],
      resistanceId: DBResistance["id"],
    ) => {
      const db = await connect();
      return addResistanceToPlayer(db, playerId, resistanceId);
    },
    removeResistanceFromPlayer: async (
      playerId: Player["id"],
      resistanceId: DBResistance["id"],
    ) => {
      const db = await connect();
      return removeResistanceFromPlayer(db, playerId, resistanceId);
    },
    deletePlayerById: async (playerId: Player["id"]) => {
      const db = await connect();
      return deletePlayerById(db, playerId);
    },
  },

  chapters: {
    create: async (chapter: Omit<Chapter, "id">) => {
      const db = await connect();
      return createChapter(db, chapter);
    },
    getById: async (id: Chapter["id"]) => {
      const db = await connect();
      return getChapterById(db, id);
    },
    getByIdDetailed: async (id: Chapter["id"]) => {
      const db = await connect();
      return getDetailedChapterById(db, id);
    },
    getChaptersByPartyId: async (partyId: Party["id"]) => {
      const db = await connect();
      return getAllChaptersForParty(db, partyId);
    },
    update: async (chapter: Chapter) => {
      const db = await connect();
      return updateChapter(db, chapter);
    },
    updateProperty: async <T extends keyof Chapter, V extends Chapter[T]>(
      chapterId: Chapter["id"],
      property: T,
      value: V,
    ) => {
      const db = await connect();
      return updateChapterProperty(db, chapterId, property, value);
    },
    addEncounter: async (
      chapterId: Chapter["id"],
      encounterId: Encounter["id"],
    ) => {
      const db = await connect();
      const chapter = await getDetailedChapterById(db, chapterId);
      const encounters = chapter.encounters
        ? [...chapter.encounters, encounterId]
        : [encounterId];
      return updateChapterProperty(db, chapterId, "encounters", encounters);
    },
    delete: async (id: Chapter["id"]) => {
      const db = await connect();
      return deleteChapterById(db, id);
    },
  },

  tokens: {
    create: async (token: Omit<Token, "id">) => {
      const db = await connect();
      return createToken(db, token);
    },
    getById: async (id: Token["id"]) => {
      const db = await connect();
      return getTokenById(db, id);
    },
    getByIdDetailed: async (id: Token["id"]) => {
      const db = await connect();
      return getDetailedTokenById(db, id);
    },
    getChapterTokens: async (
      partyId: Party["id"],
      chapterId: Chapter["id"],
    ) => {
      const db = await connect();
      const party = await getPartyDetailedById(db, partyId);
      const { players } = party;

      for (const player of players) {
        const hasPlayerToken = await existsTokenForChapterAndPlayerId(
          db,
          chapterId,
          player.id,
        );

        if (!hasPlayerToken) {
          const token: Omit<Token, "id"> = {
            chapter: chapterId,
            entity: player.id,
            coordinates: { x: 0, y: 0 },
            type: "player",
          };
          await createToken(db, token);
        }
      }

      return getTokensForChapter(db, chapterId);
    },
    update: async (token: Token) => {
      const db = await connect();
      return updateToken(db, token);
    },
    delete: async (id: Token["id"]) => {
      const db = await connect();
      return deleteTokenById(db, id);
    },
  },

  encounters: {
    create: async (encounter: Omit<Encounter, "id">) => {
      const db = await connect();
      return createEncounter(db, encounter);
    },
    update: async (encounter: Encounter) => {
      const db = await connect();
      return updateEncounter(db, encounter);
    },
    getById: async (id: Encounter["id"]) => {
      const db = await connect();
      return getEncounterById(db, id);
    },
    getDetailedById: async (id: Encounter["id"]) => {
      const db = await connect();
      return getDetailedEncounterById(db, id);
    },
    getDetailedEncountersByIds: async (ids: Array<Encounter["id"]>) => {
      const db = await connect();
      return getDetailedEncountersByIds(db, ids);
    },
    delete: async (id: Encounter["id"]) => {
      const db = await connect();
      return deleteEncounterById(db, id);
    },
    getDetailedByIds: async (ids: Array<EncounterOpponent["id"]>) => {
      const db = await connect();
      return getDetailedEncountersByIds(db, ids);
    },
  },

  opponents: {
    create: async (opponent: Omit<Opponent, "id">) => {
      const db = await connect();
      return createOpponent(db, opponent);
    },
    update: async (opponent: Opponent) => {
      const db = await connect();
      return updateOpponent(db, opponent);
    },
    getById: async (id: Opponent["id"]) => {
      const db = await connect();
      return getOpponentById(db, id);
    },
    getDetailedById: async (id: Opponent["id"]) => {
      const db = await connect();
      return getDetailedOpponentById(db, id);
    },
    getAllDetailed: async () => {
      const db = await connect();
      return getAllDetailedOpponents(db);
    },
    delete: async (id: Opponent["id"]) => {
      const db = await connect();
      return deleteOpponentById(db, id);
    },
  },

  encounterOpponents: {
    create: async (encounterOpponent: Omit<EncounterOpponent, "id">) => {
      const db = await connect();
      return createEncounterOpponent(db, encounterOpponent);
    },
    update: async (encounterOpponent: EncounterOpponent) => {
      const db = await connect();
      return updateEncounterOpponent(db, encounterOpponent);
    },
    getById: async (id: DBEncounterOpponent["id"]) => {
      const db = await connect();
      return getEncounterOpponentById(db, id);
    },
    getDetailedById: async (id: DBEncounterOpponent["id"]) => {
      const db = await connect();
      return getDetailedEncounterOpponentById(db, id);
    },
    getAllDetailed: async () => {
      const db = await connect();
      return getAllEncounterOpponentsDetailed(db);
    },
    delete: async (id: EncounterOpponent["id"]) => {
      const db = await connect();
      return deleteEncounterOpponentById(db, id);
    },
  },
};

export default Database;
function removeFile(imagePath: string, arg1: { baseDir: any }) {
  throw new Error("Function not implemented.");
}
