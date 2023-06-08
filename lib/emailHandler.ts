"use strict";

import axios, { AxiosResponse } from "axios";
import asnLookup from "../utils/ipLookup";
import nodemailer from "nodemailer";
import { config } from "../config";

export default async function abuseReports(ip: string) {
  if (!config.mail_enabled || !ip || ip === "") return;

  const asn = await asnLookup(ip);

  try {
    const abuseLookupResponse = await axios.get(
      `https://whois.arin.net/rest/org/${asn?.org_id}/pocs.json`
    );
    const abuseLookup = abuseLookupResponse.data;

    await Promise.all(
      abuseLookup.pocs.pocLinkRef.map(async (poc: any) => {
        if (poc["@description"] === "Abuse") {
          const link = poc["$"];

          try {
            const pocRecordResponse = await axios.get(`${link}.json`);
            const pocRecord = pocRecordResponse.data;
            const email = pocRecord.poc.emails.email["$"];

            if (!email) return;

            const subject = `Abuse Report: IP Address ${ip}`;
            const message = `
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

            const validEmailDomains = [
              "arin.net",
              "ripe.net",
              "apnic.net",
              "lacnic.net",
              "afrinic.net",
            ];
            if (validEmailDomains.some((domain) => email?.endsWith(domain)))
              return;

            await sendReport(email, message, subject);
          } catch (error) {
            return;
          }
        }
      })
    );
  } catch (error) {
    return;
  }
}

async function sendReport(email: string, message: string, subject: string) {
  const transporter = nodemailer.createTransport({
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

  const emailPayload = {
    to: email,
    from: config.mail_user,
    subject: subject,
    text: message,
  };

  transporter.sendMail(emailPayload, (error: any, info: any) => {
    if (error) {
      return;
    } else {
      return console.log(
        `Abuse email sent to ${emailPayload.to} - ` + info.response
      );
    }
  });
}
