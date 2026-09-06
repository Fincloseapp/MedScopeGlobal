#!/usr/bin/env node
/**
 * Create Stripe webhook endpoint for Cloudflare production.
 * Reads STRIPE_SECRET_KEY from .env.local — never commits secrets.
 *
 * Usage: node scripts/setup-stripe-webhook.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { dataPath, projectPath } from "../lib/config/paths.mjs";

const envPath = projectPath(".env.local");
const secretFile = dataPath("secrets", "stripe-webhook-secret.txt");
const stripeDocPath = dataPath("docs", "v29-stripe-setup.md");

function loadEnv() {
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const WEBHOOK_URL = "https://www.medscopeglobal.com/api/stripe/webhook";
const WEBHOOK_URL_ALIASES = [
  WEBHOOK_URL,
  "https://medscopeglobal.com/api/stripe/webhook",
];
const EVENTS = [
  "checkout.session.completed",
  "invoice.paid",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
];

async function main() {
  const env = loadEnv();
  const stripeKey = env.STRIPE_SECRET_KEY?.trim();

  if (!stripeKey) {
    console.error("STRIPE_SECRET_KEY missing in .env.local");
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${stripeKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const listRes = await fetch("https://api.stripe.com/v1/webhook_endpoints?limit=20", { headers });
  const listJson = await listRes.json();

  let     endpoint = (listJson.data ?? []).find((e) => WEBHOOK_URL_ALIASES.includes(e.url));
  let signingSecret;

  if (endpoint) {
    console.log(`Existing webhook: ${endpoint.id} → ${endpoint.url}`);
    const secretPath = secretFile;
    signingSecret = fs.existsSync(secretPath) ? fs.readFileSync(secretPath, "utf8").trim() : endpoint.secret;
  } else {
    const body = new URLSearchParams();
    body.set("url", WEBHOOK_URL);
    body.set("enabled_events[]", EVENTS[0]);
    for (let i = 1; i < EVENTS.length; i++) {
      body.append("enabled_events[]", EVENTS[i]);
    }
    body.set("description", "MedScopeGlobal v29.0 production webhook");

    const createRes = await fetch("https://api.stripe.com/v1/webhook_endpoints", {
      method: "POST",
      headers,
      body,
    });
    const created = await createRes.json();
    if (!createRes.ok) {
      console.error("Stripe webhook create failed:", created);
      process.exit(1);
    }
    endpoint = created;
    signingSecret = created.secret;
    console.log(`Created webhook: ${created.id}`);

    const secretDir = dataPath("secrets");
    fs.mkdirSync(secretDir, { recursive: true });
    fs.writeFileSync(secretFile, signingSecret);
    console.log(`Secret saved to ${secretFile}`);
  }

  if (!signingSecret) {
    console.warn("Signing secret not returned — retrieve from Stripe Dashboard → Webhooks → Reveal secret");
  } else {
    console.log(`Signing secret: ${signingSecret.slice(0, 12)}… (not logged in full)`);

    const docPath = stripeDocPath;
    let doc = fs.existsSync(docPath) ? fs.readFileSync(docPath, "utf8") : "";
    if (!doc.includes(endpoint.id)) {
      doc += `\n\n## Auto-setup ${new Date().toISOString()}\n- Webhook ID: \`${endpoint.id}\`\n- URL: \`${WEBHOOK_URL}\`\n`;
      fs.mkdirSync(path.dirname(docPath), { recursive: true });
      fs.writeFileSync(docPath, doc.trim() + "\n");
    }

    if (signingSecret) {
      console.log("Set STRIPE_WEBHOOK_SECRET on the Cloudflare Worker (pnpm cf:env:sync or dashboard).");
    }
  }

  console.log("\nDone. Webhook endpoint ID:", endpoint.id);
}

void main();
