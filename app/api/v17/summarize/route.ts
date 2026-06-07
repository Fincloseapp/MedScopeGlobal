import summarizationJob from "@/jobs/v17/summarizationJob";
import { createV17ProductionRoute } from "@/lib/v17/production/create-v17-production-route";

const { GET, POST } = createV17ProductionRoute(
  "summarize",
  (input) => summarizationJob(input),
  "V17 summarization endpoint ready. Use POST with { input }."
);

export { GET, POST };
