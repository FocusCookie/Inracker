import { DBToken, Token, TokenCoordinates } from "@/types/tokens";
import { CanvasElement } from "@/components/Canvas/Canvas";
import { Chapter } from "@/types/chapters";
import { Encounter } from "@/types/encounter";
import { EncounterOpponent } from "@/types/opponents";
import { Player } from "@/types/player";
import { execute, select, createDatabaseError } from "./core"; // Updated import

export const getTokenById = async (
  id: Token["id"],
): Promise<DBToken> => {
  const result = await select<DBToken[]>( // Changed db.select to select
    "SELECT * FROM tokens WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Token with ID ${id} not found`);
  }

  return result[0];
};

export const existsTokenForChapterAndPlayerId = async (
  chapter: Token["chapter"],
  player: Player["id"],
): Promise<boolean> => {
  const result = await select<DBToken[]>( // Changed db.select to select
    "SELECT * FROM tokens WHERE chapter = $1 AND entity = $2 AND type = $3",
    [chapter, player, "player"],
  );

  return result.length > 0;
};

export const getEncounterOpponentToken = async (
  encounterOpponentId: EncounterOpponent["id"],
): Promise<DBToken> => {
  const result = await select<DBToken[]>( // Changed db.select to select
    "SELECT * FROM tokens WHERE entity = $1 AND type = $2",
    [encounterOpponentId, "opponent"],
  );

  return result[0];
};

