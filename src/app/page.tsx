import Link from "next/link";
import { AbTestHeroCta } from "@/components/ab-test-hero-cta";
import { AiRoadmapSection } from "@/components/ai-roadmap-section";
import { Metrics } from "@/components/metrics";
import { SegmentCards } from "@/components/segment-cards";
import { TrustStrip } from "@/components/trust-strip";
import { articleSources, articles, audienceLabels, dailyArticleTarget, events, funnelMetrics } from "@/lib/data";
import { jobListings } from "@/lib/jobs";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  const featuredArticle = articles.find((article) => article.featured) ?? articles[0];
  const nextEvent = events[0];
  const featuredJob = jobListings.find((job) => job.featured) ?? jobListings[0];

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Prémiová medicínská knowledge platforma</p>
          <h1>Důvěryhodné znalosti, vzdělávání a institucionální spolupráce v jednom ekosystému.</h1>
          <p className="lead">
            MedScopeGlobal propojuje kliniky, výzkum a partnery s kurátorovaným obsahem, eventy, kariérními
            příležitostmi a připravenou premium vrstvou.
          </p>
          <TrustStrip />
          <div className="hero-actions">
            <Link className="button primary" href="/portal">
              Odborný portál
            </Link>
            <Link className="button" href="/premium">
              Premium
            </Link>
            <Link className="button" href="/institutions">
              Pro instituce
            </Link>
            <Link className="button" href="/auth/register">
              Registrace
            </Link>
            <AbTestHeroCta />
          </div>
        </div>
        <aside className="card hero-card" aria-label="Doporučený obsah">
          <div className="meta">
            <span className="tag">Doporučeno</span>
            <span className="tag">{audienceLabels[featuredArticle.audience]}</span>
          </div>
          <h2>{featuredArticle.title}</h2>
          <p>{featuredArticle.summary}</p>
          <div className="meta">
            <span>{featuredArticle.author}</span>
            <span>{new Intl.DateTimeFormat("cs-CZ").format(new Date(featuredArticle.date))}</span>
            <span>{featuredArticle.source}</span>
          </div>
          <Link className="button" href={`/articles/${featuredArticle.slug}`}>
            Číst více
          </Link>
        </aside>
      </section>

      <section className="section">
        <p className="eyebrow">Pro koho</p>
        <h2>Segmentace podle role a potřeb</h2>
        <SegmentCards />
      </section>

      <section className="section">
        <p className="eyebrow">Denní monitoring</p>
        <h2>
          {dailyArticleTarget} článků denně z {articleSources.length} medicínských zdrojů
        </h2>
        <p className="lead">
          Pokrytí zahrnuje české, slovenské, evropské i globální instituce s metadata vrstvou pro každý výstup.
        </p>
        <Link className="button primary" href="/articles">
          Procházet monitoring
        </Link>
      </section>

      <section className="section">
        <p className="eyebrow">Platforma</p>
        <h2>Obsah, vzdělávání, kariéra a B2B v jednom místě</h2>
        <div className="grid">
          <article className="card">
            <h3>Články &amp; portál</h3>
            <p>Strukturované odborné články s citacemi, RBAC a validací expertů.</p>
            <Link className="button" href="/portal/articles">
              Odborné články
            </Link>
          </article>
          <article className="card">
            <h3>Události &amp; vzdělávání</h3>
            <p>Konference, webináře, .ics export a edukační série.</p>
            <Link className="button" href="/education">
              Vzdělávání
            </Link>
          </article>
          <article className="card">
            <h3>Kariéra</h3>
            <p>Lékařské pozice, CRA role a akademické příležitosti.</p>
            <Link className="button" href="/jobs">
              Pracovní nabídky
            </Link>
          </article>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Nadcházející událost</p>
        <div className="card">
          <h2>{nextEvent.title}</h2>
          <p>{nextEvent.description}</p>
          <div className="meta">
            <span>{nextEvent.region}</span>
            <span>{nextEvent.format}</span>
            <span>{nextEvent.specialization}</span>
          </div>
          <div className="actions">
            <Link className="button primary" href={`/events/${nextEvent.slug}`}>
              Detail události
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Kariéra</p>
        <div className="card">
          <h2>{featuredJob.title}</h2>
          <p>{featuredJob.summary}</p>
          <div className="meta">
            <span>{featuredJob.employer}</span>
            <span>{featuredJob.location}</span>
          </div>
          <Link className="button primary" href={`/jobs/${featuredJob.slug}`}>
            Zobrazit pozici
          </Link>
        </div>
      </section>

      <AiRoadmapSection />

      <section className="section">
        <p className="eyebrow">Growth dashboard</p>
        <h2>Měříme funnel od návštěvy po konverzi</h2>
        <Metrics items={funnelMetrics} />
      </section>

      <section className="section card">
        <h2>Kontakt</h2>
        <p>
          Hlavní kontakt: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
        <p>
          B2B / partnerství: <a href={`mailto:${siteConfig.adsEmail}`}>{siteConfig.adsEmail}</a>
        </p>
        <div className="actions">
          <Link className="button primary" href="/institutions">
            Institucionální demo
          </Link>
          <Link className="button" href="/contact">
            Kontaktní formulář
          </Link>
        </div>
      </section>
    </main>
  );
}
