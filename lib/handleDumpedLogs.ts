"use strict";

import fs from "fs";
import path from "path";
import axios from "axios";
import express from "express";
import { webhook } from "../config";
import postHastebin from "./hastebin";
import getASNInfo from "./asnLookup";

let directoryPath = path.join(__dirname, "../dump");
let alreadyPosted: any[] = [];

export default function handleDumpedLogs() {
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

              let asn_lookup = await getASNInfo(item.src_ip);

              let payload = [
                {
                  title: ("Failed Attack - " + item.process_name) as string,
                  description: `**${item.message}**` as string,
                  color: 0x5865f2,
                  thumbnail: {
                    url: "https://64.media.tumblr.com/505f72684d61f8ee355ce5ad5fdd2857/tumblr_nst7fsLmt01rglfeho1_1280.gif",
                  },
                  fields: [
                    {
                      name: "Timestamp" as string,
                      value: ("```" + item.system_timestamp + "```") as string,
                      inline: false,
                    },
                    {
                      name: "ARIN ASN/ISP Whois" as string,
                      value: ("```" +
                        asn_lookup?.name +
                        "\n\n" +
                        asn_lookup?.number +
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
                        `${item.src_geoip.region_name || "Unknown City"}, ${
                          item.src_geoip.country_code
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
                  } else {
                    return console.error(
                      error.response.status + error.response.data
                    );
                  }
                });

              i++;
              await post();
            };

            await post();

            return postHastebin(webhook, alreadyPosted);
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
    return res.json({ attacker_ips: alreadyPosted });
  });

  app.listen(port, () => {
    console.log(`Serving IPs at http://localhost:${port}`);
  });
}