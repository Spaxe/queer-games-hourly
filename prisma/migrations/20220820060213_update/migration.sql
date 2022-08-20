-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "thumbnail" BLOB,
    "name" TEXT NOT NULL,
    "colourVibrant" TEXT,
    "colourVibrantDark" TEXT,
    "colourVibrantLight" TEXT,
    "colourMuted" TEXT,
    "colourMutedDark" TEXT,
    "colourMutedLight" TEXT,
    "price" TEXT,
    "currency" TEXT,
    "description" TEXT NOT NULL,
    "creator" TEXT,
    "status" TEXT,
    "platforms" TEXT,
    "publisher" TEXT,
    "rating" DECIMAL,
    "ratingCount" INTEGER,
    "author" TEXT NOT NULL,
    "authorProfileUrl" TEXT NOT NULL,
    "genre" TEXT,
    "madeWith" TEXT,
    "tags" TEXT,
    "averageSession" TEXT,
    "languages" TEXT,
    "inputs" TEXT,
    "accessibility" TEXT,
    "links" TEXT,
    "multiplayer" TEXT,
    "gameUpdatedAt" DATETIME,
    "gamePublishedAt" DATETIME,
    "gameReleasedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "queerGamesHourly" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Game" ("accessibility", "author", "authorProfileUrl", "averageSession", "colourMuted", "colourMutedDark", "colourMutedLight", "colourVibrant", "colourVibrantDark", "colourVibrantLight", "creator", "currency", "description", "gameId", "gamePublishedAt", "gameReleasedAt", "gameUpdatedAt", "genre", "id", "inputs", "languages", "links", "madeWith", "multiplayer", "name", "platforms", "price", "publisher", "queerGamesHourly", "rating", "ratingCount", "status", "tags", "thumbnail", "thumbnailUrl", "updatedAt", "url") SELECT "accessibility", "author", "authorProfileUrl", "averageSession", "colourMuted", "colourMutedDark", "colourMutedLight", "colourVibrant", "colourVibrantDark", "colourVibrantLight", "creator", "currency", "description", "gameId", "gamePublishedAt", "gameReleasedAt", "gameUpdatedAt", "genre", "id", "inputs", "languages", "links", "madeWith", "multiplayer", "name", "platforms", "price", "publisher", "queerGamesHourly", "rating", "ratingCount", "status", "tags", "thumbnail", "thumbnailUrl", "updatedAt", "url" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game_gameId_key" ON "Game"("gameId");
CREATE UNIQUE INDEX "Game_url_key" ON "Game"("url");
CREATE UNIQUE INDEX "Game_authorProfileUrl_key" ON "Game"("authorProfileUrl");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
