import Link from "next/link";

export type HouseAd = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  tone?: "navy" | "green" | "slate" | "blue";
};

export const DEFAULT_HOUSE_ADS: HouseAd[] = [
  {
    id: "medipacient",
    kicker: "Aplikace pro veřejnost",
    title: "MeDipacient na plochu telefonu",
    body: "Vyfoťte lékařskou zprávu i bez sítě. Po připojení se vše samo odešle, zašifruje a poskládá na časovou osu.",
    href: "/medipacient/stahnout",
    cta: "Stáhnout MeDipacient",
    tone: "blue",
  },
  {
    id: "predplatne",
    kicker: "Předplatné",
    title: "14 dní v celém prostředí zdarma",
    body: "Redakce, Academy, Research Hub i AI asistent — bez závazku, poté od 99 Kč měsíčně.",
    href: "/predplatne?trial=1",
    cta: "Vyzkoušet",
    tone: "navy",
  },
  {
    id: "mediktor",
    kicker: "Aplikace",
    title: "MeDiktor pro ordinaci",
    body: "Diktát nebo rozhovor s pacientem se zapíše za vás. Stáhněte si aplikaci — 14 dní zdarma.",
    href: "/mediktor/stahnout",
    cta: "Stáhnout",
    tone: "green",
  },
  {
    id: "mediprep",
    kicker: "Aplikace pro studenty",
    title: "MeDiprep na přijímačky LF",
    body: "Stáhněte aplikaci, přihlaste se e-mailem a procvičujte B/C/F. Simulace 8 českých fakult — 14 dní zdarma.",
    href: "/mediprep/stahnout",
    cta: "Začni přípravu hned",
    tone: "navy",
  },
  {
    id: "inzerce",
    kicker: "Pro firmy",
    title: "Inzerce ve zdravotnickém prostředí",
    body: "Farmacie, výrobci, kliniky a poskytovatelé péče — decentní formáty u čtenářů, studentů i lékařů.",
    href: "/firmy",
    cta: "Ceník inzerce",
    tone: "slate",
  },
];

function toneClass(tone: HouseAd["tone"]) {
  if (tone === "green") return "border-[#22a05a]/20 bg-[#f3faf6]";
  if (tone === "slate") return "border-slate-200 bg-slate-50";
  if (tone === "blue") return "border-[#2D7FF9]/25 bg-[#eef5ff]";
  return "border-[#005B96]/15 bg-[#f4f8fc]";
}

export function NativeHouseAds({
  ads = DEFAULT_HOUSE_ADS,
  compact = false,
}: {
  ads?: HouseAd[];
  compact?: boolean;
}) {
  return (
    <aside aria-label="Nabídky MedScopeGlobal" className={compact ? "space-y-3" : ""}>
      <div className={compact ? "space-y-3" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"}>
        {ads.map((ad) => (
          <Link
            key={ad.id}
            href={ad.href}
            className={`block rounded-2xl border px-4 py-3.5 transition hover:border-[#005B96]/35 ${toneClass(ad.tone)}`}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {ad.kicker}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#021d33]">{ad.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{ad.body}</p>
            <p className={`mt-2 text-xs font-semibold ${ad.tone === "blue" ? "text-[#2D7FF9]" : "text-[#005B96]"}`}>
              {ad.cta} →
            </p>
          </Link>
        ))}
      </div>
    </aside>
  );
}
