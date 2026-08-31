import { editorialFooterText } from "@/lib/editorial/units";

export function EditorialFooter({ locale = "cs" }: { locale?: string }) {
  const text = editorialFooterText(locale);

  return (
    <p className="mt-10 rounded-xl border border-slate-200/80 bg-slate-50/90 p-4 text-xs leading-relaxed text-slate-700">
      {text}
    </p>
  );
}
