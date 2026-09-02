import Link from "next/link";
import {
  Newspaper,
  Tags,
  Megaphone,
  Crown,
  Wallet,
  Mail,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { affiliateProductLabel, loadAdminOverview } from "@/lib/admin/overview";
import { categoryHealthLabel, categoryKindLabel } from "@/lib/admin/taxonomy";
import { channelReady } from "@/lib/monetization/payout-map";

export const dynamic = "force-dynamic";

function formatCzk(value: number): string {
  return `${value.toLocaleString("cs-CZ")} Kč`;
}

function Ready({ ok, label }: { ok: boolean | "n/a"; label: string }) {
  if (ok === "n/a") {
    return <span className="text-slate-500">{label}: faktura</span>;
  }
  return (
    <span className={ok ? "text-emerald-800" : "text-amber-800"}>
      {ok ? (
        <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
      ) : (
        <CircleAlert className="mr-1 inline h-3.5 w-3.5" />
      )}
      {label}: {ok ? "propojeno" : "čeká"}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const overview = await loadAdminOverview();
  const heurekaReady = Boolean(overview.heurekaCzId) || overview.readiness.heurekaCz;
  const loaded = new Date(overview.loadedAt).toLocaleString("cs-CZ");

  const stats = [
    {
      label: "Publikované články",
      value: overview.articles.published,
      hint: `${overview.articles.drafts} konceptů · ${overview.articles.total} celkem`,
      href: "/admin/articles",
      icon: Newspaper,
    },
    {
      label: "Kategorie",
      value: overview.categories.total,
      hint:
        overview.categories.missingEditorial.length > 0
          ? `Chybí ${overview.categories.missingEditorial.length} redakčních`
          : `${overview.categories.emptyDesks} prázdných desků`,
      href: "/admin/categories",
      icon: Tags,
    },
    {
      label: "Aktivní reklamy",
      value: overview.ads.active,
      hint: `${overview.ads.total} řádků v katalogu`,
      href: "/admin/ads",
      icon: Megaphone,
    },
    {
      label: "VIP + brief",
      value: overview.vipActive,
      hint: `${overview.newsletterSubscribers} odběratelů newsletteru`,
      href: "/admin/newsletter",
      icon: Crown,
    },
  ];

  const deskHealth = overview.categoryRows
    .filter((row) => categoryKindLabel(row.slug) === "Redakční desk")
    .sort((a, b) => b.published - a.published || a.name.localeCompare(b.name, "cs"));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
          ViaLongeVita · řízení
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-medical-navy">
          Přehled provozu
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Živá data ze Supabase ({overview.dataSource === "service-role" ? "service role" : "session"}).
          Stav k {loaded}. Provize Amazonu a Heureky sem nenačítáme — ty jsou v jejich dashboardech.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href}>
              <Card className="h-full transition hover:border-[#005B96]/40 hover:shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{item.value}</div>
                  <p className="text-xs text-muted-foreground">{item.hint}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
              <Wallet className="h-3.5 w-3.5" />
              Peníze a kanály
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-[#021d33]">
              Vyhodnocení příjmů
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Tady jsou kliky, připravenost účtů a zaplacené v27 objednávky. Amazon Kč a Heureka
              provize uvidíte jen u nich — nesmíme je vymýšlet.
            </p>
          </div>
          <Link
            href="/admin/vydelky"
            className="inline-flex items-center gap-1 rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004a7a]"
          >
            Kam jdou peníze
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Affiliate 7 dní</p>
            <p className="mt-1 text-2xl font-bold">{overview.clicks.last7}</p>
            <p className="text-xs text-slate-500">odchody na obchod, ne Kč</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Affiliate 30 dní</p>
            <p className="mt-1 text-2xl font-bold">{overview.clicks.last30}</p>
            <p className="text-xs text-slate-500">stejně jen kliky</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Tržby v27</p>
            <p className="mt-1 text-2xl font-bold">{formatCzk(overview.v27PaidCzk)}</p>
            <p className="text-xs text-slate-500">{overview.v27PaidOrders} zaplacených objednávek</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Stripe předplatné</p>
            <p className="mt-1 text-2xl font-bold">{overview.stripeSubscriptions}</p>
            <p className="text-xs text-slate-500">aktivní v tabulce subscriptions</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium">
          <Ready ok={overview.readiness.stripe} label="Stripe" />
          <Ready ok={heurekaReady} label="Heureka CZ" />
          <Ready ok={Boolean(overview.heurekaSkId) || overview.readiness.heurekaSk} label="Heureka SK" />
          <Ready ok={overview.readiness.amazonAny} label="Amazon" />
          <Ready ok={channelReady("b2b", overview.readiness)} label="B2B inzerce" />
        </div>

        {overview.clicks.top.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-white/80 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Produkt (30 dní)</th>
                  <th className="px-3 py-2 text-right">Kliky</th>
                </tr>
              </thead>
              <tbody>
                {overview.clicks.top.map((row) => (
                  <tr key={row.slug} className="border-t">
                    <td className="px-3 py-2">{affiliateProductLabel(row.slug)}</td>
                    <td className="px-3 py-2 text-right font-medium">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            Zatím žádné affiliate kliky za 30 dní, nebo chybí tabulka analytics.
          </p>
        )}

        <p className="mt-3 text-xs text-slate-500">
          <a className="font-medium text-[#005B96] hover:underline" href="https://dashboard.stripe.com/balance" target="_blank" rel="noreferrer">
            Stripe Balance
          </a>
          {" · "}
          <a className="font-medium text-[#005B96] hover:underline" href="https://affiliate.heureka.cz/webmaster#/" target="_blank" rel="noreferrer">
            Heureka webmaster
          </a>
          {" · "}
          <a className="font-medium text-[#005B96] hover:underline" href="https://affiliate-program.amazon.com/" target="_blank" rel="noreferrer">
            Amazon Associates
          </a>
          {" · "}
          <Link href="/admin/revenue" className="font-medium text-[#005B96] hover:underline">
            Tržby v27
          </Link>
        </p>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#021d33]">Redakční kategorie</h2>
            <p className="text-sm text-muted-foreground">
              Desk ViaLongeVita a NZIP. Prázdné desk na webu čtenář nevidí.
            </p>
          </div>
          <Link href="/admin/categories" className="text-sm font-medium text-[#005B96] hover:underline">
            Spravovat kategorie →
          </Link>
        </div>
        {overview.categories.missingEditorial.length > 0 ? (
          <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Chybí v databázi: {overview.categories.missingEditorial.join(", ")}. Doplníte je jedním
            tlačítkem na stránce kategorií.
          </p>
        ) : null}
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Desk</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2 text-right">Publikováno</th>
                <th className="px-3 py-2 text-right">Koncepty</th>
                <th className="px-3 py-2">Stav</th>
              </tr>
            </thead>
            <tbody>
              {deskHealth.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-slate-500">
                    Žádné redakční desk v databázi. Otevřete kategorie a spusťte synchronizaci.
                  </td>
                </tr>
              ) : (
                deskHealth.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{row.name}</td>
                    <td className="px-3 py-2 text-slate-500">{row.slug}</td>
                    <td className="px-3 py-2 text-right">{row.published}</td>
                    <td className="px-3 py-2 text-right">{row.drafts}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          row.published > 0
                            ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
                            : "rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
                        }
                      >
                        {categoryHealthLabel(row.health)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/admin/tests"
          className="rounded-xl border bg-white px-4 py-3 text-sm font-medium hover:bg-muted"
        >
          Testy routingu, reklam a CLK
        </Link>
        <Link
          href="/admin/system"
          className="rounded-xl border bg-white px-4 py-3 text-sm font-medium hover:bg-muted"
        >
          Stav systému a CRONy
        </Link>
        <Link
          href="/admin/newsletter"
          className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-medium hover:bg-muted"
        >
          <Mail className="h-4 w-4" />
          Newsletter a brief
        </Link>
      </div>
    </div>
  );
}
