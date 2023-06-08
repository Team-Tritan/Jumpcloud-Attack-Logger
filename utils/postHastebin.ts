"use strict";

import axios from "axios";
import { exec } from "child_process";

export default async function postHastebin(
  webhook: string,
  alreadyPosted: any[]
): Promise<void> {
  if (!webhook) return;
  if (webhook === "") return;

  const dumpData = JSON.stringify({ attacker_ips: alreadyPosted });

  const response = await axios.post(
    "https://bin.tritan.gg/documents",
    dumpData
  );
  const url = "https://bin.tritan.gg/raw/" + response.data.key;

  const d = new Date();
  const date = d.toLocaleDateString();

  const payload = [
    {
      author: {
        name: date,
        url: url,
      },
      fields: [
        {
          name: "Data Dump:",
          value: url,
        },
      ],
      color: 0x8953fb,
    },
  ];

  const webhookData = JSON.stringify({ content: null, embeds: payload });

  await axios.post(webhook, webhookData, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  exec(`echo "${date} - ${url}" >> ./dump/hastebin_urls.txt`);

  console.log("Final webhook delivered successfully.");
}
