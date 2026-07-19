import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

function safeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/account";
}

async function upsertProfile(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}) {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;

  const meta = user.user_metadata ?? {};
  const accessLevel =
    meta.access_level === "student" || meta.access_level === "physician"
      ? meta.access_level
      : "public";

  await admin.from("users").upsert(
    {
      id: user.id,
      email: user.email,
      full_name:
        (meta.full_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "Reader",
      role: "user",
      access_level: accessLevel,
      profession: (meta.profession as string) ?? null,
      verification_status: accessLevel === "physician" ? "pending" : "approved",
    },
    { onConflict: "id" }
  );
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next"));

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?error=auth_config`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) await upsertProfile(user);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Email confirmation / magic-link style tokens from generateLink
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as
        | "signup"
        | "invite"
        | "magiclink"
        | "recovery"
        | "email_change"
        | "email",
    });
    if (!error && data.user) {
      await upsertProfile(data.user);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
