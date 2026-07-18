import { NextResponse } from "next/server";
import { ACADEMY_B2B_MIGRATION_SQL } from "@/lib/academy/b2b/embedded-migrations";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isPlaceholder(v: string | undefined): boolean {
  if (!v) return true;
  return (
    v === "[SENSITIVE]" ||
    v === "[REDACTED]" ||
    v === "******" ||
    v.includes("[PASSWORD]") ||
    v.includes("...")
  );
}

function hostFromUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    if (!host || !host.includes(".") || host === "base") return null;
    if (host.includes("...") || host.includes("[")) return null;
    return host;
  } catch {
    return null;
  }
}

/** Drop strict sslmode from URL so pg ssl:{rejectUnauthorized:false} can apply. */
function withRelaxedSsl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("ssl");
    return u.toString();
  } catch {
    return url;
  }
}

/** Prefer Supabase pooler from Vercel (direct db.* often ENOTFOUND on serverless). */
function collectDatabaseUrls(): { url: string; source: string; host: string }[] {
  const out: { url: string; source: string; host: string }[] = [];
  const seen = new Set<string>();

  const push = (url: string | undefined, source: string) => {
    if (!url || isPlaceholder(url)) return;
    const host = hostFromUrl(url);
    if (!host) return;
    const normalized = withRelaxedSsl(url);
    if (seen.has(normalized)) return;
    seen.add(normalized);
    out.push({ url: normalized, source, host });
  };

  // Pooler URLs from Vercel Supabase integration (runtime has real secrets)
  push(process.env.POSTGRES_URL, "POSTGRES_URL");
  push(process.env.POSTGRES_PRISMA_URL, "POSTGRES_PRISMA_URL");
  push(process.env.DATABASE_URL, "DATABASE_URL");
  push(process.env.POSTGRES_URL_NON_POOLING, "POSTGRES_URL_NON_POOLING");
  push(process.env.DIRECT_URL, "DIRECT_URL");
  push(process.env.SUPABASE_DB_URL, "SUPABASE_DB_URL");

  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const pass = process.env.POSTGRES_PASSWORD;
  const db = process.env.POSTGRES_DATABASE || "postgres";
  if (host && user && pass && !isPlaceholder(pass) && host.includes(".")) {
    push(
      "postgresql://" +
        encodeURIComponent(user) +
        ":" +
        encodeURIComponent(pass) +
        "@" +
        host +
        ":5432/" +
        encodeURIComponent(db),
      "POSTGRES_*"
    );
  }

  // Prefer pooler hosts (reachable from Vercel) over direct db.*
  out.sort((a, b) => {
    const score = (h: string) =>
      (h.includes("pooler") ? 0 : 2) +
      (h.startsWith("db.") && h.endsWith(".supabase.co") ? 1 : 0);
    return score(a.host) - score(b.host);
  });

  return out;
}

function sanitizeDbError(err: unknown): { message: string; code?: string } {
  const e = err as { message?: string; code?: string };
  let message = String(e?.message || err || "unknown error");
  message = message.replace(/postgresql:\/\/[^@\s]+@/gi, "postgresql://***@");
  message = message.replace(/password\s*=\s*\S+/gi, "password=***");
  if (message.length > 240) message = message.slice(0, 240) + "…";
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

    const candidates = collectDatabaseUrls();
    if (!candidates.length) {
      return NextResponse.json(
        {
          error: "DATABASE_URL / POSTGRES_* not configured on server",
          has_postgres_host: Boolean(process.env.POSTGRES_HOST),
          has_postgres_user: Boolean(process.env.POSTGRES_USER),
          has_postgres_password: Boolean(
            process.env.POSTGRES_PASSWORD &&
              !isPlaceholder(process.env.POSTGRES_PASSWORD)
          ),
          has_database_url: Boolean(
            process.env.DATABASE_URL && !isPlaceholder(process.env.DATABASE_URL)
          ),
          has_direct_url: Boolean(
            process.env.DIRECT_URL && !isPlaceholder(process.env.DIRECT_URL)
          ),
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
    const attempts: { source: string; host: string; error?: string; code?: string }[] =
      [];

    for (const candidate of candidates) {
      const client = new Client({
        connectionString: candidate.url,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 20000,
      });
      try {
        // Supabase pooler TLS often presents an intermediate that Node rejects
        // even with rejectUnauthorized=false unless NODE_TLS is relaxed for this hop.
        const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        try {
          await client.connect();
          await client.query(sql);
        } finally {
          if (prevTls === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
          else process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevTls;
        }
        await client.end().catch(() => undefined);
        return NextResponse.json({
          ok: true,
          message: "academy B2B CME schema applied",
          source: candidate.source,
          host: candidate.host,
          files: ACADEMY_B2B_MIGRATION_SQL.map((f) => f.name),
          tried: attempts,
        });
      } catch (e) {
        const safe = sanitizeDbError(e);
        attempts.push({
          source: candidate.source,
          host: candidate.host,
          error: safe.message,
          code: safe.code,
        });
        await client.end().catch(() => undefined);
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error: "All database connection candidates failed",
        attempts,
      },
      { status: 500 }
    );
  } catch (e) {
    const safe = sanitizeDbError(e);
    return NextResponse.json(
      { ok: false, error: safe.message, code: safe.code },
      { status: 500 }
    );
  }
}
