// Tweets a queer game a day
// unfortunately with the image upload I have to use a second client
// https://github.com/FeedHive/twitter-api-client/issues/63

require("dotenv").config();
const nfetch = require("node-fetch");

// setup storage
const LocalStorage = require("node-localstorage").LocalStorage;
const storage = new LocalStorage("./localstorage");

// get the current row index
let index = storage.getItem("index");
if (index == null) {
  storage.setItem("index", 0);
  index = 0;
}

// setup Twitter client
const { TwitterClient } = require("twitter-api-client");
const twitterClient = new TwitterClient({
  apiKey: process.env.TWITTER_API_KEY,
  apiSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  ttl: 120,
  disableCache: true,
});

// const Twitter = require("twitter");
// const twitter = new Twitter({
//   consumer_key: process.env.TWITTER_API_KEY,
//   consumer_secret: process.env.TWITTER_API_SECRET,
//   access_token_key: process.env.TWITTER_ACCESS_TOKEN,
//   access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
// });

// setup csv parsing
const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");

fs.createReadStream(path.resolve(__dirname, process.env.FILEPATH))
  .pipe(csv.parse({ headers: true, skipRows: index, maxRows: 1 }))
  .on("error", (error: any) => console.error(error))
  .on("data", async (row: any) => await tweet(row));

// untyped for now
async function tweet(row: any) {
  // skip games with no name or URLs
  try {
    if (!row.Game || !row.URL) {
      storage.setItem("index", ++index);
      return;
    }
    let mediaId = null;

    console.log("Getting ready to tweet:", row.Game, row.URL);

    // TODO: Add images
    // upload the screenshot if there is one
    // if (row["Thumbnail URL"]) {
    //   // get image metadata
    //   const thumbnail = await nfetch(row["Thumbnail URL"]);
    //   const mediaSize = thumbnail.headers.get("content-length");

    //   // get media type
    //   let mediaType = "image/png";
    //   if (
    //     row["Thumbnail URL"].endsWith(".jpg") ||
    //     row["Thumbnail URL"].endsWith(".jpeg")
    //   ) {
    //     mediaType = "image/jpeg";
    //   }
    //   if (row["Thumbnail URL"].endsWith(".gif")) {
    //     mediaType = "image/gif";
    //   }

    //   // init upload to Twitter
    //   console.log(
    //     `Found media ${mediaType}, ${row["Thumbnail URL"]} at ${mediaSize} bytes`
    //   );
    //   // const initResponse = await twitterClient.media.mediaUploadInit({
    //   //   command: "INIT",
    //   //   total_byes: contentLength,
    //   //   media_type: mediaType,
    //   // });
    //   const initResponse: any = await makePost("media/upload", {
    //     command: "INIT",
    //     total_bytes: mediaSize,
    //     media_type: mediaType,
    //   });

    //   const mediaId = initResponse.media_id_string;
    //   console.log("Initialised image with id:", mediaId);

    //   // get base64 encoding of image
    //   const thumbnailBuffer = await thumbnail.buffer();

    //   // attempt to upload image
    //   // await twitterClient.media.mediaUploadAppend({
    //   //   command: "APPEND",
    //   //   media_id: mediaId,
    //   //   media_data: thumbnailBuffer.toString("base64"),
    //   //   segment_index: 0,
    //   // });
    //   await makePost("media/upload", {
    //     command: "APPEND",
    //     media_id: mediaId,
    //     media: thumbnailBuffer,
    //     segment_index: 0,
    //   });
    //   console.log("Sent Append upload command");
    //   let state = "succeeded"; // for some reason STATUS endpoint upload isn't there?

    // wait for a few moments and check if it succeeded
    /*
      let state = "pending";
      let maxAttempts = 10;
      let attempt = 0;
      let uploadStatus: any;
      while (
        state === "in_progress" ||
        (state === "pending" && attempt < maxAttempts)
      ) {
        await sleep(1000);
        // uploadStatus = await twitterClient.media.mediaUploadStatus({
        //   command: "STATUS",
        //   media_id: mediaId,
        // });
        try {
          uploadStatus = await makeGet("media/upload", {
            command: "STATUS",
            media_id: mediaId,
          });
          state = uploadStatus.processing_info.state;
        } catch (e) {
          console.log(e);
        }
        console.log("Polling update status attempt", attempt);
        ++attempt;
      }

      // report error if failed
      if (state !== "succeeded") {
        console.error("Failed to upload image", uploadStatus);
        return;
      }
      if (attempt >= maxAttempts) {
        console.error("Timeout to upload image", uploadStatus);
        return;
      }*/

    // finalise image upload
    // await sleep(5000); // just to be safe
    // if (state === "succeeded") {
    //   // await twitterClient.media.mediaUploadFinalize({
    //   //   command: "FINALIZE",
    //   //   media_id: mediaId,
    //   // });
    //   await makePost("media/upload", {
    //     command: "FINALIZE",
    //     media_id: mediaId,
    //   });
    //   console.log("Upload success:", mediaId);
    // }
    // }

    const text = `${row.Game} — ${row.URL}
${row["Brief Description"]}`;

    let response;
    // if (mediaId) {
    //   response = await twitterClient.tweetsV2.createTweet({
    //     text,
    //     media: mediaId,
    //   });
    // } else {
    response = await twitterClient.tweetsV2.createTweet({
      text,
    });
    // }

    storage.setItem("index", ++index);
    console.log("Tweeted!", index, response);
  } catch (e: any) {
    console.error(e);
  }
}

// https://masteringjs.io/tutorials/node/sleep
// sleep for x milliseconds
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// /**
//  * (Utility function) Send a POST request to the Twitter API
//  * @param String endpoint  e.g. 'statuses/upload'
//  * @param Object params    Params object to send
//  * @return Promise         Rejects if response is error
//  */
// function makePost(endpoint: string, params: any) {
//   return new Promise((resolve, reject) => {
//     twitter.post(endpoint, params, (error: any, data: any, response: any) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// }

// /**
//  * (Utility function) Send a GET request to the Twitter API
//  * @param String endpoint  e.g. 'statuses/upload'
//  * @param Object params    Params object to send
//  * @return Promise         Rejects if response is error
//  */
// function makeGet(endpoint: string, params: any) {
//   return new Promise((resolve, reject) => {
//     twitter.get(endpoint, params, (error: any, data: any, response: any) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// }
