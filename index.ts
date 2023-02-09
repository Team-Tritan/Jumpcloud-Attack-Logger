"use strict";

import dataDownload from "./lib/dataDownload";
import dataHandler, { serveIPList } from "./lib/dataHandler";
import clearDumpCache from "./utils/clearDump";
import emailAbuseReports from "./utils/abuseReports";

// (async () => {
//   await dataDownload();
//   await dataHandler();
//   await serveIPList();
// })();

setInterval(async function init() {
  await dataDownload();
  await dataHandler();
  await serveIPList();
}, 1000 * 60 * 60 * 24);

setInterval(async function clearDump() {
  await clearDumpCache();
}, 1000 * 60 * 60 * 23);

emailAbuseReports("23.142.248.1");
