import { EditorialPayButtons } from "@/components/subscription/editorial-pay-buttons";
import { editorialCanceledCopy } from "@/lib/editorial/pay-labels";

export function SubscriptionCanceledBanner({ locale = "cs" }: { locale?: string }) {
  const copy = editorialCanceledCopy(locale);
  return (
    <section
      className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-6 text-center"
      aria-label={copy.title}
    >
      <p className="font-display text-xl font-semibold text-amber-950">{copy.title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-amber-900">{copy.body}</p>
      <div className="mx-auto mt-4 flex max-w-sm justify-center">
        <EditorialPayButtons locale={locale} className="flex w-full flex-col gap-2" />
      </div>
    </section>
  );
}
