import { readFileSync } from "node:fs";
import { NextResponse } from "next/server";
import { projectPath } from "@/lib/config/paths";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function resolveDatabaseUrl(): string | null {
  const candidates = [
    process.env.DIRECT_URL,
    process.env.DATABASE_URL,
    process.env.SUPABASE_DB_URL,
    process.env.POSTGRES_URL,
  ].filter(Boolean) as string[];

  for (const url of candidates) {
    if (url === "[SENSITIVE]" || url === "[REDACTED]" || url === "******") continue;
    try {
      const u = new URL(url);
      if (u.hostname && u.hostname.includes(".") && u.hostname !== "base") return url;
    } catch {
      /* skip */
    }
  }

  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const pass = process.env.POSTGRES_PASSWORD;
  const db = process.env.POSTGRES_DATABASE || "postgres";
  if (host && user && pass && host.includes(".") && pass !== "[SENSITIVE]") {
    return (
      "postgresql://" +
      encodeURIComponent(user) +
      ":" +
      encodeURIComponent(pass) +
      "@" +
      host +
      ":5432/" +
      encodeURIComponent(db)
    );
  }
  return null;
}

/**
 * One-time DDL for MedScope Academy B2B CME (Lékařská zóna).
 * GET /api/setup/academy-b2b-schema?secret=CRON_SECRET
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const querySecret = new URL(request.url).searchParams.get("secret");
  if (!secret || querySecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL / POSTGRES_* not configured on server" },
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

  const sqlFiles = [
    projectPath("supabase/migrations/20260718120000_academy_b2b_cme.sql"),
    projectPath("supabase/migrations/20260718120100_academy_b2b_cme_seed.sql"),
  ];
  const sql = sqlFiles.map((f) => readFileSync(f, "utf8")).join("\n\n");

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    return NextResponse.json({
      ok: true,
      message: "academy B2B CME schema applied",
      files: sqlFiles.map((f) => f.split(/[\\/]/).pop()),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  } finally {
    await client.end().catch(() => undefined);
  }
}
