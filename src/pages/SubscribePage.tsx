import { HeadMeta } from '../components/HeadMeta';
import { LeadForm } from '../components/LeadForm';
import type { Locale } from '../types/content';

interface SubscribePageProps {
  locale: Locale;
}

export function SubscribePage({ locale }: SubscribePageProps) {
  return (
    <main className="page-shell">
      <HeadMeta
        locale={locale}
        title="Subscribe to MedScopeGlobal"
        description="Newsletter and membership inquiry path for clinical summaries, evidence digests, congress alerts and premium education."
        path="/subscribe"
      />
      <section className="subscription-page">
        <p className="eyebrow">Subscribe</p>
        <h1>Professional medical intelligence briefing</h1>
        <p>
          Subscribe to receive weekly clinical insights, research updates, policy alerts, pharma intelligence,
          congress reports and early-career opportunities.
        </p>
      </section>
      <LeadForm
        kind="newsletter"
        title="Join the professional briefing"
        description="Validated newsletter and membership intake. A configured endpoint can route this to CRM or email automation."
        submitLabel="Subscribe"
        context="subscribe"
        analyticsEvent="subscription_cta_click"
      />
    </main>
  );
}
