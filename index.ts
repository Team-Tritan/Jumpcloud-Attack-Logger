"use strict";

import grabDumpedLogs, { serveIPList } from "./lib/grabDumpedLogs";
import downloadLogs, { sleep } from "./lib/downloadLogs";

(async () => {
  await downloadLogs();
  await sleep(10000);
  await grabDumpedLogs();
  await serveIPList();
})();
