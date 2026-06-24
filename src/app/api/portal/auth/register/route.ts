import { hashPassword, createSessionToken, createUserId, toSessionUser } from "@/lib/portal/auth";
import { errorResponse, jsonResponse } from "@/lib/portal/request";
import { resolveVerificationStatus } from "@/lib/portal/rbac";
import { createUser, getUserByEmail } from "@/lib/portal/repository";
import { registerSchema } from "@/lib/portal/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Neplatná data");

  if (await getUserByEmail(parsed.data.email)) return errorResponse("Uživatel s tímto e-mailem již existuje", 409);

  const verificationStatus = resolveVerificationStatus(parsed.data.email, parsed.data.role);
  const user = await createUser({
    id: createUserId(),
    email: parsed.data.email.toLowerCase(),
    passwordHash: hashPassword(parsed.data.password),
    name: parsed.data.name,
    role: parsed.data.role,
    verificationStatus,
    institution: parsed.data.institution,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const sessionUser = toSessionUser(user);
  const token = createSessionToken(sessionUser);

  return jsonResponse(
    {
      user: sessionUser,
      message:
        parsed.data.role === "expert" && verificationStatus === "pending"
          ? "Registrace odborníka proběhla. Čeká na schválení administrátorem."
          : "Registrace proběhla úspěšně."
    },
    {
      status: 201,
      headers: {
        "Set-Cookie": `medscope_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
      }
    }
  );
}
