#!/usr/bin/env node
import crypto from "node:crypto";

export function buildHash(section, title, contentType = "article") {
  const raw = [section, contentType, title].join("|").toLowerCase();
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 24);
}
