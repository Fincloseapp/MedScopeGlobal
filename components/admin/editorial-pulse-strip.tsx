import type { EditorialPulse } from "@/lib/admin/editorial-pulse";
import { formatPulseDate } from "@/lib/admin/editorial-pulse";

export function EditorialPulseStrip({ pulse }: { pulse: EditorialPulse }) {
  const mailLabel = pulse.mailReady
    ? pulse.mailTransport === "sendgrid"
      ? "SendGrid připraven"
      : "SMTP připraven"
    : "e-mail není nastavený";

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">
          Nejnovější článek
        </p>
        <p className="mt-2 font-display text-xl font-semibold text-[#021d33]">
          {formatPulseDate(pulse.newestPublishedAt)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Publikováno celkem {pulse.published} · veřejných {pulse.publicPublished}
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">
          Čerstvé články
        </p>
        <p className="mt-2 font-display text-3xl font-semibold text-[#021d33]">{pulse.last24h}</p>
        <p className="mt-1 text-xs text-slate-500">
          za 24 h · {pulse.last7d} za 7 dní · dnešní plán {pulse.todayLocales.join(" + ")} (
          {pulse.expectedArticlesToday})
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">
          Writery dnes
        </p>
        <p className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
          {pulse.writersProduced24h}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          reálně psalo za 24 h. Roster je {pulse.writersRosterPerLocale} / jazyk (plán, ne denní
          produkce). Dnes rotuje {pulse.rotatingLocale}.
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">
          Obálky a brief
        </p>
        <p className="mt-2 font-display text-xl font-semibold text-[#021d33]">
          {pulse.withCover} s fotkou
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {pulse.missingCover} bez coveru · {mailLabel} · čeká na první brief {pulse.waitingFirstBrief}
        </p>
      </article>
    </section>
  );
}
