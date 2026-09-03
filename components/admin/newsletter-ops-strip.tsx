import type { NewsletterOpsSnapshot } from "@/lib/admin/newsletter-ops";
import { formatPulseDate } from "@/lib/admin/editorial-pulse";

export function NewsletterOpsStrip({ ops }: { ops: NewsletterOpsSnapshot }) {
  const mailLabel = ops.mailReady
    ? ops.mailTransport === "sendgrid"
      ? "SendGrid"
      : "SMTP"
    : "není nastavený";

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">
          Odběratelé briefu
        </p>
        <p className="mt-2 font-display text-3xl font-semibold text-[#021d33]">{ops.subscribers}</p>
        <p className="mt-1 text-xs text-slate-500">
          {ops.byLocale.length
            ? ops.byLocale.map((row) => `${row.locale} ${row.count}`).join(" · ")
            : "zatím bez přihlášek"}
          {ops.waitingFirstBrief ? ` · ${ops.waitingFirstBrief} čeká na první e-mail` : ""}
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">
          Odesílání e-mailu
        </p>
        <p className="mt-2 font-display text-xl font-semibold text-[#021d33]">{mailLabel}</p>
        <p className="mt-1 text-xs text-slate-500">
          {ops.lastEmail
            ? `${ops.lastEmail.status} ${formatPulseDate(ops.lastEmail.sent_at)} · ${ops.lastEmail.subject}`
            : "v logu zatím žádný brief"}
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">
          Webové vydání
        </p>
        <p className="mt-2 font-display text-xl font-semibold text-[#021d33]">
          {ops.latestPublishedSlug ? `/${ops.latestPublishedSlug}` : "ještě nevyšlo"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Dnes {ops.editionsToday ?? 0} mutací
          {(ops.editionLocales ?? []).length ? ` · cron ${ops.editionLocales.length} desků` : ""}.
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">
          Writery dnes
        </p>
        <p className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
          {ops.writersProduced24h}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          reálně psalo za 24 h. Plán dnes {ops.todayLocales.join(" + ")} · rotace{" "}
          {ops.rotatingLocale}. Roster {ops.writersRosterPerLocale}/jazyk není denní produkce.
        </p>
      </article>
    </section>
  );
}

export function NewsletterIssueTable({ ops }: { ops: NewsletterOpsSnapshot }) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Jazyk</th>
              <th className="px-4 py-3 font-semibold">Dnes psalo</th>
              <th className="px-4 py-3 font-semibold">Články 24h / 7d</th>
              <th className="px-4 py-3 font-semibold">Odběratelé</th>
              <th className="px-4 py-3 font-semibold">Čeká brief</th>
              <th className="px-4 py-3 font-semibold">Roster</th>
            </tr>
          </thead>
          <tbody>
            {(ops.localeDesks ?? []).map((desk) => (
              <tr key={desk.locale} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-[#021d33]">
                  {desk.locale} · {desk.label}
                </td>
                <td className="px-4 py-3 text-slate-600">{desk.writersProduced24h}</td>
                <td className="px-4 py-3 text-slate-600">
                  {desk.articles24h} / {desk.articles7d}
                </td>
                <td className="px-4 py-3 text-slate-600">{desk.subscribers}</td>
                <td className="px-4 py-3 text-slate-600">{desk.waitingFirstBrief}</td>
                <td className="px-4 py-3 text-slate-500">
                  {desk.writersPlanned} writerů · {desk.editors} editorů
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!ops.issues.length ? (
        <p className="text-sm text-slate-500">Zatím žádné webové vydání v databázi.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Datum</th>
                <th className="px-4 py-3 font-semibold">Jazyk</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Titulek</th>
                <th className="px-4 py-3 font-semibold">Stav</th>
              </tr>
            </thead>
            <tbody>
              {ops.issues.map((issue) => (
                <tr key={issue.slug} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{issue.issue_date}</td>
                  <td className="px-4 py-3 text-slate-600">{issue.locale ?? "cs"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{issue.slug}</td>
                  <td className="px-4 py-3 font-medium text-[#021d33]">{issue.title}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {issue.published && !issue.admin_only ? "veřejné" : "koncept"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
