import { jsonResponse } from "@/lib/portal/request";

export async function POST() {
  return jsonResponse(
    { ok: true },
    {
      headers: {
        "Set-Cookie": "medscope_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
      }
    }
  );
}
