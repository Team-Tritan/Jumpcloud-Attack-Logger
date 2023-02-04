"use strict";

import axios from "axios";

export default async function postHastebin(
  webhook: string,
  alreadyPosted: any
) {
  let data = JSON.stringify(alreadyPosted);

  let response = await axios.post("https://bin.tritan.gg/documents", data);
  let url = "https://bin.tritan.gg" + response.data.key;

  let d = new Date();

  await axios.post(
    webhook,
    JSON.stringify({
      content: `**${
        alreadyPosted.length
      } Failed Attacks on ${d.toDateString()}**\n\nIP Dump: ${url}`,
    })
  );
}
