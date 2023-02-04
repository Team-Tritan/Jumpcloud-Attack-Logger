"use strict";

import handleDumpedLogs, { serveIPList } from "./lib/handleDumpedLogs";
import downloadLogs, { sleep } from "./lib/downloadLogs";

(async () => {
  await downloadLogs();
  await sleep(10000);
  await handleDumpedLogs();
  await serveIPList();
})();
