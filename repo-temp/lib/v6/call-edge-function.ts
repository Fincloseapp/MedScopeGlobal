/** Invoke a Supabase Edge Function (V6 Autopilot). */
export async function callSupabaseEdgeFunction(
  functionName: string,
  body: Record<string, unknown> = {}
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!baseUrl || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const res = await fetch(`${baseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: anonKey ?? serviceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* plain text body */
  }

  return { ok: res.ok, status: res.status, data };
}

/** V6 API routes — throws on edge failure, returns parsed body. */
export async function callEdgeFunction(
  functionName: string,
  body: Record<string, unknown> = {}
): Promise<unknown> {
  const { ok, status, data } = await callSupabaseEdgeFunction(functionName, body);
  if (!ok) {
    const msg =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: unknown }).error)
        : `Edge function ${functionName} failed (${status})`;
    throw new Error(msg);
  }
  return data;
}
