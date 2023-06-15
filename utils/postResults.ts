"use strict";

import axios from "axios";
import { exec } from "child_process";

export default async function postResults(
  webhook: string,
  alreadyPosted: any
): Promise<void> {
  if (!webhook) return;
  if (webhook === "") return;

  const dumpData = JSON.stringify(alreadyPosted);

  const response = await axios.post(
    "https://bin.tritan.gg/documents",
    dumpData
  );
  const url = "https://bin.tritan.gg/json/" + response.data.key;

  const d = new Date();
  const date = d.toLocaleDateString();

  let payload = [
    {
      color: 0x5865f2,
      title: `Data Dump`,
      image: {
        url: "https://im.horny.rip/api/content/raw/RHNXxg79vS.png",
      },
      description: `${url}`,
    },
  ];

  const webhookData = JSON.stringify({ content: null, embeds: payload });

  try {
    await axios.post(webhook, webhookData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e: any) {
    console.error(`Final embed error: `, e);
  }

  exec(`echo "${date} - ${url}" >> ./dump/hastebin_urls.txt`);

  console.log("Final webhook delivered successfully.");
}
