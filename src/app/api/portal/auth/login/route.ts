import { withPortalApi } from "@/lib/portal/api-handler";
import { createSessionToken, toSessionUser, verifyPassword } from "@/lib/portal/auth";
import { errorResponse, jsonResponse } from "@/lib/portal/request";
import { getUserByEmail } from "@/lib/portal/repository";
import { loginSchema } from "@/lib/portal/validation";

export async function POST(request: Request) {
  return withPortalApi(async () => {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Neplatná data");

    const user = await getUserByEmail(parsed.data.email);
    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return errorResponse("Neplatný e-mail nebo heslo", 401);
    }

    const sessionUser = toSessionUser(user);
    const token = createSessionToken(sessionUser);

    return jsonResponse(
      { user: sessionUser },
      {
        headers: {
          "Set-Cookie": `medscope_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
        }
      }
    );
  });
}
