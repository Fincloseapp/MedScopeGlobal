import type { NewsletterOpsSnapshot } from "@/lib/admin/newsletter-ops";

export function NewsletterOpsStrip({ ops }: { ops: NewsletterOpsSnapshot }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">Odběratelé briefu</p>
        <p className="mt-2 font-display text-3xl font-semibold text-[#021d33]">{ops.subscribers}</p>
        <p className="mt-1 text-xs text-slate-500">
          {ops.byLocale.length
            ? ops.byLocale.map((row) => `${row.locale} ${row.count}`).join(" · ")
            : "zatím bez přihlášek"}
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">Webové vydání</p>
        <p className="mt-2 font-display text-xl font-semibold text-[#021d33]">
          {ops.latestPublishedSlug ? `/${ops.latestPublishedSlug}` : "ještě nevyšlo"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Dnes {ops.editionsToday ?? 0} mutací
          {(ops.editionLocales ?? []).length
            ? ` · cron ${ops.editionLocales.length} desků`
            : ""}
          . Brief podle jazyka přihlášení.
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">Čekající témata</p>
        <p className="mt-2 font-display text-3xl font-semibold text-[#021d33]">{ops.pendingTopics}</p>
        <p className="mt-1 text-xs text-slate-500">Zapracují se při příštím „Vytvořit newsletter“.</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">Archiv v adminu</p>
        <p className="mt-2 font-display text-3xl font-semibold text-[#021d33]">{ops.issues.length}</p>
        <p className="mt-1 text-xs text-slate-500">Poslední vydání včetně všech jazykových mutací.</p>
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
              <th className="px-4 py-3 font-semibold">Writery</th>
              <th className="px-4 py-3 font-semibold">Editoři</th>
              <th className="px-4 py-3 font-semibold">Odběratelé</th>
              <th className="px-4 py-3 font-semibold">Brief</th>
            </tr>
          </thead>
          <tbody>
            {(ops.localeDesks ?? []).map((desk) => (
              <tr key={desk.locale} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-[#021d33]">
                  {desk.locale} · {desk.label}
                </td>
                <td className="px-4 py-3 text-slate-600">{desk.writers}</td>
                <td className="px-4 py-3 text-slate-600">{desk.editors}</td>
                <td className="px-4 py-3 text-slate-600">{desk.subscribers}</td>
                <td className="px-4 py-3 text-slate-600">{desk.briefTitle}</td>
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
