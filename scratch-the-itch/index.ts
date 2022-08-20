import fs from "fs";
import path from "path";
import process from "process";
import fetch from "node-fetch";
import sleep from "sleep-promise";
import * as HTMLParser from "node-html-parser";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify";
import Vibrant from "node-vibrant";
import { Prisma } from "@prisma/client";
import { ItchIoJSONResponse, Palette } from "./types";

export const getGameListByTag = async (tag: string) => {
  const games: Prisma.GameCreateInput[] = [];
  let numItems;
  let page = 1;

  // Go through the search results until we have all the games
  while (numItems !== 0) {
    try {
      const response = await fetch(
        `https://itch.io/games/tag-${tag}?format=json&page=${page}`
      );
      const data = (await response.json()) as ItchIoJSONResponse;
      const dom = HTMLParser.parse(data.content);
      const gameCells = dom.querySelectorAll("[data-game_id]");

      // parse search result page
      gameCells.forEach((game) => {
        games.push({
          gameId: Number(game.getAttribute("data-game_id")) || -1,
          url: game.querySelector("a.game_link")?.getAttribute("href") || "",
          thumbnailUrl:
            game
              .querySelector(".game_thumb .lazy_loaded")
              ?.getAttribute("data-lazy_src") || "",
          name: game.querySelector(".title")?.text || "",
          description: game.querySelector(".game_text")?.text || "",
          author: game.querySelector(".game_author")?.text || "",
          authorProfileUrl:
            game.querySelector(".game_author a")?.getAttribute("href") || "",
        });
      });

      numItems = data.num_items;
      process.stdout.write(`Got ${numItems} items from page ${page} ...\n`);
      page++;

      sleep(1000);
      break;
    } catch (err) {
      process.stderr.write(JSON.stringify(err, null, 2));
      break;
    }
  }

  return games;
};

export const getGameMoreDetails = async (game: Prisma.GameCreateInput) => {
  try {
    const response = await fetch(game.url);
    const data = await response.text();
    const dom = HTMLParser.parse(data);

    // Save the more info faithfully
    dom.querySelectorAll(".game_info_panel_widget tr").forEach((row) => {
      const key = row.querySelector("td:first-child")?.text || "";

      switch (key) {
        case "Status":
          game.status = row.querySelector("td:last-child")?.text?.trim() || "";
          break;
        case "Updated":
          let date = new Date(
            row
              .querySelector("td:last-child abbr")
              ?.getAttribute("title")
              ?.split("@")[0] || ""
          );
          if (date) {
            game.gameUpdatedAt = date;
          }
          break;
        default:
          break;
      }
    });
  } catch (err) {
    process.stderr.write(JSON.stringify(err, null, 2));
  }
  return game;
};

// Get the "More Information" for each game
const getGameDetailsByUrl = async (url: string) => {
  try {
    const response = await fetch(url);
    const data = await response.text();
    const dom = HTMLParser.parse(data);

    const details: any = {};
    const comments: any = [];

    // Save the more info faithfully
    dom.querySelectorAll(".game_info_panel_widget tr").forEach((row) => {
      const key = row.querySelector("td:first-child")?.text || "";
      let value;

      // Handle special cases
      if (key === "Rating") {
        value =
          row.querySelector(".aggregate_rating")?.getAttribute("title") || "";
        // Save number of ratings as well
        details["Number of Ratings"] =
          row.querySelector(".rating_count")?.getAttribute("content") || "";
      } else if (key === "Links") {
        const links = row
          .querySelectorAll("a")
          .map((link) => link.getAttribute("href"));
        value = links.join(", ");
      } else if (key === "Author") {
        details["Authors"] = value;
        return;
      } else {
        value = row.querySelector("td:last-child")?.text?.trim() || "";
      }
      details[key] = value;
    });

    // Save the long text from store page
    // details["Store Text"] =
    //   dom.querySelector(".formatted_description")?.text || "";

    // Save the user comments
    dom.querySelectorAll(".game_comments_widget .post_grid").forEach((post) => {
      const author = post.querySelector(".post_author")?.text || "";
      const date =
        post.querySelector(".post_date")?.getAttribute("title") || "";
      const votes =
        post
          .querySelector(".vote_counts .upvotes")
          ?.text?.replace(/\(|\+|\)/g, "") || "0"; // remove (+) from the votes
      const content = post.querySelector(".post_body")?.text || "";
      const permalink =
        post.querySelector(".post_date a")?.getAttribute("href") || "";
      comments.push({ author, date, votes, permalink, content });
    });

    details.CommentsObject = comments;

    return details;
  } catch (err) {
    process.stderr.write(JSON.stringify(err, null, 2));
    return {};
  }
};

