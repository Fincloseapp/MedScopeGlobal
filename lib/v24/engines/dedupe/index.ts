import type { V24ContentDraft } from "@/lib/v24/types";
import { readV24Json, writeV24Json, topicMapPath } from "@/lib/v24/data-store";
import { buildTopicHash } from "@/lib/v24/engines/dedupe/hash-generator";
import { similarityScore } from "@/lib/v24/engines/dedupe/similarity-checker";

type TopicMap = Record<string, { section: string; title: string; at: string }>;

export function loadTopicMap(): TopicMap {
  return readV24Json<TopicMap>(topicMapPath()) ?? {};
}

export function saveTopicMap(map: TopicMap) {
  writeV24Json(topicMapPath(), map);
}

export function checkGlobalDuplicate(draft: V24ContentDraft) {
  const map = loadTopicMap();
  const hash = draft.topicHash || buildTopicHash(draft);
  if (map[hash]) {
    return { duplicate: true, reason: `topic hash ${hash} exists in ${map[hash].section}` };
  }

  for (const [key, entry] of Object.entries(map)) {
    const sim = similarityScore(draft.title, entry.title);
    if (sim > 0.82 && entry.section !== draft.section) {
      return { duplicate: true, reason: `cross-section similarity ${sim.toFixed(2)} vs ${entry.title}` };
    }
    if (key === hash) return { duplicate: true, reason: "exact hash collision" };
  }

  return { duplicate: false, reason: "" };
}

export function registerTopic(draft: V24ContentDraft) {
  const map = loadTopicMap();
  const hash = draft.topicHash || buildTopicHash(draft);
  map[hash] = { section: draft.section, title: draft.title, at: new Date().toISOString() };
  saveTopicMap(map);
  return hash;
}

export { buildTopicHash } from "@/lib/v24/engines/dedupe/hash-generator";
