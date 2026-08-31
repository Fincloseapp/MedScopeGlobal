import { getSubscribeCopy } from "@/lib/i18n/subscribe-copy";

export function SubscriptionFaq({
  locale = "cs",
  region,
}: {
  locale?: string;
  region?: string | null;
}) {
  const copy = getSubscribeCopy(locale, region);
  return (
    <section aria-labelledby="faq-heading" className="mt-16">
      <h2 id="faq-heading" className="font-display text-2xl font-semibold text-[#021d33]">
        {copy.faqTitle}
      </h2>
      <dl className="mt-6 space-y-3">
        {copy.faq.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-[#005B96]/15 bg-white px-5 py-4 shadow-sm open:shadow-md"
          >
            <summary className="cursor-pointer list-none font-semibold text-[#021d33] marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <span
                  className="shrink-0 text-[#005B96] transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </span>
            </summary>
            <dd className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</dd>
          </details>
        ))}
      </dl>
    </section>
  );
}
