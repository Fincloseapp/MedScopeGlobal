import { runV25ImagePipeline } from "@/lib/v25/images/pipeline";

const max = Number(process.argv[2] ?? 80);

async function main() {
  console.log(`\n=== v25 image backfill (max ${max}) ===\n`);
  const result = await runV25ImagePipeline({ maxGenerate: max });
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        detail: result.detail,
        generated: result.report.generated,
        assigned: result.report.assigned,
        failed: result.report.failed,
        legacyQueued: result.report.missingBefore,
      },
      null,
      2
    )
  );
  process.exit(result.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
