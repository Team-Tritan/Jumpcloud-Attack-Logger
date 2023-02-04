"use strict";

import puppeteer from "puppeteer";
import { jc_username, jc_password } from "../config";
import { exec } from "child_process";

export default async function downloadLogs() {
  let browser = await puppeteer.launch({ headless: false });
  let page = await browser.newPage();

  // tell user stuff
  console.log(
    "Logging into jumpcloud & downloading logs in emulated browser..."
  );
  // set viewport and user agent (just in case for nice viewing)
  await page.setViewport({ width: 1280, height: 800 });
  // start
  await page.goto("https://console.jumpcloud.com/login/admin");
  // waii
  await sleep(5000);
  // username
  await page.focus(
    "xpath//html/body/div/section/div/div/form/fieldset[1]/div/input"
  );
  await page.keyboard.type(jc_username);
  // pass
  await page.focus(
    "xpath//html/body/div/section/div/div/form/fieldset[2]/div/input"
  );
  await page.keyboard.type(jc_password);
  // login button
  await page.click("xpath//html/body/div/section/div/div/form/button");
  // waii
  await sleep(5000);
  // logs button
  await page.click("xpath//html/body/div/div[4]/nav/div/div[7]/ul/li[1]/div/a");
  // waii
  await sleep(5000);
  // filter for attacks
  await page.click(
    "xpath//html/body/div/div[4]/main/div[1]/div[3]/div/div[1]/div[1]/div[1]/div[2]/button"
  );
  await page.click(
    "xpath///html/body/div/div[4]/main/div[1]/div[3]/div/div[1]/div[1]/div[1]/div[2]/div/div/div[1]/ul/li/span"
  );
  // waii
  await sleep(2000);
  // download
  await page.click(
    "xpath//html/body/div/div[4]/main/div[1]/div[3]/div/div[4]/div[1]/div/div[2]/a/span"
  );
  await page.click(
    "xpath///html/body/div/div[4]/main/div[1]/div[3]/div/div[4]/div[1]/div/div[2]/ul/li/menu/li[1]/a/div/span"
  );
  // waii
  await sleep(30000);
  // move file from downloads to dump
  console.log("Moving file from ~/Downloads to ./dump");
  exec("mv ~/Downloads/*.json ./dump/");
  // waii
  await sleep(5000);
  // close browser
  await browser.close();
}

export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
