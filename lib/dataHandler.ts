"use strict";

import fs from "fs";
import path from "path";
import axios from "axios";
import express from "express";
import { webhook } from "../config";
import postHastebin from "../utils/postHastebin";
import returnPayload from "../utils/returnPayload";

let directoryPath = path.join(__dirname, "../dump");
let alreadyPosted: any[] = [];

export default async function handleDumpedLogs() {
  console.log("Starting log grabber...");

  fs.readdir(directoryPath, function (err, files) {
    console.log("Reading directory: " + directoryPath);

    if (err) return console.error("Unable to scan: " + err);

    files.forEach(function (file) {
      if (path.extname(file) === ".json") {
        console.log("Reading file: " + file);

        fs.readFile(
          path.join(directoryPath, file),
          "utf-8",
          async function (error, data) {
            if (error) return console.error("Unable to read: " + error);

            let jsonData = JSON.parse(data);

            jsonData = jsonData.filter(
              (item: any, index: any) =>
                jsonData.findIndex(
                  (item2: any) => item2.src_ip === item.src_ip
                ) === index
            );

            let i = 0;

            let post = async () => {
              if (i === jsonData.length) return;

              let item = jsonData[i];

              try {
                let payload = returnPayload(i, jsonData, item);

                console.log("Sending webhook to Discord...");

                let data = JSON.stringify({ content: null, embeds: payload });

                await new Promise((resolve) => setTimeout(resolve, 1000));
                await axios
                  .post(webhook, data, {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  })
                  .then(() => {
                    console.log("Webhook delivered successfully");
                    alreadyPosted.push(item.src_ip);
                  })
                  .catch(async (error: any) => {
                    if (error.response.status === 429) {
                      return console.log(
                        "Webhook rate limited, returning",
                        error.response.data
                      );
                    }
                  });

                i++;

                await post();
              } catch (e) {
                return console.log(e);
              }
            };

            await post();

            return await postHastebin(webhook, alreadyPosted);
          }
        );
      }

      return;
    });

    return;
  });

  return;
}

export async function serveIPList() {
  let app = express();
  let port = 8080;

  app.get("/", (req: any, res: any) => {
    return res.json({
      current_day: {
        date: new Date().toLocaleDateString(),
        attacker_ips: alreadyPosted,
      },
      prior_dumps: {
        url: "/prior",
      },
    });
  });

  app.get("/prior", (req: any, res: any) => {
    return res.sendFile(path.join(__dirname, "../dump/hastebin_urls.txt"));
  });

  app.listen(port, () => {
    console.log(`Serving IPs at http://localhost:${port}`);
  });
}
