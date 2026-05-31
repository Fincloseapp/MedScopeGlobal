import type { Article, ArticleAudience, ArticleSource, FunnelMetric, MedicalEvent } from "./types";

export const roles = ["doctor", "student", "scientist", "partner"] as const;
export const specializations = ["Kardiologie", "Onkologie", "Neurologie", "Praktické lékařství", "Digitální zdraví", "Farmacie"] as const;
export const regions = ["Česko", "Slovensko", "Polsko", "Rakousko", "Německo", "Francie", "USA", "Evropa", "Globální"] as const;
export const articleAudiences = [
  { value: "laik-student", label: "Laik a student" },
  { value: "clinician", label: "Lékař / klinická praxe" },
  { value: "researcher", label: "Vědec / výzkum" },
  { value: "partner", label: "Partner / B2B" }
] as const satisfies readonly { value: ArticleAudience; label: string }[];
export const audienceLabels = Object.fromEntries(articleAudiences.map((item) => [item.value, item.label])) as Record<ArticleAudience, string>;
export const dailyArticleTarget = 100;

export const articleSources: ArticleSource[] = [
  { name: "Česká lékařská společnost Jana Evangelisty Purkyně", url: "https://www.cls.cz", country: "Česko", region: "Česko", type: "medical-society" },
  { name: "1. lékařská fakulta Univerzity Karlovy", url: "https://www.lf1.cuni.cz", country: "Česko", region: "Česko", type: "university" },
  { name: "2. lékařská fakulta Univerzity Karlovy", url: "https://www.lf2.cuni.cz", country: "Česko", region: "Česko", type: "university" },
  { name: "3. lékařská fakulta Univerzity Karlovy", url: "https://www.lf3.cuni.cz", country: "Česko", region: "Česko", type: "university" },
  { name: "Lékařská fakulta Masarykovy univerzity", url: "https://www.med.muni.cz", country: "Česko", region: "Česko", type: "university" },
  { name: "Lékařská fakulta Univerzity Palackého v Olomouci", url: "https://www.lf.upol.cz", country: "Česko", region: "Česko", type: "university" },
  { name: "Lékařská fakulta Ostravské univerzity", url: "https://lf.osu.cz", country: "Česko", region: "Česko", type: "university" },
  { name: "Institut klinické a experimentální medicíny", url: "https://www.ikem.cz", country: "Česko", region: "Česko", type: "hospital" },
  { name: "Státní ústav pro kontrolu léčiv", url: "https://www.sukl.cz", country: "Česko", region: "Česko", type: "regulator" },
  { name: "Národní zdravotnický informační portál", url: "https://www.nzip.cz", country: "Česko", region: "Česko", type: "public-health" },
  { name: "Jesseniova lekárska fakulta UK v Martine", url: "https://www.jfmed.uniba.sk", country: "Slovensko", region: "Slovensko", type: "university" },
  { name: "Lekárska fakulta Univerzity Komenského v Bratislave", url: "https://www.fmed.uniba.sk", country: "Slovensko", region: "Slovensko", type: "university" },
  { name: "Lekárska fakulta UPJŠ v Košiciach", url: "https://www.upjs.sk/lekarska-fakulta", country: "Slovensko", region: "Slovensko", type: "university" },
  { name: "Slovenská lekárska spoločnosť", url: "https://www.sls.sk", country: "Slovensko", region: "Slovensko", type: "medical-society" },
  { name: "Medical University of Warsaw", url: "https://www.wum.edu.pl", country: "Polsko", region: "Polsko", type: "university" },
  { name: "Jagiellonian University Medical College", url: "https://cm-uj.krakow.pl", country: "Polsko", region: "Polsko", type: "university" },
  { name: "Medical University of Gdańsk", url: "https://mug.edu.pl", country: "Polsko", region: "Polsko", type: "university" },
  { name: "Polish Academy of Sciences", url: "https://pan.pl", country: "Polsko", region: "Polsko", type: "public-health" },
  { name: "Medical University of Vienna", url: "https://www.meduniwien.ac.at", country: "Rakousko", region: "Rakousko", type: "university" },
  { name: "Medical University of Graz", url: "https://www.medunigraz.at", country: "Rakousko", region: "Rakousko", type: "university" },
  { name: "Medical University of Innsbruck", url: "https://www.i-med.ac.at", country: "Rakousko", region: "Rakousko", type: "university" },
  { name: "Austrian Society for Medical and Biological Engineering", url: "https://www.oegbmt.at", country: "Rakousko", region: "Rakousko", type: "medical-society" },
  { name: "Charité - Universitätsmedizin Berlin", url: "https://www.charite.de", country: "Německo", region: "Německo", type: "university" },
  { name: "Heidelberg University Hospital", url: "https://www.heidelberg-university-hospital.com", country: "Německo", region: "Německo", type: "hospital" },
  { name: "Robert Koch-Institut", url: "https://www.rki.de", country: "Německo", region: "Německo", type: "public-health" },
  { name: "Deutsche Gesellschaft für Innere Medizin", url: "https://www.dgim.de", country: "Německo", region: "Německo", type: "medical-society" },
  { name: "Inserm", url: "https://www.inserm.fr", country: "Francie", region: "Francie", type: "public-health" },
  { name: "Assistance Publique - Hôpitaux de Paris", url: "https://www.aphp.fr", country: "Francie", region: "Francie", type: "hospital" },
  { name: "Université Paris Cité - Faculté de Santé", url: "https://u-paris.fr/sante", country: "Francie", region: "Francie", type: "university" },
  { name: "Sorbonne Université - Médecine", url: "https://sante.sorbonne-universite.fr", country: "Francie", region: "Francie", type: "university" },
  { name: "European Medicines Agency", url: "https://www.ema.europa.eu", country: "Evropská unie", region: "Evropa", type: "regulator" },
  { name: "European Centre for Disease Prevention and Control", url: "https://www.ecdc.europa.eu", country: "Evropská unie", region: "Evropa", type: "public-health" },
  { name: "WHO Regional Office for Europe", url: "https://www.who.int/europe", country: "Evropa", region: "Evropa", type: "public-health" },
  { name: "European Society of Cardiology", url: "https://www.escardio.org", country: "Evropa", region: "Evropa", type: "medical-society" },
  { name: "European Society for Medical Oncology", url: "https://www.esmo.org", country: "Evropa", region: "Evropa", type: "medical-society" },
  { name: "National Institutes of Health", url: "https://www.nih.gov", country: "USA", region: "USA", type: "public-health" },
  { name: "Centers for Disease Control and Prevention", url: "https://www.cdc.gov", country: "USA", region: "USA", type: "public-health" },
  { name: "Mayo Clinic", url: "https://www.mayoclinic.org", country: "USA", region: "USA", type: "hospital" },
  { name: "Harvard Medical School", url: "https://hms.harvard.edu", country: "USA", region: "USA", type: "university" },
  { name: "Johns Hopkins Medicine", url: "https://www.hopkinsmedicine.org", country: "USA", region: "USA", type: "hospital" },
  { name: "Stanford Medicine", url: "https://med.stanford.edu", country: "USA", region: "USA", type: "university" },
  { name: "The New England Journal of Medicine", url: "https://www.nejm.org", country: "USA", region: "USA", type: "journal" },
  { name: "JAMA Network", url: "https://jamanetwork.com", country: "USA", region: "USA", type: "journal" },
  { name: "The Lancet", url: "https://www.thelancet.com", country: "Globální", region: "Globální", type: "journal" },
  { name: "Nature Medicine", url: "https://www.nature.com/nm", country: "Globální", region: "Globální", type: "journal" }
];

