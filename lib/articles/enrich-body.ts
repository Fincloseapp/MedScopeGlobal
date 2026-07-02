type EnrichableArticle = {
  title: string;
  excerpt?: string | null;
  content: string;
  med_track?: string | null;
  study_year?: number | null;
  learning_objectives?: string[] | null;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isStubContent(content: string): boolean {
  return stripHtml(content).length < 600;
}

function section(title: string, paragraphs: string[]): string {
  const body = paragraphs.map((p) => `<p>${p}</p>`).join("");
  return `<h2>${title}</h2>${body}`;
}

function listSection(title: string, items: string[]): string {
  const lis = items.map((item) => `<li>${item}</li>`).join("");
  return `<h2>${title}</h2><ul>${lis}</ul>`;
}

function buildPripravaBody(article: EnrichableArticle): string {
  const intro =
    article.excerpt?.trim() ||
    "Strukturovaná příprava na přijímačky na lékařskou fakultu vyžaduje denní rutinu, ne jen intenzivní sprint před termínem.";

  return [
    section("Proč na přípravu nestačí jen „učit se víc\"", [
      intro,
      "Přijímačky na LF testují schopnost aplikovat znalosti pod časovým tlakem. Proto je důležité střídat opakování, řešení otázek a reflexi chyb — ne jen pasivní čtení skript.",
      "Tento článek shrnuje praktický týdenní rámec, který pomáhá udržet tempo bez vyhoření.",
    ]),
    listSection("Denní minimum (cca 90 minut)", [
      "30 minut opakování biologie a chemie — zaměřte se na slabá témata z minulého týdne.",
      "30 minut řešení přijímačkových otázek s časovým limitem.",
      "15 minut zápis chyb do „error logu“ — proč jste odpověděli špatně?",
      "15 minut čtení odborného textu (populárně-naučný článek) pro rozvoj slovní zásoby.",
    ]),
    listSection("Týdenní plán", [
      "Pondělí–středa: intenzivní opakování + testové otázky.",
      "Čtvrtek: simulovaný test (celý blok, bez přestávek).",
      "Pátek: analýza chyb a doplnění mezer.",
      "Víkend: lehčí den — shrnutí týdne, příprava plánu na další.",
    ]),
    section("Co často podceňujete", [
      "Spánek a regenerace — kognitivní výkon klesá po několika dnech bez odpočinku.",
      "Práce s časem u testu — naučte se přeskakovat obtížné otázky a vracet se k nim.",
      "Zdravý životní styl — hydratace, pohyb a strava ovlivňují soustředění víc, než si studenti připouštějí.",
    ]),
    section("Jak poznáte, že jste na dobré cestě", [
      "Počet opakovaných chyb klesá týden od týdne.",
      "Zvládáte dokončit simulovaný test v limitu s rozumnou přesností.",
      "Umíte vysvětlit vlastní odpověď — ne jen uhodnout správnou variantu.",
    ]),
  ].join("");
}

function buildStudiumBody(article: EnrichableArticle): string {
  const year = article.study_year ?? 1;
  const intro =
    article.excerpt?.trim() ||
    `Studenti ${year}. ročníku se poprvé setkávají s vědeckými články — klíčem je systematické čtení, ne lineární čtení od úvodu do závěru.`;

  return [
    section("Jak číst klinickou studii krok za krokem", [
      intro,
      "Začněte abstraktem a závěrem — zjistíte, zda má článek pro vás vůbec smysl. Teprve potom čtěte metodiku a výsledky.",
      "U každého článku si položte čtyři otázky: Jaká byla výzkumná otázka? Jaký byl design? Co ukázaly výsledky? Co to znamená pro pacienta?",
    ]),
    listSection("Struktura článku — co hledat", [
      "<strong>Úvod:</strong> proč autoři studii dělali a jaká je hypotéza.",
      "<strong>Metody:</strong> populace, intervence, primární endpoint, délka sledování.",
      "<strong>Výsledky:</strong> hlavní výsledky, nejdřív tabulky a grafy, pak text.",
      "<strong>Diskuse:</strong> interpretace, limity studie, srovnání s literaturou.",
    ]),
    listSection("Červené vlajky u metodiky", [
      "Malý vzorek bez výpočtu velikosti vzorku.",
      "Chybějící randomizace u intervenční studie.",
      "Primární endpoint změněn po skončení studie (post-hoc analýzy).",
      "Konflikt zájmů autorů nebo financování od firmy bez transparentního uvedení.",
    ]),
    section("Z výsledků do klinické praxe", [
      "Statistická významnost (p &lt; 0,05) neznamená automaticky klinickou významnost — sledujte velikost efektu a NNT/NNH, pokud jsou uvedeny.",
      "Porovnávejte výsledky s guidelines a reálnou praxí — studie v ideálních podmínkách nemusí platit pro vaše oddělení.",
      "Udržujte si poznámky ve formátu „1 věta shrnutí + 1 klinický takeaway“ — usnadní to opakování před zkouškami.",
    ]),
    section("Doporučený workflow pro začátečníka", [
      "Vyberte jeden článek týdně z doporučeného seznamu přednášejícího.",
      "První čtení: 15 minut — abstrakt, závěr, tabulka 1 (baseline).",
      "Druhé čtení: 45 minut — metody + hlavní výsledky s poznámkami.",
      "Na seminář přineste jednu otázku autorům nebo spolužákům.",
    ]),
  ].join("");
}

function buildGenericBody(article: EnrichableArticle): string {
  const intro =
    article.excerpt?.trim() ||
    "Praktický přehled pro studenty a lékaře v ambulantní praxi.";

  const objectives = article.learning_objectives?.length
    ? article.learning_objectives
    : [
        "Porozumět hlavnímu klinickému kontextu",
        "Aplikovat doporučení v každodenní praxi",
        "Vyhodnotit limity a rizika",
      ];

  return [
    section("Shrnutí", [intro]),
    listSection("Klíčové body", objectives),
    section("Klinický kontext", [
      "Obsah je připraven redakcí MedScopeGlobal jako vzdělávací materiál. Vždy ověřte aktuální guidelines a lokální protokoly před klinickým rozhodnutím.",
      "U složitějších případů konzultujte specialista — tento článek nenahrazuje individuální péči.",
    ]),
    section("Další kroky", [
      "Projděte související články v sekci Medicína nebo odborné briefy.",
      "Uložte si klíčové poznámky pro opakování před zkouškou nebo atestací.",
    ]),
  ].join("");
}

/** Expand stub editorial HTML into a fuller article for detail pages. */
export function enrichArticleBodyForDisplay(article: EnrichableArticle): string {
  if (!isStubContent(article.content)) {
    return article.content;
  }

  const medTrack = article.med_track;
  if (medTrack === "priprava") {
    return buildPripravaBody(article);
  }
  if (medTrack === "studium") {
    return buildStudiumBody(article);
  }

  return buildGenericBody(article);
}
