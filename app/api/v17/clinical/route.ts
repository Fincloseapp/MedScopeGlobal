import clinicalJob from "@/jobs/v17/clinicalJob";
import { createV17ProductionRoute } from "@/lib/v17/production/create-v17-production-route";

const { GET, POST } = createV17ProductionRoute(
  "clinical",
  (input) => clinicalJob(input),
  "V17 EIL endpoint ready. Use POST with { input } to run clinical inference."
);

export { GET, POST };