type SourceTheme = { focus: string; tag: string };
const sourceThemes: Record<(typeof specializations)[number], SourceTheme[]> = {
  Kardiologie: [
    { focus: "kardiovaskulární prevence", tag: "prevence" },
    { focus: "srdeční selhání a adherence k léčbě", tag: "srdeční selhání" },
    { focus: "digitální monitorování krevního tlaku", tag: "monitoring" },
    { focus: "akutní péče po infarktu myokardu", tag: "akutní péče" }
  ],
  Onkologie: [
    { focus: "real-world evidence v onkologii", tag: "RWE" },
    { focus: "časný záchyt nádorových onemocnění", tag: "screening" },
    { focus: "podpůrná péče a kvalita života", tag: "podpůrná péče" },
    { focus: "personalizovaná léčba solidních nádorů", tag: "personalizace" }
  ],
  Neurologie: [
    { focus: "péče o pacienty po cévní mozkové příhodě", tag: "CMP" },
    { focus: "neurodegenerativní onemocnění a včasná diagnostika", tag: "diagnostika" },
    { focus: "epilepsie a dlouhodobé sledování", tag: "epilepsie" },
    { focus: "rehabilitace a kognitivní návrat do běžného života", tag: "rehabilitace" }
  ],
  "Praktické lékařství": [
    { focus: "triáž v ordinaci praktického lékaře", tag: "triáž" },
    { focus: "očkování a prevence v primární péči", tag: "očkování" },
    { focus: "chronické nemoci v komunitní péči", tag: "chronická péče" },
    { focus: "komunikace rizika s pacientem", tag: "komunikace" }
  ],
  "Digitální zdraví": [
    { focus: "klinická AI a bezpečné zavádění", tag: "AI" },
    { focus: "interoperabilita zdravotnických dat", tag: "interoperabilita" },
    { focus: "telemedicína a hybridní péče", tag: "telemedicína" },
    { focus: "kybernetická odolnost zdravotnictví", tag: "kyberbezpečnost" }
  ],
  Farmacie: [
    { focus: "farmakovigilance a bezpečnost léčiv", tag: "farmakovigilance" },
    { focus: "dostupnost léčiv a řízení zásob", tag: "dostupnost" },
    { focus: "klinická farmacie v nemocniční péči", tag: "klinická farmacie" },
    { focus: "edukace pacienta při dlouhodobé medikaci", tag: "edukace" }
  ]
};

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function sourceTypeLabel(type: ArticleSource["type"]) {
  const labels: Record<ArticleSource["type"], string> = {
    university: "univerzitní nebo akademický zdroj",
    "medical-society": "odbornou společnost",
    hospital: "zdravotnické pracoviště",
    regulator: "regulační instituci",
    journal: "odborný časopis",
    "public-health": "veřejnozdravotní instituci"
  };
  return labels[type];
}

