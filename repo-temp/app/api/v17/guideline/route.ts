import guidelineJob from "@/jobs/v17/guidelineJob";
import { createV17ProductionRoute } from "@/lib/v17/production/create-v17-production-route";

const { GET, POST } = createV17ProductionRoute(
  "guideline",
  (input) => guidelineJob(input),
  "V17 guideline endpoint ready. Use POST with { input }."
);

export { GET, POST };
