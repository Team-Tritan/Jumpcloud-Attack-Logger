"use strict";

import fs from "fs";
import path from "path";
import axios from "axios";
import express, { Request, Response } from "express";
import { config } from "../config";
import abuseReports from "./emailHandler";
import getIPInfo from "../utils/ipLookup";
import postHastebin from "../utils/postHastebin";

const directoryPath = path.join(__dirname, "../dump");
const alreadyPosted: any[] = [];

export default async function handleDumpedLogs() {
  console.log("Starting log grabber...");

  try {
    const files = await fs.promises.readdir(directoryPath);
    console.log("Reading directory: " + directoryPath);

    for (const file of files) {
      if (path.extname(file) === ".json") {
        await processLogFile(file);
      }
    }

    await postHastebin(config.webhook, alreadyPosted);
  } catch (error) {
    console.error("Unable to scan directory: " + error);
  }
}

async function sendWebhook(payload: any) {
  try {
    await axios.post(config.webhook, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Webhook delivered successfully");
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      console.log("Webhook rate limited, returning", error.response.data);
    } else {
      console.error(error);
    }
  }
}

async function processLogFile(file: string) {
  console.log("Reading file: " + file);

  try {
    const data = await fs.promises.readFile(
      path.join(directoryPath, file),
      "utf-8"
    );

    console.log("Parsing logs in json");

    const jsonData = JSON.parse(data);

    console.log("Filtering for duplicates");

    const uniqueData = jsonData.filter(
      (item: any, index: any) =>
        jsonData.findIndex((item2: any) => item2?.src_ip === item?.src_ip) ===
        index
    );

    console.log("Found " + uniqueData.length + " unique IPs.");

    for (let i = 0; i < uniqueData.length; i++) {
      const item = uniqueData[i];
      const asnLookup = await getIPInfo(item.src_ip);

      const payload = {
        content: null,
        embeds: [
          {
            title: `${i + 1} Unique Attacks / ${
              uniqueData.length
            } Total | Ignoring Repeated IPs`,
            description: item.message as string,
            color: 0x5865f2,
            thumbnail: {
              url: "https://64.media.tumblr.com/505f72684d61f8ee355ce5ad5fdd2857/tumblr_nst7fsLmt01rglfeho1_1280.gif",
            },
            fields: [
              {
                name: "Timestamp",
                value: "```" + item.system_timestamp + "```",
                inline: false,
              },
              {
                name: "ARIN ASN/ISP Whois",
                value:
                  "```" +
                  (asnLookup?.org || "") +
                  "\n\n" +
                  (asnLookup?.asn || "") +
                  "```",
                inline: false,
              },
              {
                name: "Attacker IP",
                value: "```" + item.src_ip + "```",
                inline: true,
              },
              {
                name: "Attacker Location",
                value:
                  "```" +
                  `${item?.src_geoip?.region_name || "Unknown City"}, ${
                    item?.src_geoip?.country_code || "Unknown Country"
                  }` +
                  "```",
                inline: true,
              },
              {
                name: "Target System",
                value: "```" + item.system?.hostname + "```",
                inline: true,
              },
            ],
          },
        ],
      };

      console.log(
        `Sending webhook for ${item.src_ip} - ${asnLookup?.asn} - ${asnLookup?.org}.`
      );

      await sendWebhook(payload);
      alreadyPosted.push(item.src_ip);
      await abuseReports(item.src_ip);
    }
  } catch (error) {
    console.error("Unable to read file: " + error);
  }
}

export async function serveIPList() {
  const app = express();

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

  app.listen(config.port, () => {
    console.log(`Serving IPs at http://localhost:${config.port}`);
  });
}