function buildExtendedSourceExcerpt({
  specialization,
  source,
  theme,
  audienceLabel
}: {
  specialization: (typeof specializations)[number];
  source: ArticleSource;
  theme: SourceTheme;
  audienceLabel: string;
}) {
  const sourceKind = sourceTypeLabel(source.type);
  const regionalContext =
    source.region === "Globální"
      ? "globálního medicínského prostředí"
      : `regionu ${source.region}`;
  const systemContext =
    source.type === "regulator"
      ? "bezpečnost, dostupnost, pravidla používání a dohled nad kvalitou péče"
      : source.type === "university"
        ? "výuku, výzkum, metodické vedení a přenos poznatků do praxe"
        : source.type === "journal"
          ? "publikované důkazy, odbornou diskusi a kritické hodnocení nových poznatků"
          : "praktickou péči, vzdělávání a orientaci v odborných doporučeních";

  return `## Úvod

Tento rozšířený výtah vychází z monitoringu zdroje ${source.name}, který představuje ${sourceKind} v rámci ${regionalContext}. Téma „${theme.focus}“ patří do oblasti ${specialization}, protože ovlivňuje způsob, jak pacienti, studenti a zdravotnické týmy rozumějí odborným informacím. Pro úroveň ${audienceLabel} je důležité vysvětlit kontext bez zbytečného zjednodušení.

Smyslem článku není nahradit původní zdroj, ale převést jeho hlavní význam do čitelné podoby. Čtenář získá přehled o tom, proč se téma sleduje, jak může souviset s evropským zdravotnictvím a proč je vhodné otevřít i zdrojový dokument. Výtah proto propojuje zdroj, praxi a dopad na pacienta.

## Co téma znamená

Téma „${theme.focus}“ označuje oblast, kde se odborné poznatky mění v praktické rozhodování. Odborný pojem zde znamená přesněji vymezený proces nebo jev, který má konkrétní význam pro prevenci, diagnostiku, léčbu, vzdělávání nebo organizaci péče. V oboru ${specialization} se podobné pojmy používají k tomu, aby bylo možné popsat problém srozumitelně a zároveň přesně.

Zdroj ${source.name} pomáhá určit, zda jde hlavně o vzdělávací informaci, regulační upozornění, akademický poznatek nebo praktickou zkušenost. To je důležité, protože stejný výraz může mít jiný význam pro studenta, pacienta a odborníka. Výtah proto vysvětluje základní význam a zároveň ukazuje hranice interpretace.

## Jak funguje v praxi

V praxi téma funguje jako řetězec kroků. Nejprve vznikne poznatek nebo doporučení, poté ho instituce zveřejní a následně se informace dostává k lidem, kteří ji používají při studiu, edukaci nebo rozhodování. U tématu „${theme.focus}“ je proto nutné sledovat autora, typ zdroje i účel sdělení.

Mechanismus se liší podle toho, zda zdroj reprezentuje ${sourceKind}. V tomto případě je důležitý důraz na ${systemContext}. MedScopeGlobal z takového zdroje vytváří strukturovaný výtah, aby čtenář nejprve porozuměl souvislostem a potom mohl přejít k původnímu materiálu.

## Klíčové myšlenky ze zdroje

Zdroj ${source.name} ukazuje, že téma „${theme.focus}“ nelze číst jako izolovanou krátkou zprávu. Je potřeba ho chápat v souvislosti s oborem ${specialization}, typem instituce a regionálním prostředím. Pro laika a studenta je hlavní hodnotou schopnost poznat, co je závěr zdroje a co je pouze zjednodušená interpretace.

Z výtahu vyplývá několik praktických závěrů. Tyto body nejsou náhradou za původní zdroj, ale pomáhají čtenáři rychle zachytit jeho směr a význam. Každý bod je třeba číst jako vstup k dalšímu ověření.

- ${source.name} poskytuje kontext, který pomáhá zařadit téma do oblasti ${specialization}.
- Typ zdroje je důležitý, protože ${sourceKind} klade důraz na jiné otázky než nemocnice, časopis nebo regulátor.
- Veřejný výtah má vysvětlit základní význam, ale detail je vhodné ověřit v původním zdroji.

## Hlavní přínosy

Hlavním přínosem je lepší orientace. Čtenář nemusí začínat u složitého institucionálního webu bez vysvětlení, ale získá mapu tématu a základní pojmy. To pomáhá zejména studentům, kteří se učí rozlišovat mezi zdrojem, důkazem a praktickým doporučením.

Dalším přínosem je transparentnost. Text jasně uvádí, že vychází ze zdroje ${source.name}, a neprezentuje se jako samostatná studie. Díky tomu může čtenář pokračovat k originálnímu materiálu a ověřit si detaily.

- rychlejší pochopení hlavního významu tématu,
- lepší rozlišení mezi odborným zdrojem a zjednodušeným výkladem,
- bezpečnější orientace pro veřejnost, studenty a začínající zdravotníky.

## Rizika a omezení

Každý výtah má limity. Nemůže zachytit kompletní metodologii, právní poznámky, všechny výjimky ani celé znění původního dokumentu. Pokud se informace týká konkrétního zdravotního rozhodnutí, je nutné obrátit se na kvalifikovaného odborníka.

Rizikem je také příliš rychlé zobecnění. Téma „${theme.focus}“ může záviset na regionu, populaci, typu zařízení nebo aktuálnosti zdroje. Proto výtah uvádí metadata a zachovává odkaz na původní zdroj.

- výtah není náhradou klinického doporučení ani osobní konzultace,
- některé detaily mohou být dostupné pouze v původním dokumentu,
- závěry je nutné číst podle data, regionu a typu instituce.

## Příklady použití

První scénář se týká studenta, který se připravuje na seminář. Výtah mu pomůže pochopit základní pojmy, najít souvislosti a rozhodnout, zda má otevřít původní zdroj. Druhý scénář se týká pacienta nebo veřejného čtenáře, který potřebuje bezpečné vysvětlení bez reklamního tónu.

Třetí scénář se týká zdravotnického pracovníka, který chce rychle posoudit relevanci tématu. Krátký monitoring mu ukáže směr, ale rozšířený výtah přidá kontext, omezení a praktický význam. Teprve poté dává smysl přejít k originálnímu zdroji.

- student použije výtah jako přípravu na další studium,
- veřejný čtenář získá bezpečné vysvětlení pojmu,
- odborník rychle pozná, zda zdroj stojí za detailní přečtení.

## Dopad na zdravotnictví / systém / pacienty

Dopad tématu se netýká jen jednotlivce. Pokud se informace správně vysvětlí, může zlepšit komunikaci mezi pacientem, studentem, lékařem a institucí. V oblasti ${specialization} může takový výklad podpořit prevenci, kvalitnější edukaci nebo bezpečnější používání nových postupů.

Systémový dopad vzniká tehdy, když se informace nepředává jako izolovaná zpráva. Strukturovaný výtah pomáhá rozlišit definici, přínosy, rizika a praktické příklady. Pacientům i studentům tak poskytuje pevnější základ pro otázky, které mohou klást odborníkům nebo vyučujícím.

## Shrnutí

Téma „${theme.focus}“ je v monitoringu zařazeno proto, že má vzdělávací, praktický a systémový význam. Zdroj ${source.name} poskytuje rámec, ze kterého lze odvodit hlavní souvislosti pro oblast ${specialization}. Pro úroveň ${audienceLabel} je nejdůležitější pochopit definici, praktický kontext, přínosy a omezení.

Výsledný text má fungovat jako rozšířený odborný výtah, nikoli jako krátká anotace. Pomáhá čtenáři porozumět tématu a současně ho vede zpět k původnímu zdroji. Tím podporuje bezpečnou zdravotní gramotnost a odpovědné čtení odborných informací.`;
}

