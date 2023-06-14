"use strict";

export interface ipLookupRes {
  org: string;
  asn: string;
  org_id: string;
}

export interface collectedData {
  ip: string;
  asn: any;
  attackDescription: string;
  attackLocation: any;
  systemHostname: string;
  timestamp: string;
}
