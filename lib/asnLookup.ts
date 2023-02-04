"use strict";

import axios from "axios";

export default async function getASNInfo(ip: string) {
  try {
    let response = await axios.get(`https://whois.arin.net/rest/ip/${ip}.json`);

    let name = response.data?.net?.orgRef?.["@name"] || "ISP Unknown to ARIN";
    let number =
      response.data?.net?.originASes?.originAS?.["$"] || "AS Unknown to ARIN";

    return { name, number };
  } catch (error) {
    let name = "ARIN API Rate Limited";
    let number = "";

    return { name, number };
  }
}
