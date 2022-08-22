-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "url" TEXT,
    "thumbnailUrl" TEXT,
    "thumbnail" BLOB,
    "name" TEXT,
    "colourVibrant" TEXT,
    "colourVibrantDark" TEXT,
    "colourVibrantLight" TEXT,
    "colourMuted" TEXT,
    "colourMutedDark" TEXT,
    "colourMutedLight" TEXT,
    "price" TEXT,
    "currency" TEXT,
    "description" TEXT,
    "creator" TEXT,
    "creatorProfileUrl" TEXT,
    "status" TEXT,
    "platforms" TEXT,
    "publisher" TEXT,
    "rating" DECIMAL,
    "ratingCount" INTEGER,
    "author" TEXT,
    "genre" TEXT,
    "madeWith" TEXT,
    "tags" TEXT,
    "averageSession" TEXT,
    "languages" TEXT,
    "inputs" TEXT,
    "accessibility" TEXT,
    "links" TEXT,
    "mentions" TEXT,
    "multiplayer" TEXT,
    "gameUpdatedAt" DATETIME,
    "gamePublishedAt" DATETIME,
    "gameReleasedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "queerGamesHourly" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Game" ("accessibility", "author", "averageSession", "colourMuted", "colourMutedDark", "colourMutedLight", "colourVibrant", "colourVibrantDark", "colourVibrantLight", "creator", "creatorProfileUrl", "currency", "description", "gameId", "gamePublishedAt", "gameReleasedAt", "gameUpdatedAt", "genre", "id", "inputs", "languages", "links", "madeWith", "mentions", "multiplayer", "name", "platforms", "price", "publisher", "queerGamesHourly", "rating", "ratingCount", "status", "tags", "thumbnail", "thumbnailUrl", "updatedAt", "url") SELECT "accessibility", "author", "averageSession", "colourMuted", "colourMutedDark", "colourMutedLight", "colourVibrant", "colourVibrantDark", "colourVibrantLight", "creator", "creatorProfileUrl", "currency", "description", "gameId", "gamePublishedAt", "gameReleasedAt", "gameUpdatedAt", "genre", "id", "inputs", "languages", "links", "madeWith", "mentions", "multiplayer", "name", "platforms", "price", "publisher", "queerGamesHourly", "rating", "ratingCount", "status", "tags", "thumbnail", "thumbnailUrl", "updatedAt", "url" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game_gameId_key" ON "Game"("gameId");
CREATE UNIQUE INDEX "Game_url_key" ON "Game"("url");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
