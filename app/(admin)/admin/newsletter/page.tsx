import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { NewsletterAdminPanel } from "@/components/admin/newsletter-admin-panel";
import { getNewsletterDraftForAdmin, getPendingNewsletterTopics } from "@/lib/queries/v4c/newsletters";
import { gatherNewsletterSources } from "@/lib/v23/newsletter/sources";

export default async function AdminNewsletterPage() {
  const [draft, topics, sources] = await Promise.all([
    getNewsletterDraftForAdmin(),
    getPendingNewsletterTopics(),
    gatherNewsletterSources(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <MedScopeLogo href="/admin/newsletter" width={160} height={40} className="mb-3" imageClassName="max-h-10" />
        <h1 className="font-display text-2xl font-bold text-[#021d33]">Newsletter engine v23.2.0</h1>
        <p className="mt-1 text-sm text-slate-600">
          Profesionální český obsah, reálné zdroje a náhled příštího vydání.
        </p>
      </div>
      <NewsletterAdminPanel initialDraft={draft} initialTopics={topics} initialSources={sources} />
    </div>
  );
}
