#!/usr/bin/env node

/** Set STRIPE_WEBHOOK_SECRET on Vercel via REST API (no npx required). */

import fs from "node:fs";

import path from "node:path";

import { dataPath, projectPath } from "../lib/config/paths.mjs";



const envPath = projectPath(".env.local");

const secretFile = dataPath("secrets", "stripe-webhook-secret.txt");



function loadEnv() {

  const env = {};

  if (!fs.existsSync(envPath)) return env;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {

    const m = line.match(/^([^#=]+)=(.*)$/);

    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");

  }

  return env;

}



async function main() {

  const env = loadEnv();

  const vercelToken = env.VERCEL_TOKEN?.trim();

  const projectId = env.VERCEL_PROJECT_ID?.trim() ?? "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";

  const teamId = env.VERCEL_ORG_ID?.trim() ?? "team_m1FSjvKjWV9Wgm1WhEycgHqJ";



  let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!webhookSecret && fs.existsSync(secretFile)) {

    webhookSecret = fs.readFileSync(secretFile, "utf8").trim();

  }



  if (!webhookSecret) {

    console.error("No webhook secret — run setup-stripe-webhook.mjs first or set STRIPE_WEBHOOK_SECRET");

    process.exit(1);

  }



  if (!vercelToken) {

    fs.mkdirSync(path.dirname(secretFile), { recursive: true });

    fs.writeFileSync(secretFile, webhookSecret);

    console.error("VERCEL_TOKEN missing — secret saved to", secretFile);

    process.exit(1);

  }



  const url = `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}`;

  const res = await fetch(url, {

    method: "POST",

    headers: {

      Authorization: `Bearer ${vercelToken}`,

      "Content-Type": "application/json",

    },

    body: JSON.stringify({

      key: "STRIPE_WEBHOOK_SECRET",

      value: webhookSecret,

      type: "encrypted",

      target: ["production", "preview", "development"],

    }),

  });



  const json = await res.json();

  if (!res.ok) {

    console.error("Vercel API error:", json);

    process.exit(1);

  }

  console.log("STRIPE_WEBHOOK_SECRET set on Vercel:", json.created?.key ?? "ok");

}



void main();

