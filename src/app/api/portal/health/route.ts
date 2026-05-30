import { withPortalApi } from "@/lib/portal/api-handler";
import { buildPortalHealthResponse } from "@/lib/portal/health-response";

export async function GET() {
  return withPortalApi(buildPortalHealthResponse);
}
