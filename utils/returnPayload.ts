"use strict";

import getASNInfo from "./asnLookup";

export interface JumpcloudData {
  message: string;
  system_timestamp: string;
  src_ip: string;
  src_geoip: {
    region_name: string;
    country_code: string;
  };
  system: {
    hostname: string;
  };
}

export default async function returnPayload(
  i: number,
  jsonData: JumpcloudData[],
  item: any
) {
  let asn_lookup = await getASNInfo(item.src_ip);

  return [
    {
      title: `${i} Unique Attacks / ${jsonData.length} Total | Ignoring Repeated IPs`,
      description: `**${item.message}**` as string,
      color: 0x5865f2,
      thumbnail: {
        url: "https://64.media.tumblr.com/505f72684d61f8ee355ce5ad5fdd2857/tumblr_nst7fsLmt01rglfeho1_1280.gif",
      },
      fields: [
        {
          name: "Timestamp" as string,
          value: ("```" + item.system_timestamp + "```") as string,
          inline: false,
        },
        {
          name: "ARIN ASN/ISP Whois" as string,
          value: ("```" +
            asn_lookup?.org +
            "\n\n" +
            asn_lookup?.asn +
            "```") as string,
          inline: false,
        },
        {
          name: "Attacker IP" as string,
          value: ("```" + item.src_ip + "```") as string,
          inline: true,
        },
        {
          name: "Attacker Location" as string,
          value: ("```" +
            `${item?.src_geoip?.region_name || "Unknown City"}, ${
              item?.src_geoip?.country_code || "Unknown Country"
            }` +
            "```") as string,
          inline: true,
        },
        {
          name: "Target System" as string,
          value: ("```" + item.system.hostname + "```") as string,
          inline: true,
        },
      ],
    },
  ];
}
