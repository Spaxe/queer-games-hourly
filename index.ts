import {
  getGameListByTag,
  getGameMoreDetails,
} from "./scratch-the-itch/index.js";
import { updateGames } from "./scratch-the-itch/db.js";

let games = await getGameListByTag("lgbt");
games = await Promise.all(
  games.map(async (game) => {
    return await getGameMoreDetails(game);
  })
);
await updateGames(games);

// (async () => {
//     fs.mkdirSync(path.join(process.cwd(), `scratched`), { recursive: true });
//     await getGameListByTag("lgbt");
//     await getThumbnailPalettes("lgbt");
//     await getDetailedGameListByTag("lgbt");
//   })();

// TESTING

// Get the "More Information" for one game
// (async () => {
//   const gameData = await getGameDetailsByUrl(
//     "https://teamanpim.itch.io/my-dream-is-to-be-a-model-not-a-maid"
//   );
//   process.stdout.write(JSON.stringify(gameData, null, 2));
// })();
