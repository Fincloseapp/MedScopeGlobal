import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const admin = createServiceRoleClient();
        const meta = user.user_metadata ?? {};
        const accessLevel =
          (meta.access_level as string) === "student" ||
          (meta.access_level as string) === "physician"
            ? (meta.access_level as string)
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
            verification_status:
              accessLevel === "physician" ? "pending" : "approved",
          },
          { onConflict: "id" }
        );
      }

      const safeNext =
        next.startsWith("/") && !next.startsWith("//") ? next : "/";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
