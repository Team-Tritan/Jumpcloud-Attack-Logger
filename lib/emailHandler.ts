"use strict";

import axios, { AxiosResponse } from "axios";
import asnLookup from "../utils/ipLookup";
import nodemailer from "nodemailer";
import { config } from "../config";

export default async function abuseReports(ip: string) {
  if (!config.mail_enabled) return;

  if (!ip) return;
  if (ip === "") return;

  let asn = await asnLookup(ip);

  let abuse_lookup = await axios
    .get(`https://whois.arin.net/rest/org/${asn?.org_id}/pocs.json`)
    .then(async (response: AxiosResponse) => {
      return response.data;
    })
    .catch((error: any) => {
      return;
    });

  try {
    Promise.all(
      abuse_lookup.pocs.pocLinkRef.map(async (poc: any) => {
        let err: boolean = false;

        if (poc["@description"] === "Abuse") {
          let link = poc["$"];

          let poc_record = await axios
            .get(`${link}.json`)
            .then((response) => {
              return response.data;
            })
            .catch((error: any) => {
              return (err = true);
            });

          let email = poc_record.poc.emails.email["$"];

          if (!email) return;
          if (err) return;

          let subject = `Abuse Report: IP Address ${ip}`;
          let message = `
ARIN Abuse Contact,

This email is regarding ${ip} - ${asn?.asn} - ${asn?.org}

I am writing to bring to your attention a serious security issue that has been detected in our network. Our security team has identified that the IP address ${ip} is being used to carry out either Distributed Denial of Service (DDOS) attacks or to spam failed login attempts, which is an attempt to brute force into our systems.

The DDOS attack can cause a significant disruption to our network and prevent legitimate users from accessing our services. On the other hand, the brute force attack could lead to a potential data breach if successful, putting sensitive information at risk.

We request that you take immediate action to secure your system and stop any unauthorized use of the IP address ${ip}. If you are unaware of any activities from this IP address, it is possible that your system has been compromised and is being used without your knowledge. We advise you to run a thorough security check and take the necessary measures to secure your system.

Please let us know if you need any assistance in resolving this matter. Our security team is ready to provide you with any support that you may require.

We take the security of our network and customer data very seriously, and we are committed to working with you to ensure the integrity of our systems.

Thank you for your prompt attention to this matter.

Sincerely,
Handu Kungan Parjeet
Chief Security Advisor
Tritan Development
      `;

          if (email?.endsWith("arin.net")) return;
          if (email?.endsWith("ripe.net")) return;
          if (email?.endsWith("apnic.net")) return;
          if (email?.endsWith("lacnic.net")) return;
          if (email?.endsWith("afrinic.net")) return;

          await sendReport(email, message, subject);
        }
      })
    );
  } catch (error) {
    return;
  }
}

export async function sendReport(
  email: string,
  message: string,
  subject: string
) {
  let transporter = nodemailer.createTransport({
    host: config.mail_server,
    port: config.mail_port,
    secure: config.mail_tls,
    auth: {
      user: config.mail_user,
      pass: config.mail_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let email_payload = {
    to: email,
    from: config.mail_user,
    subject: subject,
    text: message,
  };

  transporter.sendMail(email_payload, (error: any, info: any) => {
    if (error) {
      return;
    } else {
      return console.log(
        `Abuse email sent to ${email_payload.to} - ` + info.response
      );
    }
  });
}
