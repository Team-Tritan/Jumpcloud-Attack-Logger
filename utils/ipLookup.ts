"use strict";

import axios from "axios";
import * as i from "../interfaces";

export default async function getIPInfo(ip: string): Promise<i.ipLookupRes> {
  if (!ip) return { org: "", asn: "", org_id: "" };

  try {
    const response = await axios.get(
      `https://whois.arin.net/rest/ip/${ip}.json`
    );

    const org = response.data?.net?.orgRef?.["@name"] || "ISP Unknown to ARIN";
    const asn =
      response.data?.net?.originASes?.originAS?.["$"] || "ASN Unknown to ARIN";
    const org_id = response.data?.net?.orgRef?.["@handle"] || "";

    return { org, asn, org_id };
  } catch (error) {
    const org = "ARIN API Rate Limited";
    const asn = "";
    const org_id = "";

    return { org, asn, org_id };
  }
}
