import { readFileSync } from "node:fs";
import { NextResponse } from "next/server";
import { projectPath } from "@/lib/config/paths";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * One-time DDL for student_materials via DATABASE_URL (Vercel production).
 * GET /api/setup/student-materials-schema?secret=CRON_SECRET
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const querySecret = new URL(request.url).searchParams.get("secret");
  if (!secret || querySecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!databaseUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured on server" },
      { status: 503 }
    );
  }

  let Client: typeof import("pg").default.Client;
  try {
    const pg = await import("pg");
    Client = pg.default.Client;
  } catch {
    return NextResponse.json({ error: "pg module missing" }, { status: 500 });
  }

  const sql = readFileSync(
    projectPath("supabase/migrations/20260706120000_student_materials.sql"),
    "utf8"
  );

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    return NextResponse.json({ ok: true, message: "student_materials schema applied" });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  } finally {
    await client.end().catch(() => undefined);
  }
}
