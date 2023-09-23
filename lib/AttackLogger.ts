"use strict";

import dataDownload from "./handlers/dataDownload";
import dataHandler, { api } from "./handlers/dataHandler";
import clearDumpCache from "../utils/clearDump";

export default class AttackLogger {
  constructor() {
    this.start();
  }

  async init() {
    await dataDownload();
    await dataHandler();
    await api();
  }

  async start() {
    await this.init();

    setInterval(async () => {
      await this.init();
    }, 1000 * 60 * 60 * 24);

    setInterval(async () => {
      await clearDumpCache();
    }, 1000 * 60 * 60 * 23);
  }
}
