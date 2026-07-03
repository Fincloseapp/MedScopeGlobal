import { EDITORIAL_FOOTER_CS, EDITORIAL_FOOTER_EN, type EditorialLocale } from "@/lib/editorial/units";

export function EditorialFooter({ locale = "cs" }: { locale?: EditorialLocale }) {
  const text = locale === "en" ? EDITORIAL_FOOTER_EN : EDITORIAL_FOOTER_CS;

  return (
    <p className="mt-10 rounded-xl border border-slate-200/80 bg-slate-50/90 p-4 text-xs leading-relaxed text-slate-700">
      {text}
    </p>
  );
}
