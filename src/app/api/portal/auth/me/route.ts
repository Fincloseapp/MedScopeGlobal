import { getSessionUserFromRequest, jsonResponse } from "@/lib/portal/request";

export async function GET(request: Request) {
  const user = getSessionUserFromRequest(request);
  return jsonResponse({ user });
}
