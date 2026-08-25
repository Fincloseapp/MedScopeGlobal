import { NextResponse } from "next/server";
import { getMediFlowSession } from "@/lib/mediflow/session";
import { saveMediFlowArticle } from "@/lib/mediflow/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getMediFlowSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Přihlaste se pro uložení článku" }, { status: 401 });
  }

  const body = (await request.json()) as {
    articleSlug?: string;
    articleTitle?: string;
    excerpt?: string;
  };

  if (!body.articleSlug || !body.articleTitle) {
    return NextResponse.json({ error: "Chybí slug nebo titulek" }, { status: 400 });
  }

  try {
    const saved = await saveMediFlowArticle(session.userId, {
      articleSlug: body.articleSlug,
      articleTitle: body.articleTitle,
      excerpt: body.excerpt,
    });
    return NextResponse.json({ saved });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chyba ukládání" },
      { status: 503 }
    );
  }
}
