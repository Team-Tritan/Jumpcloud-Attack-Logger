"use strict";

import { Database } from "quickmongo";
import { mongodb } from "../config";

export default async function database() {
  let db = new Database(mongodb);

  db.on("ready", () => {
    console.log("App to the database");
  });

  await db.connect();

  return db;
}

export async function push(ip: any) {
  let db = await database();
  db.push("ip", ip);
}

export async function includes(ip: any) {
  let db = await database();
  return db.has(ip);
}

export async function all() {
  let db = await database();
  return db.all();
}
