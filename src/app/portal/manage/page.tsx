import Link from "next/link";
import { redirect } from "next/navigation";
import { isVerifiedExpert } from "@/lib/portal/rbac";
import { getSessionUser } from "@/lib/portal/request";
import { listArticles } from "@/lib/portal/repository";

export default async function PortalManagePage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  if (!isVerifiedExpert(user)) {
    return (
      <main className="section">
        <div className="empty">
          <h2>Čeká na ověření odborníka</h2>
          <p>Váš účet musí být schválen administrátorem nebo ověřen institucionálním e-mailem.</p>
          <Link className="button" href="/portal">
            Zpět na portál
          </Link>
        </div>
      </main>
    );
  }

  const articles = await listArticles({ authorId: user.role === "admin" ? undefined : user.id }, user.id, user.role);

  return (
    <main className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Správa obsahu</p>
          <h1>Články a publikace</h1>
        </div>
        <Link className="button primary" href="/portal/manage/new">
          Nový článek
        </Link>
      </div>

      <div className="grid two">
        {articles.map((article) => (
          <article className="card" key={article.id}>
            <div className="meta">
              <span className="tag">{article.status}</span>
              <span className="tag">{article.specialization}</span>
            </div>
            <h3>{article.title}</h3>
            <p>{article.summary}</p>
            <div className="actions">
              <Link className="button" href={`/portal/manage/${article.id}/edit`}>
                Editovat
              </Link>
              {article.status === "published" ? (
                <Link className="button primary" href={`/portal/articles/${article.slug}`}>
                  Zobrazit
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
