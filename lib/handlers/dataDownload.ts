"use strict";

import puppeteer from "puppeteer";
import { config } from "../../config";
import { exec } from "child_process";

export default async function downloadLogs() {
  let browser = await puppeteer.launch({
    headless: false,
  });

  let page = await browser.newPage();

  console.log(
    "Logging into jumpcloud & downloading logs in emulated browser..."
  );

  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("https://console.jumpcloud.com/login/admin");
  await sleep(5000);

  await page.focus(
    "xpath//html/body/div/section/div/div/form/fieldset[1]/div/input"
  );
  await page.keyboard.type(config.jc_username);
  await page.focus(
    "xpath//html/body/div/section/div/div/form/fieldset[2]/div/input"
  );
  await page.keyboard.type(config.jc_password);
  await page.click("xpath//html/body/div/section/div/div/form/button");
  await sleep(5000);

  await page.click(
    "xpath///html/body/div/div[1]/div[4]/nav/div/div[7]/ul/li[1]/div/a/span"
  );
  await sleep(5000);

  await page.click(
    "xpath///html/body/div/div[1]/div[4]/main/div[1]/div[3]/div/div[1]/div[1]/div[1]/div[2]/button"
  );
  await page.click(
    "xpath///html/body/div/div[1]/div[4]/main/div[1]/div[3]/div/div[1]/div[1]/div[1]/div[2]/div/div/div[1]/ul/li/span"
  );
  await sleep(2000);

  await page.click(
    "xpath///html/body/div/div[1]/div[4]/main/div[1]/div[3]/div/div[4]/div[1]/div/div[2]/a/span"
  );
  await page.click(
    "xpath///html/body/div/div[1]/div[4]/main/div[1]/div[3]/div/div[4]/div[1]/div/div[2]/ul/li/menu/li[1]/a/div/span"
  );
  await sleep(30000);

  console.log("Moving file from ~/Downloads to ./dump");
  exec("mv ~/Downloads/*.json ./dump/");
  await sleep(5000);

  await browser.close();
  await sleep(15000);
}

export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
