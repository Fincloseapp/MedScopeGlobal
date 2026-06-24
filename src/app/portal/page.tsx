import Link from "next/link";
import { getDatabaseStatus } from "@/lib/portal/runtime";
import { getSessionUser } from "@/lib/portal/request";
import { listArticles, listSavedArticles } from "@/lib/portal/repository";
import { isVerifiedExpert } from "@/lib/portal/rbac";

export default async function PortalHomePage() {
  const user = await getSessionUser();
  const dbStatus = getDatabaseStatus();
  const published = (await listArticles({ status: "published", sort: "newest" })).slice(0, 6);
  const saved = user ? await listSavedArticles(user.id) : [];

  return (
    <main className="section">
      {(dbStatus === "missing_in_production" || dbStatus === "invalid_configuration" || dbStatus === "memory_fallback") ? (
        <div className="card db-warning">
          <p className="eyebrow">Produkční režim</p>
          <h2>{dbStatus === "invalid_configuration" ? "Supabase connection string není správně nastaven" : "Portál běží v demo režimu"}</h2>
          <p>
            {dbStatus === "invalid_configuration" ? (
              <>
                Ve Vercel je stále placeholder <code>[PASSWORD]</code>. Nahraďte skutečným heslem ze{" "}
              </>
            ) : (
              <>Pro plnou persistenci dat nastavte <code>DATABASE_URL</code> a <code>DIRECT_URL</code> z </>
            )}
            <a
              href="https://supabase.com/dashboard/project/xcydgqnivxfhprbmdyym/settings/database"
              rel="noopener noreferrer"
              target="_blank"
            >
              Supabase Database settings
            </a>
            {dbStatus === "invalid_configuration" ? (
              <>, pak redeploy.</>
            ) : (
              <>, pak spusťte <code>npm run setup:production</code>.</>
            )}
            {" "}Do opravy portál funguje s demo daty v paměti (účty níže).
          </p>
          <Link className="button" href="/api/portal/health">
            Stav systému
          </Link>
        </div>
      ) : null}

      <section className="hero portal-hero">
        <div>
          <p className="eyebrow">MedScopeGlobal Portal</p>
          <h1>Odborný medicínský obsah pro praxi i výzkum</h1>
          <p className="lead">
            Strukturované články s citacemi z českých i zahraničních zdrojů. Registrace čtenáře nebo ověřeného odborníka.
          </p>
          <div className="actions">
            {user ? (
              <>
                <span className="tag">Přihlášen: {user.name}</span>
                {isVerifiedExpert(user) ? (
                  <Link className="button primary" href="/portal/manage">
                    Správa článků
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <Link className="button primary" href="/auth/register">
                  Registrace
                </Link>
                <Link className="button" href="/auth/login">
                  Přihlášení
                </Link>
              </>
            )}
            <Link className="button" href="/portal/articles">
              Procházet články
            </Link>
          </div>
        </div>
        <aside className="card hero-card">
          <h2>Demo účty</h2>
          <p>Čtenář: reader@example.com / Reader123!</p>
          <p>Odborník: expert@lf1.cuni.cz / Expert123!</p>
          <p>Admin: admin@medscopeglobal.com / Admin123!</p>
        </aside>
      </section>

      {saved.length ? (
        <section className="section">
          <h2>Uložené články</h2>
          <div className="grid">
            {saved.map((article) => (
              <article className="card" key={article.id}>
                <span className="tag">{article.specialization}</span>
                <h3>{article.title}</h3>
                <Link className="button" href={`/portal/articles/${article.slug}`}>
                  Otevřít
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="section-head">
          <h2>Nejnovější publikace</h2>
          <Link className="button" href="/portal/articles">
            Všechny články
          </Link>
        </div>
        <div className="grid">
          {published.map((article) => (
            <article className="card" key={article.id}>
              <span className="tag">{article.specialization}</span>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <Link className="button primary" href={`/portal/articles/${article.slug}`}>
                Číst článek
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
