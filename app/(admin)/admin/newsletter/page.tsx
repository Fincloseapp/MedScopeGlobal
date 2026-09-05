import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { NewsletterAdminPanel } from "@/components/admin/newsletter-admin-panel";
import { NewsletterIssueTable, NewsletterOpsStrip } from "@/components/admin/newsletter-ops-strip";
import { getNewsletterOpsSnapshot } from "@/lib/admin/newsletter-ops";
import { getNewsletterDraftForAdmin, getPendingNewsletterTopics } from "@/lib/queries/v4c/newsletters";
import { gatherNewsletterSources } from "@/lib/v23/newsletter/sources";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const [draft, topics, sources, ops] = await Promise.all([
    getNewsletterDraftForAdmin(),
    getPendingNewsletterTopics(),
    gatherNewsletterSources(),
    getNewsletterOpsSnapshot(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <MedScopeLogo href="/admin/newsletter" width={160} height={40} className="mb-3" imageClassName="max-h-10" />
        <h1 className="font-display text-2xl font-bold text-[#021d33]">Newsletter a ViaLongeVita brief</h1>
        <p className="mt-1 text-sm text-slate-600">
          Po přihlášení se hned odešle uvítání a první brief (ne až týdenní cron). Webové vydání je
          zvlášť pro každý jazyk. Čísla writerů dole jsou živá za 24 h — 20 writerů na jazyk je
          roster, ne denní produkce (česky každý den + jeden rotující cizí desk).
        </p>
      </div>
      <NewsletterOpsStrip ops={ops} />
      <NewsletterAdminPanel initialDraft={draft} initialTopics={topics} initialSources={sources} />
      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-[#021d33]">Přehled vydání</h2>
        <NewsletterIssueTable ops={ops} />
      </div>
    </div>
  );
}
