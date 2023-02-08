"use strict";

import axios from "axios";

export interface asnLookup {
  org: string;
  asn: string;
}

export default async function getASNInfo(ip: string) {
  try {
    let response = await axios.get(`https://whois.arin.net/rest/ip/${ip}.json`);

    let org = response.data?.net?.orgRef?.["@name"] || "ISP Unknown to ARIN";
    let asn =
      response.data?.net?.originASes?.originAS?.["$"] || "AS Unknown to ARIN";

    return { org, asn } as asnLookup;
  } catch (error) {
    let org = "ARIN API Rate Limited";
    let asn = "";

    return { org, asn } as asnLookup;
  }
}