export const getDetailedTokenById = async (
  id: Token["id"],
): Promise<Token> => {
  const dbTokens = await select<DBToken[]>( // Changed db.select to select
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

export const getDetailedTokenByEntityId = async (
  entityId: Token["entity"],
): Promise<Token> => {
  const dbTokens = await select<DBToken[]>( // Changed db.select to select
    "SELECT * FROM tokens WHERE entity = $1",
    [entityId],
  );

  const rawToken = dbTokens[0];

  const token = { ...rawToken, coordinates: JSON.parse(rawToken.coordinates) };

  return token;
};

export const getDetailedEncounterTokens = async (
  encounter: Encounter,
): Promise<Token[]> => {
  if (encounter.opponents && encounter.opponents.length > 0) {
    const getDbTokens = encounter.opponents.map((entityId) => {
      // Parse string ID to number if necessary, assuming entityId is stored as string in JSON
      return getDetailedTokenByEntityId(Number(entityId)); // Removed db parameter
    });

    const getTokensResults = await Promise.allSettled(getDbTokens);

    const tokens = getTokensResults
      .filter(
        (s): s is PromiseFulfilledResult<Token> => s.status === "fulfilled",
      )
      .map((s) => s.value);

    return tokens;
  }

  return [];
};

export const getTokensForChapter = async (
  chapter: Chapter["id"],
): Promise<Token[]> => {
  const dbTokens = await select<DBToken[]>( // Changed db.select to select
    "SELECT * FROM tokens WHERE chapter = $1",
    [chapter],
  );

  const detailedTokens = [];

  for (const dbToken of dbTokens) {
    const detailedToken = await getDetailedTokenById(dbToken.id); // Removed db parameter

    detailedTokens.push(detailedToken);
  }

  return detailedTokens;
};

export const createToken = async (
  token: Omit<Token, "id">,
): Promise<Token> => {
  const { coordinates, entity, chapter, type } = token;

  const result = await execute( // Changed db.execute to execute
    "INSERT INTO tokens(entity, coordinates, chapter, type) VALUES ($1, $2, $3, $4) RETURNING *",
    [entity, JSON.stringify(coordinates), chapter, type],
  );

  const createdToken = await getDetailedTokenById(
    result!.lastInsertId as number,
  ); // Removed db parameter

  return createdToken;
};

export const existsToken = async (
  chapter: Token["chapter"],
  entity: Token["entity"],
  type: Token["type"],
): Promise<boolean> => {
  const result = await select<DBToken[]>( // Changed db.select to select
    "SELECT * FROM tokens WHERE chapter = $1 AND entity = $2 AND type = $3",
    [chapter, entity, type],
  );

  return result.length > 0;
};

export const createTokensForEncounter = async (
  chapterId: Chapter["id"],
  encounter: Encounter,
): Promise<Token[]> => {
  if (!encounter.opponents) return [];

  const createPromises = encounter.opponents.map(async (opponent, index) => {
    // @ts-ignore
    const exists = await existsToken(chapterId!, opponent, "opponent"); // Removed db parameter
    if (exists) return null;

    const token: Omit<Token, "id"> = {
      type: "opponent",
      // @ts-ignore
      entity: opponent,
      coordinates: {
        x: encounter.element
          ? encounter.element.width / 2 + encounter.element.x - 32
          : 0,
        y: encounter.element ? encounter.element.y + 64 + index * 84 : 0,
      },
      chapter: chapterId!,
    };

    return createToken(token); // Removed db parameter
  });

  const createdTokenResult = await Promise.allSettled(createPromises);

  const createdTokens = createdTokenResult
    .filter(
      (s): s is PromiseFulfilledResult<Token> =>
        s.status === "fulfilled" && s.value !== null,
    )
    .map((s) => s.value);

  return createdTokens;
};

export const updateToken = async (
  token: Token,
): Promise<Token> => {
  const { id, coordinates } = token;

  await execute("UPDATE tokens SET coordinates = $2 WHERE id = $1", [ // Changed db.execute to execute
    id,
    JSON.stringify(coordinates),
  ]);

  const updatedToken = await getDetailedTokenById(id); // Removed db parameter

  return updatedToken;
};

export const deleteTokenById = async (
  id: Token["id"],
): Promise<DBToken> => {
  const deletedToken = await getTokenById(id); // Removed db parameter

  await execute("DELETE FROM tokens WHERE id = $1", [id]); // Changed db.execute to execute

  return deletedToken;
};

export const deleteTokens = async (
  tokenIds: Array<Token["id"]>,
): Promise<DBToken[]> => {
  const deletePromises = tokenIds.map((tokenId: number) => {
    return deleteTokenById(tokenId); // Removed db parameter
  });

  const deleteTokensResults = await Promise.allSettled(deletePromises);

  const deletedTokens = deleteTokensResults
    .filter(
      (s): s is PromiseFulfilledResult<DBToken> => s.status === "fulfilled",
    )
    .map((s) => s.value);

  return deletedTokens;
};

export const groupTokensIntoElement = async (
  entityIds: Array<Token["entity"]>,
  element: CanvasElement,
) => {
  const getTokenPromises = entityIds.map((token) => {
    return getDetailedTokenByEntityId(token); // Removed db parameter
  });

  const detailedTokensResults = await Promise.allSettled(getTokenPromises);

  const detailedTokens = detailedTokensResults
    .filter((s): s is PromiseFulfilledResult<Token> => s.status === "fulfilled")
    .map((s) => s.value);

  const tmpTokens = detailedTokens.map((token) => {
    return {
      ...token,
      coordinates: {
        x: element.x + element.width / 2 - 32, // 32 because a token is 64 px
        y: element.y + element.height / 2 - 32,
      },
    };
  }) as any as Token[];

  const updateTokensPromises = tmpTokens.map((token) => updateToken(token)); // Removed db parameter

  const updatedTokensResult = await Promise.allSettled(updateTokensPromises);

  const updatedTokens = updatedTokensResult
    .filter((s): s is PromiseFulfilledResult<Token> => s.status === "fulfilled")
    .map((s) => s.value);

  return updatedTokens;
};

export const tokens = {
  getById: async (id: number) => {
    return getDetailedTokenById(id); // Removed db parameter
  },
  getByChapter: async (chapterId: Chapter["id"]) => {
    return getTokensForChapter(chapterId); // Removed db parameter
  },
  create: async (token: Omit<Token, "id">) => {
    return createToken(token); // Removed db parameter
  },
  createOpponentsTokensByEncounter: async (
    chapterId: Chapter["id"],
    encounter: Encounter,
  ) => {
    return createTokensForEncounter(chapterId, encounter); // Removed db parameter
  },
  update: async (token: Token) => {
    return updateToken(token); // Removed db parameter
  },
  delete: async (id: number) => {
    return deleteTokenById(id); // Removed db parameter
  },
  groupIntoElement: async (
    entityIds: Array<Token["entity"]>,
    element: CanvasElement,
  ) => {
    return groupTokensIntoElement(entityIds, element); // Removed db parameter
  },
};