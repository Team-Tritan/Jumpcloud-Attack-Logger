"use strict";

export interface Config {
  webhook: string;
  jc_username: string;
  jc_password: string;
  port: number;
  mail_enabled: boolean;
  mail_server: string;
  mail_port: number;
  mail_tls: boolean;
  mail_user: string;
  mail_pass: string;
  send_from: string;
}

export interface ipLookupRes {
  org: string;
  asn: string;
  org_id: string;
}

export interface collectedData {
  ip: string;
  lookup: {
    asn: string;
    org: string;
    org_id: string;
  };
  description: string;
  location: {
    region_name: string;
    country_code: string;
  };
  systemHostname: string;
  timestamp: string;
}