// Read the CSV file of games and generate a list of colour palettes
const getThumbnailPalettes = async (tag: string) => {
  try {
    const filepath = getFilePathByTag(tag);
    const gameList = fs.readFileSync(filepath);
    const games = parse(gameList, {
      columns: true,
    }) as Prisma.GameCreateInput[];
    const emptyPalette: Palette = {
      Vibrant: "",
      DarkVibrant: "",
      LightVibrant: "",
      Muted: "",
      DarkMuted: "",
      LightMuted: "",
    };
    let gamePalettes: Palette[] = [];
    process.stdout.write(`Got ${games.length} games from ${filepath} ...\n`);
    let counter = 1;
    let missingThumbnails = 0;

    for (const game of games) {
      let hexObj: Palette = { ...emptyPalette };

      if (game.thumbnailUrl === "") {
        process.stdout.write(
          `${counter} | Skipping ${game.name} with no thumbnail.\n`
        );
        counter++;
        missingThumbnails++;
      } else {
        process.stdout.write(
          `${counter} | Scraping ${game.thumbnailUrl} ...\n`
        );

        // API Doc: https://github.com/Vibrant-Colors/node-vibrant
        try {
          if (game.thumbnailUrl) {
            const palette = await Vibrant.from(game.thumbnailUrl).getPalette();
            for (const pt of Object.keys(emptyPalette)) {
              hexObj[<keyof Palette>pt] = palette[pt]?.getHex() || "";
            }
          }
        } catch (err) {
          process.stderr.write(
            `Failed to generate palette: ${JSON.stringify(err)}\n`
          );
          hexObj = { ...emptyPalette };
        }
      }

      gamePalettes.push(hexObj);
      counter++;
      sleep(1000);
    }

    const paletteFilePath = getPaletteFilePathByTag(tag);
    const outputStream = fs.createWriteStream(paletteFilePath);
    process.stdout.write(
      `Writing ${
        games.length - missingThumbnails
      } palettes to ${paletteFilePath} ...\n`
    );
    stringify(gamePalettes, { header: true }).pipe(outputStream);
  } catch (err) {
    process.stderr.write(JSON.stringify(err, null, 2));
  }
};

export const getDetailedGameListByTag = async (tag: string) => {
  try {
    const filepath = getFilePathByTag(tag);
    const paletteFilePath = getPaletteFilePathByTag(tag);
    const gameList = fs.readFileSync(filepath);
    const paletteList = fs.readFileSync(paletteFilePath);
    const games = parse(gameList, {
      columns: true,
    }) as Prisma.GameCreateInput[];
    const palettes = parse(paletteList, { columns: true }) as Palette[];

    const detailedGameList: any[] = [];
    let commentsList: any[] = [];
    process.stdout.write(`Got ${games.length} games from ${filepath} ...\n`);
    let index = 0;

    for (const game of games) {
      process.stdout.write(
        `${index + 1} | Scraping ${game.name} by ${game.author} ...\n`
      );
      const detail = await getGameDetailsByUrl(game.url);

      // Store the comments in a separate object
      const comments = [...detail.CommentsObject];
      commentsList = commentsList.concat(
        comments.map((comment) => ({
          ID: game.gameId,
          Game: game.name,
          CommentAuthor: comment.author,
          Date: comment.date,
          Votes: comment.votes,
          Permalink: comment.permalink,
          Comment: comment.content,
        }))
      );
      delete detail.CommentsObject;

      // Provide placeholders so they serialise correctly
      const gameDetail = {
        ...game,
        ...palettes[index],
        Status: "",
        Updated: "",
        Platforms: "",
        Publisher: "",
        "Release date": "",
        Rating: "",
        Authors: "",
        Genre: "",
        "Made with": "",
        Tags: "",
        "Average session": "",
        Languages: "",
        Inputs: "",
        Accessibility: "",
        Links: "",
        Multiplayer: "",
        ...detail,
      };
      detailedGameList.push(gameDetail);
      index++;
      sleep(1000);
    }

    // Write game details to csv
    const detailedFilepath = getDetailedFilePathByTag(tag);
    const detailedGameListFile = fs.createWriteStream(detailedFilepath);
    process.stdout.write(
      `Writing ${games.length} game data to ${detailedFilepath} ...\n`
    );
    stringify(detailedGameList, { header: true }).pipe(detailedGameListFile);

    await new Promise((fulfill) => detailedGameListFile.on("finish", fulfill));

    // Write comments to csv file
    const commentsFilepath = getCommentsFilePathByTag(tag);
    const commentsStream = fs.createWriteStream(commentsFilepath);
    process.stdout.write(
      `Writing ${commentsList.length} comments to ${commentsFilepath} ...\n`
    );
    stringify(commentsList, { header: true }).pipe(commentsStream);

    await new Promise((fulfill) => commentsStream.on("finish", fulfill));
  } catch (err) {
    process.stderr.write(JSON.stringify(err, null, 2));
  }
};

const getFilePathByTag = (tag: string) => {
  return path.join(process.cwd(), `tmp/itchio-games-tag-${tag}.csv`);
};

const getDetailedFilePathByTag = (tag: string) => {
  return path.join(process.cwd(), `tmp/itchio-games-tag-${tag}-full.csv`);
};

const getPaletteFilePathByTag = (tag: string) => {
  return path.join(process.cwd(), `tmp/itchio-games-tag-${tag}-palettes.csv`);
};

const getCommentsFilePathByTag = (tag: string) => {
  return path.join(process.cwd(), `tmp/itchio-games-tag-${tag}-comments.csv`);
};

// (async () => {
//   fs.mkdirSync(path.join(process.cwd(), `scratched`), { recursive: true });
//   await getGameListByTag("lgbt");
//   await getThumbnailPalettes("lgbt");
//   await getDetailedGameListByTag("lgbt");
// })();

// TESTING

// Get the "More Information" for one game
// (async () => {
//   const gameData = await getGameDetailsByUrl(
//     "https://teamanpim.itch.io/my-dream-is-to-be-a-model-not-a-maid"
//   );
//   process.stdout.write(JSON.stringify(gameData, null, 2));
// })();
