import { hasPermission } from "@/lib/portal/rbac";
import { errorResponse, getSessionUserFromRequest, jsonResponse } from "@/lib/portal/request";
import { listPendingExperts, updateUser } from "@/lib/portal/store";

export async function GET(request: Request) {
  const user = getSessionUserFromRequest(request);
  if (!user || !hasPermission(user, "admin:verify-experts")) return errorResponse("Přístup odepřen", 403);
  return jsonResponse({ experts: listPendingExperts() });
}

export async function POST(request: Request) {
  const user = getSessionUserFromRequest(request);
  if (!user || !hasPermission(user, "admin:verify-experts")) return errorResponse("Přístup odepřen", 403);

  const body = await request.json().catch(() => null) as { userId?: string; action?: "approve" | "reject" } | null;
  if (!body?.userId || !body.action) return errorResponse("Neplatná data");

  const updated = updateUser(body.userId, {
    verificationStatus: body.action === "approve" ? "approved" : "rejected"
  });

  return jsonResponse({ user: { id: updated.id, email: updated.email, verificationStatus: updated.verificationStatus } });
}
