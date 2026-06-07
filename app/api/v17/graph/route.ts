import graphBuildJob from "@/jobs/v17/graphBuildJob";
import { createV17ProductionRoute } from "@/lib/v17/production/create-v17-production-route";

const { GET, POST } = createV17ProductionRoute(
  "graph",
  (input) => graphBuildJob(input),
  "V17 MKG endpoint ready. Use POST with { input } to build the knowledge graph."
);

export { GET, POST };
