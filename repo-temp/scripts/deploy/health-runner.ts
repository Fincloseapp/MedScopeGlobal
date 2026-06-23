import { runHealthcheck } from "@/lib/v17/health/healthcheck";

async function main() {
  const result = await runHealthcheck();
  console.log(JSON.stringify(result));
  process.exit(result.status === "unhealthy" ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
