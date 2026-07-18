import { NextResponse } from "next/server";
import { ACADEMY_B2B_MIGRATION_SQL } from "@/lib/academy/b2b/embedded-migrations";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function resolveDatabaseUrl(): string | null {
  const candidates = [
    process.env.DIRECT_URL,
    process.env.DATABASE_URL,
    process.env.SUPABASE_DB_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
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

function sanitizeDbError(err: unknown): { message: string; code?: string } {
  const e = err as { message?: string; code?: string };
  let message = String(e?.message || err || "unknown error");
  // Avoid leaking connection strings / secrets into logs and CI output
  message = message
    .replace(/postgresql:\/\/[^@\s]+@/gi, "postgresql://***@")
    .replace(/password\s*=\s*\S+/gi, "password=***")
    .replace(/\b[A-Za-z0-9_-]{20,}\b/g, (m) => (m.length > 40 ? "***" : m));
  if (message.length > 300) message = message.slice(0, 300) + "…";
  return { message, code: e?.code };
}

/**
 * One-time DDL for MedScope Academy B2B CME (Lékařská zóna).
 * GET /api/setup/academy-b2b-schema?secret=CRON_SECRET
 */
export async function GET(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    const querySecret = new URL(request.url).searchParams.get("secret");
    if (!secret || querySecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const databaseUrl = resolveDatabaseUrl();
    if (!databaseUrl) {
      return NextResponse.json(
        {
          error: "DATABASE_URL / POSTGRES_* not configured on server",
          has_postgres_host: Boolean(process.env.POSTGRES_HOST),
          has_postgres_user: Boolean(process.env.POSTGRES_USER),
          has_postgres_password: Boolean(process.env.POSTGRES_PASSWORD),
          has_database_url: Boolean(process.env.DATABASE_URL),
        },
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

    const sql = ACADEMY_B2B_MIGRATION_SQL.map((f) => f.sql).join("\n\n");
    const host = new URL(databaseUrl).hostname;

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
        host,
        files: ACADEMY_B2B_MIGRATION_SQL.map((f) => f.name),
      });
    } catch (e) {
      const safe = sanitizeDbError(e);
      return NextResponse.json(
        { ok: false, error: safe.message, code: safe.code, host },
        { status: 500 }
      );
    } finally {
      await client.end().catch(() => undefined);
    }
  } catch (e) {
    const safe = sanitizeDbError(e);
    return NextResponse.json(
      { ok: false, error: safe.message, code: safe.code },
      { status: 500 }
    );
  }
}
