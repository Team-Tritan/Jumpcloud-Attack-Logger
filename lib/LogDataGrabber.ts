"use strict";

import fs from "fs";
import path from "path";
import axios from "axios";
import { webhook } from "../config";

let directoryPath = path.join(__dirname, "../dump");
let alreadyPosted: any[] = [];

export default function init() {
  console.log("Starting log grabber...");

  fs.readdir(directoryPath, function (err, files) {
    console.log("Reading directory: " + directoryPath);

    if (err) return console.error("Unable to scan: " + err);

    files.forEach(function (file) {
      if (path.extname(file) === ".json") {
        console.log("Reading file: " + file);

        fs.readFile(
          path.join(directoryPath, file),
          "utf-8",
          async function (error, data) {
            if (error) return console.error("Unable to read: " + error);

            let jsonData = JSON.parse(data);

            let i = 0;
            let post = async () => {
              if (i === jsonData.length) return;

              let item = jsonData[i];
              if (alreadyPosted.includes(item.src_ip)) {
                i++;
                post();
              }

              let asn_lookup = await getASNInfo(item.src_ip);

              let payload = [
                {
                  title: ("Failed Attack - " + item.process_name) as string,
                  description: `**${item.message}**` as string,
                  color: 0x5865f2,
                  fields: [
                    {
                      name: "Timestamp" as string,
                      value: ("```" + item.system_timestamp + "```") as string,
                      inline: false,
                    },
                    {
                      name: "Attacker ASN Whois" as string,
                      value: ("```" +
                        asn_lookup?.name +
                        "\n\n" +
                        asn_lookup?.number +
                        "```") as string,
                      inline: false,
                    },
                    {
                      name: "Attacker IP" as string,
                      value: item.src_ip as string,
                      inline: true,
                    },
                    {
                      name: "Attacker Location" as string,
                      value: `${item.src_geoip.region_name || "Unknown"}, ${
                        item.src_geoip.country_code
                      }` as string,
                      inline: true,
                    },
                    {
                      name: "Target System" as string,
                      value: item.system.hostname as string,
                      inline: true,
                    },
                  ],
                },
              ];

              console.log("Sending webhook to Discord...");
              let data = JSON.stringify({ content: null, embeds: payload });

              let config = {
                method: "POST",
                url: webhook,
                headers: { "Content-Type": "application/json" },
                data: data,
              };

              await axios(config).catch((error) => {
                if (error.response.status === 429) {
                  console.log("Webhook rate limited, retrying in 60 seconds");
                  setTimeout(post, 60000);
                  return;
                }
              });

              console.log("Webhook delivered successfully");
              alreadyPosted.push(item.src_ip);
              i++;

              setTimeout(post, 30000);
            };

            await post();
          }
        );
      }
    });
  });
}

async function getASNInfo(ip: string) {
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
