import { prisma, Prisma, PrismaClient } from "@prisma/client";

export async function updateGames(games: Prisma.GameCreateInput[]) {
  const prisma = new PrismaClient();

  await Promise.all(
    games.map(async (game) => {
      let result;

      try {
        result = await prisma.game.update({
          where: { gameId: game.gameId },
          data: game,
        });
      } catch (error) {
        console.error(error);
      }

      if (!result) {
        try {
          result = await prisma.game.create({
            data: game,
          });
        } catch (error) {
          console.error(error);
        }
      }
    })
  );

  await prisma.$disconnect();
}

// export async function findAllGames() {
//   const prisma = new PrismaClient();

//   try {
//     return await prisma.game.findMany();
//   } catch (error) {
//     console.error(error);
//   }
// }
