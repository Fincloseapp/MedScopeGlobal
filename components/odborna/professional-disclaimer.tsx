import { getOdbornaHubCopy } from "@/lib/i18n/odborna-hub-copy";

export function ProfessionalDisclaimer({
  className,
  locale = "cs",
}: {
  className?: string;
  locale?: string;
}) {
  const pack = getOdbornaHubCopy(locale);
  return (
    <aside
      className={
        className ??
        "rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs leading-relaxed text-amber-950"
      }
    >
      <p className="font-semibold">{pack.disclaimerTitle}</p>
      <ul className="mt-2 list-disc space-y-1 pl-4">
        {pack.disclaimerItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}
