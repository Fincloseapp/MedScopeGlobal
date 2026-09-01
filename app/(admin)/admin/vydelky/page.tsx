import Link from "next/link";
import { Wallet, ExternalLink, CheckCircle2, CircleAlert, CircleDot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import {
  AMAZON_STORE_SIGNUPS,
  HEUREKA_DOCS,
  PAYOUT_CHANNELS,
  channelReady,
  getPayoutReadiness,
} from "@/lib/monetization/payout-map";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getHeurekaPositionId,
  saveHeurekaPositionId,
} from "@/lib/monetization/heureka-affiliate";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type ClickRow = {
  slug?: string;
  locale?: string | null;
  destination?: string;
};

async function saveCzPosition(formData: FormData) {
  "use server";
  const gate = await requireAdmin();
  if (!gate.ok) return;
  const result = await saveHeurekaPositionId("cz", String(formData.get("snippet") ?? ""));
  revalidatePath("/admin/vydelky");
  redirect(
    result.ok
      ? `/admin/vydelky?heureka=cz-ok&id=${encodeURIComponent(result.id ?? "")}`
      : `/admin/vydelky?heureka=cz-err&msg=${encodeURIComponent(result.error ?? "uložení selhalo")}`
  );
}

async function saveSkPosition(formData: FormData) {
  "use server";
  const gate = await requireAdmin();
  if (!gate.ok) return;
  const result = await saveHeurekaPositionId("sk", String(formData.get("snippet") ?? ""));
  revalidatePath("/admin/vydelky");
  redirect(
    result.ok
      ? `/admin/vydelky?heureka=sk-ok&id=${encodeURIComponent(result.id ?? "")}`
      : `/admin/vydelky?heureka=sk-err&msg=${encodeURIComponent(result.error ?? "uložení selhalo")}`
  );
}

async function loadOpsCounts() {
  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return { clicks: [] as ClickRow[], clickCount: 0, subscribers: 0 };
  }

  const [clickRes, subRes] = await Promise.all([
    admin
      .from("analytics")
      .select("payload")
      .eq("event", "affiliate_click")
      .order("created_at", { ascending: false })
      .limit(80),
    admin.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
  ]);

  const clicks = ((clickRes.data ?? []) as { payload?: ClickRow }[])
    .map((row) => row.payload)
    .filter((row): row is ClickRow => Boolean(row?.slug));

  return {
    clicks,
    clickCount: clicks.length,
    subscribers: subRes.count ?? 0,
  };
}

function StatusPill({ ready }: { ready: boolean | "n/a" }) {
  if (ready === "n/a") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
        <CircleDot className="h-3 w-3" />
        Bez affiliate účtu
      </span>
    );
  }
  if (ready) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
        <CheckCircle2 className="h-3 w-3" />
        Propojeno
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
      <CircleAlert className="h-3 w-3" />
      Účet chybí — zatím 0 Kč
    </span>
  );
}

