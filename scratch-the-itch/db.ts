import { Prisma, PrismaClient } from "@prisma/client";
import sleep from "sleep-promise";

export async function createOrUpdateGames(games: Prisma.GameCreateInput[]) {
  const prisma = new PrismaClient();

  games.forEach(async (game) => {
    try {
      await prisma.game.create({
        data: game,
      });
      await sleep(10);
    } catch (e) {
      // do nothing, let it go
    }
  });

  games.forEach(async (game) => {
    try {
      await prisma.game.update({
        where: { gameId: game.gameId },
        data: game,
      });
      await sleep(10);
    } catch (e) {
      console.error("error: ", game.gameId, game.name, e);
    }
  });

  await prisma.$disconnect();
}

export async function countGames() {
  const prisma = new PrismaClient();

  const count = await prisma.game.count();
  console.log(`There are ${count} queer games in the database.`);

  await prisma.$disconnect();
  return count;
}
