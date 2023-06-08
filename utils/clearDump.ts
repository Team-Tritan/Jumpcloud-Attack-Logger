"use strict";

import { exec } from "child_process";

export default async function clearDumpCache() {
  console.log("Clearing dump directory...");
  exec("rm ./dump/*.json", (error, stdout, stderr) => {
    if (error) {
      console.error("Error clearing dump directory:", error);
    } else {
      console.log("Dump directory cleared.");
    }
  });

  return;
}
