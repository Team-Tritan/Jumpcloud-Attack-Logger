"use strict";

import dataDownload from "./dataDownload";
import dataHandler, { serveIPList } from "./dataHandler";
import clearDumpCache from "../utils/clearDump";

export default class AttackLogger {
  async initialize() {
    await dataDownload();
    await dataHandler();
    await serveIPList();
  }

  async start() {
    await this.initialize();

    setInterval(async () => {
      await this.initialize();
    }, 1000 * 60 * 60 * 24);

    setInterval(async () => {
      await clearDumpCache();
    }, 1000 * 60 * 60 * 23);
  }
}
