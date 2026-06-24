import type { V24ContentDraft, V24ImageArtifact } from "@/lib/v24/types";
import { writeV24Json, v24DataPath, imagePath } from "@/lib/v24/data-store";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateDiagramSvg } from "@/lib/v24/engines/images/diagram-generator";
import { filterSafeImage } from "@/lib/v24/engines/images/safe-filter";
import { buildIllustrationMeta } from "@/lib/v24/engines/images/medical-illustrator";

export function runV24ImagePipeline(draft: V24ContentDraft): V24ImageArtifact {
  const meta = buildIllustrationMeta(draft);
  const svg = generateDiagramSvg(draft, meta);
  const safe = filterSafeImage(svg, meta.alt);

  const rel = imagePath(draft.section, draft.topicHash, "svg");
  const full = v24DataPath(rel);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, svg, "utf8");
  writeV24Json(rel.replace(/\.svg$/, ".meta.json"), meta);

  return { path: rel, alt: meta.alt, safe: safe.passed };
}
