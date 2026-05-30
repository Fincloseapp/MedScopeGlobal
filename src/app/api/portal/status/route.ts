import { getPortalHealthResponse } from "@/lib/portal/health-response";

export async function GET() {
  return getPortalHealthResponse();
}
