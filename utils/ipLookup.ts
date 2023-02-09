"use strict";

import axios from "axios";

export interface asnLookup {
  org: string;
  asn: string;
  org_id: string;
}

export default async function getIPInfo(ip: string) {
  try {
    let response = await axios.get(`https://whois.arin.net/rest/ip/${ip}.json`);

    let org = response.data?.net?.orgRef?.["@name"] || "ISP Unknown to ARIN";
    let asn =
      response.data?.net?.originASes?.originAS?.["$"] || "AS Unknown to ARIN";

    let org_id = response.data?.net?.orgRef?.["@handle"] || null;

    return { org, asn, org_id } as asnLookup;
  } catch (error) {
    let org = "ARIN API Rate Limited";
    let asn = "";
    let org_id = "";

    return { org, asn, org_id } as asnLookup;
  }
}
