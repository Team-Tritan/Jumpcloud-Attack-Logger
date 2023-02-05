"use strict";

import dataDownload from "./lib/dataDownload";
import dataHandler, { serveIPList } from "./lib/dataHandler";

setInterval(async function init() {
  await dataDownload();
  await dataHandler();
  await serveIPList();
}, 1000 * 60 * 60 * 24);
