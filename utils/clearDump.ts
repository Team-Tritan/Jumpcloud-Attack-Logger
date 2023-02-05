"use strict";

import { exec } from "child_process";

export default async function clearDumpCache() {
  console.log("Clearing dump directory...");
  exec("rm ./dump/*.json");
}
