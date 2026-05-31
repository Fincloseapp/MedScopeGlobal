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

  return `## Úvod: kontext a proč je téma důležité

Tento rozšířený výtah vychází z monitoringu zdroje ${source.name}, který reprezentuje ${sourceKind} v rámci ${regionalContext}. Téma „${theme.focus}“ je zařazeno do oblasti ${specialization}, protože se dotýká každodenního rozhodování pacientů, studentů i zdravotnických týmů. Pro úroveň ${audienceLabel} je důležité vysvětlit nejen samotný pojem, ale také to, jak se informace ze zdroje převádí do bezpečného porozumění. Cílem textu není nahradit původní dokument, ale vytvořit srozumitelný výtah, který pomůže čtenáři poznat hlavní směr, význam a praktické důsledky tématu.

Zdroj ${source.name} je v tomto monitoringu použit jako výchozí orientační bod. V praxi to znamená, že MedScopeGlobal nesleduje pouze název tématu, ale také původ informace, odborný kontext a možné dopady na systém péče. U tématu „${theme.focus}“ je podstatné, že se nejedná o izolovanou novinku, ale o část širšího vývoje v medicíně. Čtenář by měl po přečtení rozumět tomu, proč se o tématu mluví, jak se může projevit v praxi a proč je vhodné sledovat původní zdroj.

## Co téma znamená: definice a základní vysvětlení

Pojem „${theme.focus}“ označuje oblast, ve které se odborné poznatky, organizační postupy a potřeby pacientů propojují do konkrétního rozhodování. V oblasti ${specialization} může jít o prevenci, diagnostiku, léčbu, sledování kvality nebo bezpečné používání nových metod. Pro laika a studenta je důležité nejprve odlišit odborný termín od běžného dojmu: odborný pojem obvykle popisuje přesně vymezený proces, soubor pravidel nebo měřitelný jev. Proto text používá jednoduchý jazyk, ale zachovává přesnost zdroje.

Základní význam tématu se dá shrnout tak, že zdroj upozorňuje na vztah mezi znalostí a praktickým použitím. Pokud například ${source.name} zveřejňuje vzdělávací, regulační nebo odborné materiály, nejde pouze o informaci k přečtení, ale o návod, jak přemýšlet o kvalitě a bezpečnosti péče. Výtah proto zdůrazňuje definice, souvislosti a hranice platnosti. Čtenář by měl rozpoznat, co je pevný závěr zdroje, co je interpretace a kde je nutné vrátit se k původnímu dokumentu.

## Jak funguje v praxi: mechanismy a procesy

V praxi téma funguje jako součást řetězce rozhodnutí. Nejprve vzniká odborný poznatek nebo institucionální doporučení, poté se informace překládá do vzdělávání, klinické komunikace nebo organizačního postupu. U tématu „${theme.focus}“ je důležité sledovat, kdo je autorem zdroje, jaký typ instituce ho vydává a pro koho je informace určena. Právě proto monitoring uvádí zdroj, region, specializaci a tagy, aby čtenář nečetl informaci bez kontextu.

Mechanismus použití se liší podle typu zdroje. U regulatorních institucí je důraz na ${systemContext}, zatímco u univerzit a odborných společností bývá důležitější výuka, metodika a schopnost vysvětlit téma budoucím zdravotníkům. U veřejných článků v MedScopeGlobal je proces záměrně zjednodušený: čtenář nejprve získá srozumitelný výtah, poté může přejít na původní zdroj a ověřit detail. Tento postup podporuje kritické čtení místo pasivního přejímání krátké anotace.

### Klíčové myšlenky ze zdroje

- ${source.name} poskytuje kontext, který pomáhá zařadit téma „${theme.focus}“ do oblasti ${specialization}.
- Zdroj je nutné chápat podle typu instituce: ${sourceKind} klade důraz na jiné otázky než časopis, nemocnice nebo regulační autorita.
- Veřejný a studentský výtah má vysvětlit základní smysl, nikoli nahradit kompletní odborný dokument.
- Přechod na původní zdroj je důležitý pro ověření detailů, aktuálnosti a přesného znění závěrů.

## Hlavní přínosy

Hlavním přínosem strukturovaného výtahu je lepší orientace. Čtenář nemusí začínat od složitého institucionálního webu nebo odborného dokumentu bez kontextu, ale získá úvodní mapu tématu. U oblasti ${specialization} je taková orientace důležitá, protože stejný pojem může mít klinický, vzdělávací, systémový i pacientský význam. Přínosem je také transparentnost: text jasně uvádí, že vychází ze zdroje ${source.name}, a odkazuje čtenáře zpět na původní materiál.

Dalším přínosem je schopnost propojit téma s praxí. Student může pochopit základní definice, laik získá bezpečné vysvětlení bez přehnaných slibů a odborník rychle pozná, zda má smysl otevřít původní zdroj. Výtah zároveň podporuje mediální a zdravotní gramotnost, tedy schopnost rozlišovat zdroj, důkaz, interpretaci a doporučení. To je zvlášť důležité u témat, která se týkají prevence, digitálních nástrojů, léčiv nebo veřejného zdraví.

## Rizika a omezení

Každý výtah má omezení. I když text aktivně pracuje se zdrojem, nemůže zachytit všechny detaily, metodologii, právní poznámky nebo kompletní seznam doporučení. Proto je u veřejné a studentské úrovně nutné zdůraznit, že výtah slouží jako vzdělávací orientace. Pokud se informace týká osobního zdravotního problému, rozhodnutí o léčbě nebo konkrétního pacienta, je potřeba obrátit se na kvalifikovaného zdravotníka.

Dalším rizikem je příliš jednoduchá interpretace. Téma „${theme.focus}“ může vypadat srozumitelně, ale v praxi může záviset na populaci pacientů, regionu, typu zdravotnického zařízení nebo aktuálnosti doporučení. Zdroj ${source.name} může být velmi relevantní, ale čtenář musí zohlednit datum, typ instituce a účel publikace. Proto MedScopeGlobal uvádí metadata a zdrojové odkazy, aby bylo možné dohledat původní kontext.

## Příklady použití v reálných scénářích

První scénář se týká studenta, který se připravuje na seminář nebo praxi. Díky výtahu rychle pochopí, jak téma souvisí s oblastí ${specialization}, jaké pojmy si má vyjasnit a proč je vhodné přečíst původní zdroj. Druhý scénář se týká pacienta nebo veřejného čtenáře, který narazí na odborný termín a potřebuje bezpečné vysvětlení bez reklamního nebo senzacechtivého tónu. Třetí scénář se týká zdravotnického pracovníka, který chce rychle poznat, zda má zdroj význam pro jeho další studium.

V praxi může čtenář postupovat ve třech krocích. Nejprve si přečte tento výtah, aby porozuměl hlavním pojmům a souvislostem. Poté otevře zdroj ${source.name}, kde najde přesnější dokument, aktualitu nebo institucionální informaci. Nakonec si vyhodnotí, zda je téma relevantní pro jeho studium, práci, komunikaci s pacientem nebo další rešerši.

## Dopad na zdravotnictví, systém a pacienty

Dopad tématu se neomezuje na jednotlivce. Pokud se informace ze zdroje správně vysvětlí a zasadí do kontextu, může zlepšit komunikaci mezi pacientem, studentem, lékařem a institucí. V oblasti ${specialization} to může znamenat lepší orientaci v prevenci, včasnější dotazy na správná témata, kvalitnější edukaci nebo bezpečnější používání digitálních a klinických postupů. Systémový dopad vzniká tehdy, když se informace nepředává jako izolovaná zpráva, ale jako součást širší znalostní infrastruktury.

Pro pacienty a veřejnost je důležitá zejména srozumitelnost. Pokud je zdroj příliš odborný, může být obtížné rozpoznat, co je hlavní závěr a co je pouze detail. Strukturovaný výtah pomáhá oddělit definici, přínosy, rizika a praktické příklady. Pro zdravotnický systém je zase důležité, aby veřejné informace nepodporovaly zjednodušené závěry, ale vedly čtenáře k ověřování a odpovědnému rozhodování.

## Shrnutí: klíčové poznatky ze zdroje

Téma „${theme.focus}“ je v monitoringu zařazeno proto, že má vzdělávací, praktický a systémový význam. Zdroj ${source.name} poskytuje výchozí odborný nebo institucionální rámec, ze kterého lze odvodit hlavní souvislosti pro oblast ${specialization}. Pro úroveň ${audienceLabel} je nejdůležitější pochopit definici, praktický kontext, přínosy a omezení. Výtah proto zdůrazňuje, že zdroj je třeba číst aktivně a že kompletní informace je vhodné ověřit přímo v původním materiálu.

Závěrem lze říci, že kvalitní edukativní výtah nemá být krátkou anotací. Má fungovat jako most mezi odborným zdrojem a čtenářem, který potřebuje porozumět tématu bez ztráty přesnosti. MedScopeGlobal proto propojuje veřejný text, metadata a odkaz na zdroj tak, aby čtenář mohl pokračovat od základního porozumění k hlubšímu studiu.`;
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
