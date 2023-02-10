"use strict";

import axios from "axios";
import { exec } from "child_process";

export default async function postHastebin(
  webhook: string,
  alreadyPosted: any[]
) {
  let dumpData = JSON.stringify({ attacker_ips: alreadyPosted });

  let response = await axios.post("https://bin.tritan.gg/documents", dumpData);
  let url = ("https://bin.tritan.gg/raw/" + response.data.key) as string;

  let d = new Date();
  let date = d.toLocaleDateString();

  let payload = [
    {
      author: {
        name: `${date}`,
        url: url as string,
      },
      fields: [
        {
          name: "Data Dump:",
          value: url as string,
        },
      ],
      color: 0x8953fb,
    },
  ];

  let webhookData = JSON.stringify({ content: null, embeds: payload });

  await axios.post(webhook, webhookData, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  exec(`echo "${date} - ${url}" >> ./dump/hastebin_urls.txt`);

  console.log("Final webhook delivered successfully.");

  return;
}
