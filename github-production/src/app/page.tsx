import Link from "next/link";
import { AbTestHeroCta } from "@/components/ab-test-hero-cta";
import { AiRoadmapSection } from "@/components/ai-roadmap-section";
import { Metrics } from "@/components/metrics";
import { SegmentCards } from "@/components/segment-cards";
import { TrustStrip } from "@/components/trust-strip";
import {
  articleSources,
  articles,
  audienceLabels,
  dailyArticleTarget,
  events,
  funnelMetrics
} from "@/lib/data";
import { jobListings } from "@/lib/jobs";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  const featuredArticle = articles.find((article) => article.featured) ?? articles[0];
  const nextEvent = events[0];
  const featuredJob = jobListings.find((job) => job.featured) ?? jobListings[0];

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">MedScopeGlobal</p>
          <h1>Odborný medicínský magazín pro každého čtenáře</h1>
          <p className="lead">
            Srozumitelné články pro laiky a studenty, praktická podpora pro lékaře a výzkumný monitoring
            s citacemi — vše v češtině na jednom místě.
          </p>
          <p>
            Vyberte si profil čtenáře, prohlédněte denní monitoring z ověřených zdrojů nebo vstupte do
            premium vrstvy s hlubšími analýzami.
          </p>
          <div className="hero-actions">
            <AbTestHeroCta />
            <Link className="button" href="/articles">
              Články a monitoring
            </Link>
            <Link className="button" href="/pro-koho">
              Pro koho je magazín
            </Link>
            <Link className="button" href="/medicina">
              Medicína — příprava a studium
            </Link>
            <Link className="button primary" href="/auth/register">
              Registrace zdarma
            </Link>
          </div>
          <TrustStrip />
        </div>
        <aside className="card hero-card">
          <span className="tag">Doporučeno · {audienceLabels[featuredArticle.audience]}</span>
          <h2>{featuredArticle.title}</h2>
          <p>{featuredArticle.summary}</p>
          <div className="meta">
            <span>{featuredArticle.author}</span>
            <span>{new Intl.DateTimeFormat("cs-CZ").format(new Date(featuredArticle.date))}</span>
            <span>{featuredArticle.source}</span>
          </div>
          <Link className="button primary" href={`/articles/${featuredArticle.slug}`}>
            Číst více
          </Link>
        </aside>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Pro koho</p>
            <h2>Čtěte podle své role</h2>
          </div>
          <Link className="button" href="/pro-koho">
            Všechny profily
          </Link>
        </div>
        <SegmentCards />
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Denní monitoring</p>
            <h2>
              {dailyArticleTarget} článků denně z {articleSources.length} medicínských zdrojů
            </h2>
          </div>
          <Link className="button primary" href="/articles">
            Procházet články
          </Link>
        </div>
        <p>
          Pokrytí zahrnuje české, slovenské, evropské i globální instituce s metadata vrstvou pro každý
          výstup.
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Platforma</p>
            <h2>Obsah, vzdělávání, kariéra a spolupráce</h2>
          </div>
        </div>
        <div className="grid">
          <article className="card">
            <h3>Články a portál</h3>
            <p>Strukturované odborné články s citacemi, RBAC a validací expertů.</p>
            <Link className="button" href="/portal/articles">
              Odborné články
            </Link>
          </article>
          <article className="card">
            <h3>Události a vzdělávání</h3>
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

      <section className="section grid two">
        <article className="card">
          <p className="eyebrow">Nadcházející událost</p>
          <h2>{nextEvent.title}</h2>
          <p>{nextEvent.description}</p>
          <div className="meta">
            <span>{nextEvent.region}</span>
            <span>{nextEvent.format}</span>
            <span>{nextEvent.specialization}</span>
          </div>
          <Link className="button primary" href={`/events/${nextEvent.slug}`}>
            Detail události
          </Link>
        </article>
        <article className="card">
          <p className="eyebrow">Kariéra</p>
          <h2>{featuredJob.title}</h2>
          <p>{featuredJob.summary}</p>
          <div className="meta">
            <span>{featuredJob.employer}</span>
            <span>{featuredJob.location}</span>
          </div>
          <Link className="button primary" href={`/jobs/${featuredJob.slug}`}>
            Zobrazit pozici
          </Link>
        </article>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Growth dashboard</p>
            <h2>Měříme funnel od návštěvy po konverzi</h2>
          </div>
        </div>
        <Metrics items={funnelMetrics} />
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Kontakt</p>
            <h2>Máte dotaz nebo chcete spolupracovat?</h2>
          </div>
        </div>
        <p>
          Hlavní kontakt: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
        <p>
          B2B / partnerství: <a href={`mailto:${siteConfig.adsEmail}`}>{siteConfig.adsEmail}</a>
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/institutions">
            Institucionální demo
          </Link>
          <Link className="button" href="/contact">
            Kontaktní formulář
          </Link>
        </div>
      </section>
    </>
  );
}