function buildDailyArticles(): Article[] {
  const dailyPublicationDate = "2026-05-29";
  return Array.from({ length: dailyArticleTarget }, (_, index) => {
    const specialization = specializations[index % specializations.length];
    const source = articleSources[index % articleSources.length];
    const theme = sourceThemes[specialization][Math.floor(index / specializations.length) % sourceThemes[specialization].length];
    const audience = articleAudiences[index % articleAudiences.length].value;
    const sequence = String(index + 1).padStart(3, "0");
    const audienceLabel = audienceLabels[audience];

    return {
      id: `daily-${sequence}`,
      slug: `${slugify(specialization)}-${slugify(theme.tag)}-${slugify(source.country)}-${sequence}`,
      title: `${specialization}: denní monitoring - ${theme.focus}`,
      summary: `Rozšířený edukativní výtah pro segment ${audienceLabel} vycházející ze zdroje ${source.name} (${source.country}) a tématu ${theme.focus}.`,
      content: buildExtendedSourceExcerpt({ specialization, source, theme, audienceLabel }),
      author: "MedScopeGlobal Source Desk",
      date: dailyPublicationDate,
      source: source.name,
      sourceUrl: source.url,
      specialization,
      region: source.region,
      audience,
      readingTime: 10 + (index % 4),
      tags: [theme.tag, source.country, source.type, audienceLabel],
      featured: false
    } satisfies Article;
  });
}

