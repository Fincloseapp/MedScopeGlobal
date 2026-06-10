#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { DATA_ROOT } from "../v24/_paths.mjs";

const MAP = join(DATA_ROOT, "topic-map", "index.json");

export function loadMap() {
  if (!existsSync(MAP)) return {};
  return JSON.parse(readFileSync(MAP, "utf8"));
}

export function saveTopic(hash, section, title) {
  const map = loadMap();
  map[hash] = { section, title, at: new Date().toISOString() };
  mkdirSync(join(DATA_ROOT, "topic-map"), { recursive: true });
  writeFileSync(MAP, JSON.stringify(map, null, 2));
}
