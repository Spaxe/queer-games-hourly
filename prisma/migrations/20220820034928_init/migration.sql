-- CreateTable
CREATE TABLE "Game" (
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
    "price" TEXT NOT NULL,
    "currency" TEXT,
    "description" TEXT NOT NULL,
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
    "multiplayer" TEXT,
    "gameUpdatedAt" DATETIME,
    "gamePublishedAt" DATETIME,
    "gameReleasedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "queerGamesHourly" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_gameId_key" ON "Game"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_url_key" ON "Game"("url");