export default async function AdminVydelkyPage({
  searchParams,
}: {
  searchParams: Promise<{ heureka?: string; id?: string; msg?: string }>;
}) {
  const notice = await searchParams;
  const readiness = getPayoutReadiness();
  const { clicks, clickCount, subscribers } = await loadOpsCounts();
  const [heurekaCzId, heurekaSkId] = await Promise.all([
    getHeurekaPositionId("cz"),
    getHeurekaPositionId("sk"),
  ]);
  const heurekaReady = Boolean(heurekaCzId) || readiness.heurekaCz;

  return (
    <div className="space-y-8">
      <div>
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
          <Wallet className="h-3.5 w-3.5" />
          ViaLongeVita · výdělky
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">Kam uvidíte peníze</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Web kliky počítá, ale <strong>provize nikdy nepřijdou sem do adminu</strong>. Peníze jsou
          vždy u poskytovatele: Stripe, Heureka Affiliate, Amazon Associates, AdSense, nebo na
          faktuře, kterou vystavíte inzerentovi. Bez otevřeného účtu a vloženého kódu je výdělek
          z daného kanálu nula.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Affiliate kliky (posledních 80)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{clickCount}</p>
            <p className="text-xs text-slate-500">To ještě nejsou peníze — jen odchody na obchod.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Odběratelé briefu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{subscribers}</p>
            <p className="text-xs text-slate-500">Seznam je váš. Sponzorovaný mention se fakturuje zvlášť.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Amazon tag</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{readiness.amazonAny ? "ano" : "ne"}</p>
            <p className="text-xs text-slate-500">
              {readiness.amazonAny
                ? "US −20 · DE −21 · ES / FR lokální ID. UK/IT ještě ne."
                : "Bez tagu Amazon nákup nepřipíše vám."}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
        <h2 className="font-display text-lg font-semibold text-[#021d33]">1. Heureka — dokončit z otevřeného webmastera</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Účet máte. Heureka <strong>nepočítá přímý odkaz na heureka.cz</strong>. V{" "}
          <a className="font-medium text-[#005B96] hover:underline" href="https://affiliate.heureka.cz/webmaster#/" target="_blank" rel="noreferrer">
            webmaster panelu
          </a>{" "}
          teď: Weby → medscopeglobal.com (schválený). Pak <strong>Vybrat prvek → Textový odkaz</strong>.
          Do URL dejte třeba{" "}
          <code className="rounded bg-white px-1">https://www.heureka.cz/?h[fraze]=magnesium+glycinát</code>.
          Z vygenerovaného kódu zkopírujte celé HTML nebo číslo{" "}
          <code>data-trixam-positionid</code> a vložte sem. Pak /go u CZ začne vydělávat.
        </p>
        {notice.heureka?.endsWith("-ok") ? (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Uloženo. Position ID {notice.id}. CZ/SK /go teď jde přes Trixam — Heureka může počítat klik.
          </p>
        ) : null}
        {notice.heureka?.endsWith("-err") ? (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            {notice.msg || "Uložení selhalo."}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-slate-600">
          Stav CZ pozice:{" "}
          <strong>{heurekaCzId ? `propojeno (${heurekaCzId})` : "ještě chybí — vložte kód níže"}</strong>
        </p>
        <form action={saveCzPosition} className="mt-3 space-y-2">
          <textarea
            name="snippet"
            required
            rows={4}
            placeholder='<a class="heureka-affiliate-link" data-trixam-positionid="12345" href="https://www.heureka.cz/...">'
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-[#021d33]"
          />
          <button
            type="submit"
            className="rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004a7a]"
          >
            Uložit Heureka CZ pozici
          </button>
        </form>
        <form action={saveSkPosition} className="mt-4 space-y-2">
          <p className="text-xs text-slate-500">
            SK volitelně (Heureka.sk). Stav: {heurekaSkId ? `propojeno (${heurekaSkId})` : "zatím ne"}
          </p>
          <textarea
            name="snippet"
            rows={2}
            placeholder="data-trixam-positionid z affiliate.heurekashopping.sk"
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-[#021d33]"
          />
          <button type="submit" className="text-sm font-medium text-[#005B96] hover:underline">
            Uložit SK pozici
          </button>
        </form>
        <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
          <li>
            Heureka CZ výše. Program:{" "}
            <a className="font-medium text-[#005B96] hover:underline" href={HEUREKA_DOCS.program} target="_blank" rel="noreferrer">
              heureka.group/cs/affiliate-program
            </a>
            .
          </li>
          <li>
            <a className="font-medium text-[#005B96] hover:underline" href="https://affiliate-program.amazon.com/" target="_blank" rel="noreferrer">
              Amazon Associates
            </a>
            : US <code>vialongevita-20</code>, DE <code>vialongevita-21</code>, ES <code>vialongevit04-21</code>,
            FR <code>vialongevit0b-21</code> jsou v Workeru. UK / IT ještě chybí.
          </li>
          <li>
            Stripe už na projektu je — tipy a předplatné uvidíte v{" "}
            <a className="font-medium text-[#005B96] hover:underline" href="https://dashboard.stripe.com/balance" target="_blank" rel="noreferrer">
              Stripe Balance
            </a>
            , výplaty v Payouts na firemní účet.
          </li>
        </ol>
      </section>

      <div className="space-y-4">
        {PAYOUT_CHANNELS.map((channel) => {
          const ready =
            channel.id === "heureka-cz"
              ? heurekaReady
              : channel.id === "heureka-sk"
                ? Boolean(heurekaSkId) || readiness.heurekaSk
                : channelReady(channel.id, readiness);
          return (
            <Card key={channel.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">{channel.title}</CardTitle>
                  <p className="mt-1 text-sm text-slate-600">{channel.whatEarns}</p>
                </div>
                <StatusPill ready={ready} />
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>
                  <strong>Kde uvidíte peníze:</strong> {channel.whereYouSeeMoney}
                </p>
                <p>
                  <strong>Kam přijdou:</strong> {channel.payoutTo}
                </p>
                {channel.envVars.length > 0 ? (
                  <p className="text-xs text-slate-500">
                    Worker secret: {channel.envVars.join(", ")}
                  </p>
                ) : null}
                <a
                  href={channel.signupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[#005B96] hover:underline"
                >
                  {channel.signupLabel}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-[#021d33]">Amazon — kde se přihlásit</h2>
        <p className="mt-1 text-sm text-slate-600">
          Jeden US účet + OneLink pokryje většinu EU. Samostatný DE účet bývá pro evropské čtenáře
          nejsilnější. Tag sem nevymýšlíme — musí přijít z vašeho Associates.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {AMAZON_STORE_SIGNUPS.map((row) => (
            <li key={row.env} className="rounded-xl border bg-white px-3 py-2 text-sm">
              <a href={row.href} target="_blank" rel="noreferrer" className="font-medium text-[#005B96] hover:underline">
                {row.market}
              </a>
              <span className="mt-0.5 block text-[11px] text-slate-500">{row.env}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Poslední affiliate odchody</h2>
        {clicks.length === 0 ? (
          <p className="text-sm text-slate-500">Zatím žádné zaznamenané kliky, nebo chybí tabulka analytics.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Produkt</th>
                  <th className="px-3 py-2 text-left">Locale</th>
                  <th className="px-3 py-2 text-left">Cíl</th>
                </tr>
              </thead>
              <tbody>
                {clicks.slice(0, 20).map((row, index) => (
                  <tr key={`${row.slug}-${index}`} className="border-t">
                    <td className="px-3 py-2">{row.slug}</td>
                    <td className="px-3 py-2">{row.locale ?? "—"}</td>
                    <td className="max-w-[360px] truncate px-3 py-2 text-xs text-slate-500">
                      {row.destination}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-sm">
        <Link href="/admin/revenue" className="text-[#005B96] hover:underline">
          → Starší Revenue v27 (objednávky mini-produktů)
        </Link>
        {" · "}
        <Link href="/admin/stripe-webhook-logs" className="text-[#005B96] hover:underline">
          Stripe webhooky
        </Link>
      </p>
    </div>
  );
}