const editorialArticles: Article[] = [
  { id: "a-001", slug: "ai-triage-primary-care", title: "AI triage v primární péči: praktický rámec pro bezpečné zavedení", summary: "Jak využít klinickou AI pro rychlejší orientaci pacienta bez ztráty odborného dohledu.", content: "AI triage pomáhá prioritizovat pacienty, ale musí být navržena jako podpůrný systém. Základem je audit vstupních dat, jasná odpovědnost lékaře, měření falešně negativních výstupů a průběžné vyhodnocování dopadu na čekací doby.", author: "MUDr. Eva Horáková", date: "2026-05-20", source: "MedScopeGlobal Editorial", sourceUrl: "https://medscopeglobal.com", specialization: "Digitální zdraví", region: "Evropa", audience: "clinician", readingTime: 5, tags: ["AI", "primární péče", "bezpečnost"], featured: true },
  { id: "a-002", slug: "cardio-prevention-2026", title: "Kardiovaskulární prevence 2026: co měnit v každodenní praxi", summary: "Nové preventivní postupy, které zvyšují adherenci a snižují riziko rehospitalizace.", content: "Moderní prevence kombinuje personalizovanou edukaci, monitorování krevního tlaku v domácím prostředí a rychlou úpravu léčby podle rizikového profilu. Největší dopad má jednoduchý plán kontroly a srozumitelná komunikace s pacientem.", author: "Prof. Jan Marek", date: "2026-04-28", source: "European Cardiology Review", sourceUrl: "https://www.escardio.org", specialization: "Kardiologie", region: "Česko", audience: "clinician", readingTime: 4, tags: ["prevence", "adherence", "kardiologie"] },
  { id: "a-003", slug: "oncology-real-world-evidence", title: "Real-world evidence v onkologii: od registrů k rozhodování", summary: "Jak propojit registry, lokální data a klinickou interpretaci pro lepší léčebné cesty.", content: "Real-world evidence doplňuje klinické studie o pohled na každodenní populaci pacientů. Hodnotu přináší zejména tam, kde jsou data kvalitně kurátorovaná, harmonizovaná a klinicky interpretovatelná.", author: "RNDr. Petra Novotná, Ph.D.", date: "2026-03-16", source: "MedScope Research Brief", sourceUrl: "https://www.esmo.org", specialization: "Onkologie", region: "Globální", audience: "researcher", readingTime: 6, tags: ["RWE", "registry", "onkologie"] }
];

