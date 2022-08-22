import { Prisma } from "@prisma/client";
import sleep from "sleep-promise";
import {
  getGameListByTag,
  getGameMoreDetails,
} from "./scratch-the-itch/index.js";
import { createOrUpdateGames, countGames } from "./scratch-the-itch/db.js";

let gamelist = await getGameListByTag("lgbt");
gamelist.concat(await getGameListByTag("furry"));
gamelist.concat(await getGameListByTag("gay"));
gamelist.concat(await getGameListByTag("lesbian"));
gamelist.concat(await getGameListByTag("queer"));
gamelist.concat(await getGameListByTag("transgender"));
gamelist.concat(await getGameListByTag("lgbtqia"));
gamelist.concat(await getGameListByTag("nonbinary"));
gamelist.concat(await getGameListByTag("boys-love"));
gamelist.concat(await getGameListByTag("yaoi"));
gamelist.concat(await getGameListByTag("bara"));
gamelist.concat(await getGameListByTag("yuri"));

console.log(
  `Discovered ${gamelist.length} games on Itch.io. (There may be duplicates.)`
);

let games: Prisma.GameCreateInput[] = [];
for (let i = 0; i < gamelist.length; i++) {
  console.log(`${i} | ${gamelist[i].name} ...`);
  games.push(await getGameMoreDetails(gamelist[i]));
  await sleep(250);
}
await createOrUpdateGames(games);
await countGames();

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
