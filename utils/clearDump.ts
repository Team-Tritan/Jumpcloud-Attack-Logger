"use strict";

import { exec } from "child_process";

export default async function clearDumpCache() {
  console.log("Clearing dump directory...");
  exec("rm ./dump/*.json", (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error("Error clearing dump directory:", error);
    } else {
      console.log("Dump directory cleared.");
    }
  });

  return;
}