export const dailyArticles = buildDailyArticles();
export const articles: Article[] = [...editorialArticles, ...dailyArticles];

export const events: MedicalEvent[] = [
  { id: "e-001", slug: "digital-health-prague-2026", title: "Digital Health Prague 2026", description: "Konference o bezpečné digitalizaci zdravotnictví, AI nástrojích a interoperabilitě.", startsAt: "2026-09-18T09:00:00+02:00", endsAt: "2026-09-18T17:00:00+02:00", timezone: "Europe/Prague", region: "Česko", format: "hybrid", specialization: "Digitální zdraví", organizer: "MedScopeGlobal", venue: "Praha + online stream", registrationUrl: "https://medscopeglobal.com/events/digital-health-prague-2026", approved: true },
  { id: "e-002", slug: "oncology-data-roundtable", title: "Oncology Data Roundtable", description: "Odborný kulatý stůl k využití reálných dat v onkologických centrech.", startsAt: "2026-10-07T13:00:00+02:00", endsAt: "2026-10-07T16:00:00+02:00", timezone: "Europe/Prague", region: "Evropa", format: "online", specialization: "Onkologie", organizer: "MedScope Research Network", registrationUrl: "https://medscopeglobal.com/events/oncology-data-roundtable", approved: true },
  { id: "e-003", slug: "cardiology-prevention-forum", title: "Cardiology Prevention Forum", description: "Praktické workshopy k prevenci, adherenci a vzdálenému monitoringu pacientů.", startsAt: "2026-11-12T10:00:00+01:00", endsAt: "2026-11-12T15:30:00+01:00", timezone: "Europe/Prague", region: "Slovensko", format: "in-person", specialization: "Kardiologie", organizer: "Central European Cardiology Group", venue: "Bratislava", approved: true }
];

export const funnelMetrics: FunnelMetric[] = [
  { label: "Visit", value: "100%", detail: "Vstupní návštěvy z organiky, referralů a kampaní" },
  { label: "Engagement", value: "42%", detail: "Čtení článků, filtry událostí, kliknutí na CTA" },
  { label: "Registration", value: "11%", detail: "Uložené role a preference pro personalizaci" },
  { label: "Return usage", value: "24%", detail: "Návrat k doporučenému obsahu a událostem" },
  { label: "Conversion", value: "7%", detail: "B2B lead, kontakt nebo kalendářový export" }
];
