"use strict";

import fs from "fs";
import path from "path";
import axios from "axios";
import express, { Request, Response } from "express";
import { webhook } from "../config";
import getASNInfo from "../utils/asnLookup";
import postHastebin from "../utils/postHastebin";

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
                let asn_lookup = await getASNInfo(item.src_ip);

                let payload = [
                  {
                    title: `${i} Unique Attacks / ${jsonData.length} Total | Ignoring Repeated IPs`,
                    description: `${item.message}` as string,
                    color: 0x5865f2,
                    thumbnail: {
                      url: "https://64.media.tumblr.com/505f72684d61f8ee355ce5ad5fdd2857/tumblr_nst7fsLmt01rglfeho1_1280.gif",
                    },
                    fields: [
                      {
                        name: "Timestamp" as string,
                        value: ("```" +
                          item.system_timestamp +
                          "```") as string,
                        inline: false,
                      },
                      {
                        name: "ARIN ASN/ISP Whois" as string,
                        value: ("```" +
                          asn_lookup?.org +
                          "\n\n" +
                          asn_lookup?.asn +
                          "```") as string,
                        inline: false,
                      },
                      {
                        name: "Attacker IP" as string,
                        value: ("```" + item.src_ip + "```") as string,
                        inline: true,
                      },
                      {
                        name: "Attacker Location" as string,
                        value: ("```" +
                          `${item?.src_geoip?.region_name || "Unknown City"}, ${
                            item?.src_geoip?.country_code || "Unknown Country"
                          }` +
                          "```") as string,
                        inline: true,
                      },
                      {
                        name: "Target System" as string,
                        value: ("```" + item.system.hostname + "```") as string,
                        inline: true,
                      },
                    ],
                  },
                ];

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
                    } else
                      (error: any) => {
                        return console.error(error);
                      };
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

  app.get("/", (req: Request, res: Response) => {
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
