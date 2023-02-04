"use strict";

import axios from "axios";

export default async function postHastebin(
  webhook: string,
  alreadyPosted: any
) {
  let data = JSON.stringify(alreadyPosted);

  let response = await axios.post("https://bin.tritan.gg/documents", data);
  let url = "https://bin.tritan.gg/" + response.data.key;

  let d = new Date();
  let date = d.toLocaleDateString();

  await axios.post(webhook, {
    content: `**${alreadyPosted.length} failed attacks on ${date}**\nAttacker IP Dump: ${url}`,
  });
}
