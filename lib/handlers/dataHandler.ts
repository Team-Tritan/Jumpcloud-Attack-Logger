"use strict";

import fs from "fs";
import path from "path";
import axios from "axios";
import express, { Request, Response } from "express";
import { config } from "../../config";
import abuseReports from "./emailHandler";
import getIPInfo from "../../utils/ipLookup";
import postResults from "../../utils/postResults";
import { sleep } from "../../utils/sleep";
import * as i from "../../interfaces";

const directoryPath = path.join(__dirname, "../../dump");
const collectedData: i.collectedData[] = [];

export default async function handleDumpedLogs() {
  console.log("Starting log grabber...");

  try {
    const files = await fs.promises.readdir(directoryPath);

    console.log("Reading directory: " + directoryPath);

    const embeds = [];

    for (let file of files)
      if (path.extname(file) === ".json") {
        const fileEmbeds = await processLogFile(file);
        embeds.push(...fileEmbeds);
      }

    let embedSize = 10;
    let chunks = chunkArray(embeds, embedSize);

    console.log(
      `Successfully chunked data into ${chunks.length} posts with ${embedSize} embeds each.`
    );

    for (const chunk of chunks) {
      await sendWebhook(chunk);
      await sleep(5000);
    }

    await postResults(config.webhook, collectedData);
  } catch (error) {
    console.error("Unable to scan directory: " + error);
  }
}

async function processLogFile(file: string) {
  console.log("Reading file: " + file);
  let fileEmbeds = [];

  try {
    const data = await fs.promises.readFile(
      path.join(directoryPath, file),
      "utf-8"
    );

    console.log("Parsing logs in json");

    let jsonData = JSON.parse(data);

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

      const data: i.collectedData = {
        timestamp: item?.system_timestamp,
        ip: item?.src_ip,
        lookup: asnLookup,
        description: item?.message,
        location: item?.src_geoip,
        systemHostname: item?.system.hostname,
      };

      const embed = {
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
            value: "```" + data.timestamp + "```",
            inline: false,
          },
          {
            name: "ARIN ASN/ISP Whois",
            value:
              "```" +
              (data.lookup?.org || "") +
              "\n\n" +
              (data.lookup?.asn || "") +
              "```",
            inline: false,
          },
          {
            name: "Attacker IP",
            value: "```" + data.ip + "```",
            inline: true,
          },
          {
            name: "Attacker Location",
            value:
              "```" +
              `${data?.location.region_name || "Unknown City"}, ${
                data?.location?.country_code || "Unknown Country"
              }` +
              "```",
            inline: true,
          },
          {
            name: "Target System",
            value: "```" + data?.systemHostname + "```",
            inline: true,
          },
        ],
      };

      console.log(
        `Parsing and chunking data for ${data.ip} - ${data.lookup?.asn} - ${data.lookup?.org}.`
      );

      collectedData.push(data);
      fileEmbeds.push(embed);
      await abuseReports(data.ip);
    }
  } catch (error) {
    console.error("Unable to read file: " + error);
  }

  return fileEmbeds;
}

async function sendWebhook(embeds: any[]) {
  const payload = {
    content: null,
    embeds,
  };

  try {
    await axios.post(config.webhook, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Webhook delivered successfully");
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      console.log("Webhook rate limited, retrying in 5 seconds...");

      const retryAfter = error.response.data.retry_after || 5;

      await sleep((retryAfter + 5) * 1000);

      await sendWebhook(embeds);
    } else {
      console.error(error);
    }
  }
}

export function chunkArray(array: any[], chunkSize: number) {
  const chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function api() {
  const api = express();

  api.get("/", (req: Request, res: Response) => {
    return res.json({
      current_day: {
        date: new Date().toLocaleDateString(),
        attacks: collectedData,
      },
      prior_dumps: {
        url: "/prior",
      },
    });
  });

  api.get("/prior", (req: any, res: any) => {
    return res.sendFile(path.join(__dirname, "../dump/hastebin_urls.txt"));
  });

  api.listen(config.port, () => {
    console.log(`Serving IPs at http://localhost:${config.port}`);
  });
}
