import assert from "node:assert/strict";
import { resolveWriterAgent, resolveWritingStyle } from "../../lib/editorial/writer-agents";

const lifestyle = resolveWriterAgent({ public_topic: "zivotni-styl", metadata: {} });
assert.equal(lifestyle?.id, "writer1");

const longevity = resolveWriterAgent({
  public_topic: "zivotni-styl",
  metadata: { content_pillar: "dlouhovekost" },
});
assert.equal(longevity?.id, "writer5");

const persisted = resolveWriterAgent({
  public_topic: "nemoci",
  metadata: { writer_id: "writer4" },
});
assert.equal(persisted?.id, "writer4");

const style = resolveWritingStyle({ metadata: { writing_style: "analytik" } });
assert.equal(style?.label, "Analytik");

const unknown = resolveWriterAgent({ public_topic: null, metadata: {} });
assert.equal(unknown, null);

console.log("writer-agents-check ok");
