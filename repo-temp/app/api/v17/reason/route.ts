import reasoningJob from "@/jobs/v17/reasoningJob";
import { createV17ProductionRoute } from "@/lib/v17/production/create-v17-production-route";

const { GET, POST } = createV17ProductionRoute(
  "reason",
  (input) => reasoningJob(input),
  "V17 reasoning endpoint ready. Use POST with { input }."
);

export { GET, POST };
