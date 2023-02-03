"use strict";

import grabDumpedLogs, { serveIPList } from "./lib/grabDumpedLogs";
import downloadLogs from "./lib/downloadLogs";

(async () => {
  //await downloadLogs();
  await grabDumpedLogs();
  await serveIPList();
})();
