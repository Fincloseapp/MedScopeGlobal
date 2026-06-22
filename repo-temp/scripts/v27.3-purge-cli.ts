import { runImagePurge } from "@/lib/v27/image-purge";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const report = await runImagePurge({ dryRun, maxArticles: 500 });
  const totalPurged = report.coverUrlsNulled + report.otherUrlsNulled + report.contentImagesStripped;

  console.log(
    JSON.stringify(
      {
        ok: report.ok,
        dryRun,
        scannedArticles: report.scannedArticles,
        scannedOtherTables: report.scannedOtherTables,
        coverUrlsNulled: report.coverUrlsNulled,
        otherUrlsNulled: report.otherUrlsNulled,
        contentImagesStripped: report.contentImagesStripped,
        totalPurged,
        storageDeleted: report.storageDeleted,
        storageSkipped: report.storageSkipped,
        errors: report.errors.slice(0, 20),
        at: report.at,
      },
      null,
      2
    )
  );

  process.exit(report.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
