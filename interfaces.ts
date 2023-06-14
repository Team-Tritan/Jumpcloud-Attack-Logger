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
}

export interface ipLookupRes {
  org: string;
  asn: string;
  org_id: string;
}

export interface collectedData {
  ip: string;
  asn: {
    asn: string;
    org: string;
    org_id: string;
  };
  attackDescription: string;
  attackLocation: {
    region_name: string;
    country_code: string;
  };
  systemHostname: string;
  timestamp: string;
}