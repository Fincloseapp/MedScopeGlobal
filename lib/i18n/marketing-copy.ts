import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizeListedCzkIn } from "@/lib/i18n/payment-currency";
import type { AppProductId } from "@/lib/apps/catalog";

function pack(locale?: string | null): string {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  return primary === "cs" ? "cs" : primary;
}

export type MarketingCopy = {
  disclaimerTitle: string;
  disclaimerAria: string;
  disclaimerBanner: string;
  disclaimerInline: string;
  apps: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    lead: string;
    trialCta: string;
    catalogCta: string;
    openApp: string;
    howItWorks: string;
    downloadTitle: string;
    openInstalled: string;
    installLead: string;
    stepIos: string;
    stepAndroid: string;
    stepDesktop: string;
    scanInstall: string;
    eyebrowApps: string;
    pitch: Record<AppProductId, string>;
  };
  about: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    cta: string;
    home: string;
    missionTitle: string;
    mission: string;
    forWhomTitle: string;
    forWhom: string;
    independenceTitle: string;
    independence: string;
    brandLink: string;
    qualityTitle: string;
    quality: string;
    contactTitle: string;
    contactBefore: string;
    contactLink: string;
    contactAfter: string;
    audiences: { href: string; label: string; desc: string }[];
  };
  publicHub: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    lead: string;
    lastArticle: string;
    downloadApp: string;
    findProblem: string;
    browseArticles: string;
    dailyTip: string;
    askAi: string;
    startEyebrow: string;
    startTitle: string;
    linksEyebrow: string;
    linksTitle: string;
    topicsEyebrow: string;
    topicsTitle: string;
    allTopics: string;
    latestTitle: string;
    showAll: string;
    empty: string;
    emptyHint: string;
    steps: { title: string; desc: string; cta: string }[];
    quick: { href: string; label: string; desc: string }[];
    topics: Record<string, { label: string; description: string }>;
  };
  students: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    titleLine2: string;
    lead: string;
    priceLine: string;
    downloadPrep: string;
    wantMedicine: string;
    iAmParent: string;
    crumbAria: string;
    home: string;
    students: string;
    applicantEyebrow: string;
    applicantTitle: string;
    applicantLead: string;
    pickPath: string;
    applicantH2: string;
    applicantSub: string;
    applicantBody: string;
    openPrep: string;
    onLfH2: string;
    onLfSub: string;
    onLfBody: string;
    openMaterials: string;
    studentPlan: string;
    lfEyebrow: string;
    lfTitle: string;
    lfLead: string;
    parentsEyebrow: string;
    parentsTitle: string;
    parentsBody: string;
    parentBullets: string[];
    giftTrial: string;
    showPrep: string;
    subTitle: string;
    subLead: string;
    subBenefits: string[];
    daysFree: string;
    comparePlans: string;
    moreTitle: string;
    moreLead: string;
    applicant: { href: string; title: string; body: string }[];
    onLf: { href: string; title: string; body: string }[];
    more: { href: string; title: string; body: string }[];
    applicantSteps: { title: string; body: string; cta: string }[];
    lfSteps: { title: string; body: string; cta: string }[];
  };
  contact: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    lead: string;
    mainContact: string;
    ads: string;
    phone: string;
    operator: string;
    sendResearch: string;
    showPricing: string;
    replyEyebrow: string;
    replyTitle: string;
    replyLead: string;
    contactsTitle: string;
    contactsBody: string;
    phoneSupport: string;
    seat: string;
    safeTitle: string;
    safeBody: string;
    trustEyebrow: string;
    trustTitle: string;
    privacy: string;
    about: string;
    generalTitle: string;
    generalDesc: string;
    partnerTitle: string;
    partnerDesc: string;
  };
};

const CS: MarketingCopy = {
  disclaimerTitle: "Důležité upozornění",
  disclaimerAria: "Důležité upozornění",
  disclaimerBanner:
    "Obsah veřejné sekce slouží ke vzdělávání — nenahrazuje lékařskou péči ani diagnózu. Při akutních potížích kontaktujte praktického lékaře nebo volejte 155 / 112.",
  disclaimerInline:
    "Informace na MedScopeGlobal slouží ke vzdělávání a orientaci ve zdraví. Nenahrazují vyšetření ani léčbu u lékaře. V akutních případech volejte 155 nebo 112.",
  apps: {
    metaTitle: "Aplikace MedScopeGlobal — MediFlow, MeDipacient, OrdiZapis",
    metaDescription:
      "Wellness deník MediFlow, MeDipacient pro zprávy a OrdiZapis pro lékaře — plus legacy MeDiprep pro přípravu na LF. Stažení na mobil jako PWA.",
    title: "Aplikace",
    lead: "MediFlow, MeDipacient a OrdiZapis — wellness, zprávy a zápisy na jedné platformě.",
    trialCta: "14 dní zdarma",
    catalogCta: "Prohlédnout katalog",
    openApp: "Otevřít",
    howItWorks: "Jak to funguje",
    downloadTitle: "Stáhnout",
    openInstalled: "Otevřít aplikaci",
    installLead: "Nainstalujete z prohlížeče na plochu telefonu i PC — bez App Store i Google Play.",
    stepIos: "1. iPhone: Safari → Sdílet → Přidat na plochu",
    stepAndroid: "2. Android: Chrome → Nainstalovat aplikaci",
    stepDesktop: "3. PC: Chrome/Edge → ikona ⊕ v adresním řádku",
    scanInstall: "Naskenujte a nainstalujte",
    eyebrowApps: "Aplikace",
    pitch: {
      medipacient:
        "Vyfoťte PDF nebo fotografii lékařské zprávy — i bez dat. Po připojení se soubor přečte, OCR vytáhne diagnózy, léky a kontroly.",
      mediprep:
        "Příprava na přijímačky 8 českých lékařských fakult. Originální testy biologie, chemie a fyziky. E-mail + kód, bez hesla. První test zdarma.",
      ordizapis: "Nahrávejte v mobilu — diktát i konzultace. AI připraví zápis podle šablony.",
      mediflow: "Osobní wellness deník — články, symptomy, suplementy a longevity protokoly.",
    },
  },
  about: {
    metaTitle: "O nás | MedScopeGlobal",
    metaDescription:
      "MedScopeGlobal je český odborný medicínský portál pro laiky, studenty medicíny, lékaře a výzkumníky.",
    eyebrow: "O nás",
    title: "MedScopeGlobal — odborný medicínský portál pro ČR",
    cta: "Kontaktujte nás",
    home: "Domů",
    missionTitle: "Naše mise",
    mission:
      "MedScopeGlobal propojuje klinickou praxi, vědecký výzkum a vzdělávání v medicíně. Kurátorský obsah, citace zdrojů a odborné rubriky pomáhají lékařům, studentům i veřejnosti orientovat se v rychle se měnící medicíně.",
    forWhomTitle: "Pro koho jsme tu",
    forWhom: "Vyberte sekci podle toho, kdo jste — každá cesta má vlastní obsah a nástroje.",
    independenceTitle: "Nezávislost značky",
    independence:
      "MedScopeGlobal je nezávislá platforma na doméně medscopeglobal.com. Nejsme spřízněni s Medscape, WebMD ani s jinými zahraničními medicínskými portály se podobným názvem. Nejsme jejich českou mutací ani licencí.",
    brandLink: "Značka a duševní vlastnictví",
    qualityTitle: "Kvalita a bezpečnost",
    quality:
      "Obsah prochází redakční kontrolou. AI nástroje jsou auditovány a nepředstavují náhradu odborné zdravotní péče. V akutních případech volejte linku 155 nebo 112.",
    contactTitle: "Kontakt a spolupráce",
    contactBefore: "Máte dotaz k obsahu, chcete navázat partnerství nebo inzerci? Navštivte stránku",
    contactLink: "Kontakt",
    contactAfter: "— odpovídáme obvykle do 24 hodin.",
    audiences: [
      { href: "/verejnost", label: "Veřejnost", desc: "Prevence, symptomy a životní styl srozumitelně" },
      { href: "/studenti", label: "Studenti", desc: "Anatomie, farmakologie a příprava na LF" },
      { href: "/lekari", label: "Lékaři", desc: "Guidelines, studie a klinické briefy" },
      { href: "/studie", label: "Výzkum", desc: "Přehled studií a evidence-based obsah" },
    ],
  },
  publicHub: {
    metaTitle: "Veřejné zdraví | MedScopeGlobal",
    metaDescription:
      "Průvodce nemocemi, prevence, výživa, spánek, stres a rozhovory s odborníky — srozumitelně pro každého.",
    eyebrow: "Pro každého · Veřejné zdraví",
    title: "Zdraví srozumitelně — bez odborného žargonu",
    lead: "Průvodce prevencí, symptomy, výživou, spánkem, stresem a dlouhověkostí. Obsah pro širokou veřejnost — vzdělávací, nikoli náhrada lékařské péče.",
    lastArticle: "Poslední článek:",
    downloadApp: "Stáhnout MeDipacient",
    findProblem: "Najdi svůj problém",
    browseArticles: "Prohlédnout články",
    dailyTip: "Dnešní zdravotní tip",
    askAi: "Zeptej se AI",
    startEyebrow: "Jak začít",
    startTitle: "Tři kroky pro orientaci ve zdraví",
    linksEyebrow: "Rychlé odkazy",
    linksTitle: "Co zde najdete",
    topicsEyebrow: "Témata",
    topicsTitle: "Prozkoumejte oblasti",
    allTopics: "Všechna témata →",
    latestTitle: "Nejnovější články",
    showAll: "Zobrazit vše →",
    empty: "První články pro veřejnost se připravují — obsah doplní AI redakce medscopeglobal.com.",
    emptyHint: "Prevence · výživa · spánek · stres · ergonomie · rozhovory",
    steps: [
      {
        title: "Najděte své téma",
        desc: "Projděte kategorie podle oblasti zdraví — prevence, výživa, spánek a další.",
        cta: "Procházet témata",
      },
      {
        title: "Přečtěte článek nebo tip",
        desc: "Krátké texty bez odborného žargonu. Denní video tip s kvízem.",
        cta: "Zobrazit články",
      },
      {
        title: "Zeptejte se AI (volitelně)",
        desc: "Srozumitelné odpovědi o prevenci a životním stylu — nenahrazují návštěvu lékaře.",
        cta: "Zeptat se AI",
      },
    ],
    quick: [
      { href: "/verejnost/temata", label: "Najdi svůj problém", desc: "Symptomy, prevence, nemoci — začněte zde" },
      { href: "/verejnost/clanky", label: "Články pro veřejnost", desc: "Srozumitelné texty" },
      { href: "/verejnost/clanky?topic=dlouhovekost", label: "Dlouhověkost", desc: "Healthspan, spánek, pohyb a biomarkery" },
      { href: "/verejnost/osveta", label: "Denní zdravotní tip", desc: "Krátké video s avatarem a kvízem" },
      { href: "/ai-asistent/verejnost", label: "Zeptej se AI", desc: "Odpovědi o prevenci — nenahrazuje lékaře" },
      { href: "/verejnost/rozhovory", label: "Rozhovory s odborníky", desc: "Lékaři a specialisté vysvětlují srozumitelně" },
      { href: "/verejnost/zebricek", label: "Žebříček XP", desc: "Body za sledování tipů a kvízy" },
    ],
    topics: {
      "pruvodce-nemocemi": { label: "Průvodce nemocemi", description: "Srozumitelné průvodce běžnými i závažnějšími onemocněními." },
      symptomy: { label: "Symptomy", description: "Co mohou příznaky znamenat a kdy vyhledat lékaře." },
      prevence: { label: "Prevence", description: "Očkování, screening a prevence chronických onemocnění." },
      "zivotni-styl": { label: "Životní styl", description: "Pohyb, návyky a každodenní rozhodnutí pro zdraví." },
      vyziva: { label: "Výživa", description: "Vyvážená strava, vitamíny a stravovací mýty." },
      spanek: { label: "Spánek", description: "Hygiena spánku, poruchy spánku a regenerace." },
      stres: { label: "Stres", description: "Psychická pohoda, stres management a odolnost." },
      ergonomie: { label: "Ergonomie", description: "Práce u počítače, držení těla a prevence bolesti." },
      rozhovory: { label: "Rozhovory", description: "Rozhovory s odborníky pro širokou veřejnost." },
      dlouhovekost: { label: "Dlouhověkost", description: "Healthspan, prevence stárnutí, spánek, pohyb a biomarkery." },
    },
  },
  students: {
    metaTitle: "MedScope pro studenty a uchazeče o medicínu",
    metaDescription:
      "Příprava na přijímačky na LF, studijní materiály a kvízy. 1 test zdarma, první měsíc 89 Kč, další 149 Kč (EU 10 €).",
    eyebrow: "MedScope · Studenti",
    title: "MedScope pro cestu na medicínu",
    titleLine2: "a studium na LF",
    lead: "Jedna přehledná mapa: kvízy, odbornost, fakulty a žebříček přezdívek. 1 test zdarma — první měsíc 89 Kč, další 149 Kč, zrušíte kdykoli.",
    priceLine: "1 test zdarma · dnes 89 Kč · další měsíc 149 Kč · zrušíte kdykoli",
    downloadPrep: "Stáhnout MeDiprep",
    wantMedicine: "Chci na medicínu",
    iAmParent: "Jsem rodič",
    crumbAria: "Drobečková navigace",
    home: "Domů",
    students: "Studenti",
    applicantEyebrow: "Doporučený start · uchazeči",
    applicantTitle: "Tři kroky dnes — pak předplatné dává smysl",
    applicantLead:
      "Nejdřív ochutnejte obsah. Teprve když vidíte styl a zpětnou vazbu, má smysl otevřít celé studentské předplatné.",
    pickPath: "Vyberte si cestu",
    applicantH2: "Chci na medicínu",
    applicantSub: "Uchazeč · gymnázium · příprava na přijímačky LF",
    applicantBody:
      "Sem patří přípravné kurzy Academy, self-test a termíny fakult. Není to „kompletní doučování na míru“ — je to strukturovaná příprava, kterou si hned vyzkoušíte.",
    openPrep: "Otevřít přípravu na přijímačky",
    onLfH2: "Už studuji na LF",
    onLfSub: "1.–6. ročník · materiály, testy, opakování",
    onLfBody:
      "Sem patří knihovna materiálů, kvízy a AI tutor. Cíl je rychlá orientace — ne další nepřehledný dashboard.",
    openMaterials: "Otevřít studijní materiály",
    studentPlan: "Studentské předplatné",
    lfEyebrow: "Doporučený start · studenti LF",
    lfTitle: "Tři kroky během semestru",
    lfLead:
      "Nejdřív najděte materiál, pak si látku procvičte. AI tutor je doplněk — ne náhrada přednášek ani skript z fakulty.",
    parentsEyebrow: "Pro rodiče",
    parentsTitle: "Podpora přípravy — srozumitelně a bez přehánění",
    parentsBody:
      "Předplatné Student LF (89 Kč první měsíc, pak 149 Kč) otevírá Academy a AI tutor. Nezaručuje přijetí na medicínu. Koupíte, pošlete odkaz — dítě aktivuje na svém účtu.",
    parentBullets: [
      "1 test zdarma — bez karty",
      "První měsíc 89 Kč, další 149 Kč — zrušíte kdykoli",
      "Cena srovnatelná s jedním doučováním",
      "Po platbě odkaz, který přepošlete studentovi",
    ],
    giftTrial: "Koupit dárek a poslat odkaz",
    showPrep: "Ukázat dítěti přípravu",
    subTitle: "Studentské předplatné — 89 Kč, pak 149 Kč",
    subLead:
      "Free vrstva stačí na ochutnávku. Předplatné je pro ty, kdo chtějí pravidelnou přípravu nebo studijní oporu během semestru.",
    subBenefits: [
      "Všechny přípravné kurzy Academy (ne jen první lekce)",
      "AI tutor a studijní materiály bez omezení free vrstvy",
      "Kvízy, hry a procvičení — opakované použití během semestru",
      "1 test zdarma, první měsíc 89 Kč, pak 149 Kč (Student LF)",
    ],
    daysFree: "1 test zdarma · 89 Kč",
    comparePlans: "Porovnat plány",
    moreTitle: "Další užitečné sekce",
    moreLead: "Rozcestníky — vedou dál do obsahu MedScope, ne nahrazují celý předmět.",
    applicant: [
      { href: "/studenti/chci-studovat", title: "Přípravné kurzy Academy", body: "Biologie, chemie, fyzika, fyziologie — lekce, slidy a kvízy. První lekce zdarma." },
      { href: "/academy/prijimacky/self-test", title: "Self-test přijímaček", body: "Rychlý přehled silných a slabých míst — ideální první krok před kurzy." },
      { href: "/studium/prijimacky", title: "Termíny a požadavky LF", body: "Přehled fakult a přijímacího řízení — ať víte, na co se připravovat." },
    ],
    onLf: [
      { href: "/studenti/materialy", title: "Studijní materiály", body: "Knihovna článků a podkladů podle témat — rychlá orientace během semestru." },
      { href: "/studenti/testy", title: "Testy a procvičení", body: "Modelové otázky a procvičení — odděleně od studijních her." },
      { href: "/studenti/ai-tutor", title: "AI tutor", body: "Dotazy k látce v kontextu studia — doplněk k materiálům, ne náhrada přednášek." },
    ],
    more: [
      { href: "/studenti/hry", title: "Kvízy a studijní hry", body: "Krátké hry na opakování — anatomie, fyziologie i přijímačky." },
      { href: "/studenti/leky", title: "Léky (SÚKL)", body: "Vyhledávání léčiv — praktický rozcestník, ne farmakologický kurz." },
      { href: "/studenti/zkousky", title: "Zkoušky a semestr", body: "Orientace ke zkouškovému období a opakování." },
      { href: "/medicina/plany", title: "Studijní plány", body: "Strukturované cesty studiem napříč MedScope." },
    ],
    applicantSteps: [
      { title: "Self-test v MeDiprep (5–10 min)", body: "Zjistíte, kde jste a co dohnat — v aplikaci na ploše telefonu.", cta: "Otevřít MeDiprep" },
      { title: "Jedna lekce zdarma", body: "Uvidíte styl videa, slidů a kvízů.", cta: "Otevřít kurzy" },
      { title: "Koupit za 89 Kč", body: "Dnes 89 Kč, další měsíc 149 Kč. Zrušíte kdykoli.", cta: "Otevřít předplatné" },
    ],
    lfSteps: [
      { title: "Materiály podle tématu", body: "Najděte podklad ke zkoušce nebo semináři.", cta: "Otevřít knihovnu" },
      { title: "Procvičení", body: "Kvízy a testy — krátké opakování před testem.", cta: "Spustit procvičení" },
      { title: "AI tutor", body: "Doptat se na nejasnou látku, když není čas čekat.", cta: "Otevřít AI tutor" },
    ],
  },
  contact: {
    metaTitle: "Kontakt | MedScopeGlobal",
    metaDescription: "Kontaktujte MedScopeGlobal pro odborné informace, partnerství nebo reklamní spolupráci.",
    eyebrow: "Kontakt",
    title: "Napište nám — odpovíme do 24 hodin",
    lead: "Dotazy k obsahu pro veřejnost, partnerství s univerzitami, reklamní spolupráce i technická podpora. Každá zpráva je evidována a směrována správnému týmu.",
    mainContact: "Hlavní kontakt",
    ads: "Reklamy & inzerce",
    phone: "Telefon",
    operator: "Provozovatel",
    sendResearch: "Odeslat výzkum",
    showPricing: "Zobrazit ceník",
    replyEyebrow: "Odpověď do 24 hodin",
    replyTitle: "Prioritizovaný kontakt",
    replyLead: "Zprávy z kontaktního formuláře jsou směrovány podle typu žádosti a každý dotaz je evidován.",
    contactsTitle: "Hlavní kontakty",
    contactsBody: "pro odborné dotazy, publikace a spolupráce.",
    phoneSupport: "Telefon podpory",
    seat: "Sídlo",
    safeTitle: "Bezpečné zpracování",
    safeBody: "Formuláře mají validaci, anti-spam ochranu a auditní logování.",
    trustEyebrow: "Důvěra a bezpečnost",
    trustTitle: "Proč nám můžete napsat",
    privacy: "Ochrana soukromí (GDPR)",
    about: "O nás",
    generalTitle: "Obecný dotaz",
    generalDesc: "Napište nám, pokud potřebujete informace o obsahu, spolupráci nebo publikaci.",
    partnerTitle: "Partnerský kontakt",
    partnerDesc: "Pro reklamní spolupráci, inzerci nebo komerční partnerství využijte tento formulář.",
  },
};

const EN: MarketingCopy = {
  disclaimerTitle: "Important notice",
  disclaimerAria: "Important notice",
  disclaimerBanner:
    "Public-section content is for education — it does not replace medical care or a diagnosis. For acute problems contact a physician or call emergency services.",
  disclaimerInline:
    "Information on MedScopeGlobal is for education and orientation. It does not replace an examination or treatment. In emergencies call local emergency services.",
  apps: {
    metaTitle: "MedScopeGlobal apps — MediFlow, MeDipacient, OrdiZapis",
    metaDescription:
      "MediFlow wellness journal, MeDipacient for reports and OrdiZapis for physicians — plus legacy MeDiprep for Czech faculty admissions. Install as a PWA.",
    title: "Apps",
    lead: "MediFlow, MeDipacient and OrdiZapis — wellness, reports and notes on one platform.",
    trialCta: "14 days free",
    catalogCta: "Browse the catalogue",
    openApp: "Open",
    howItWorks: "How it works",
    downloadTitle: "Download",
    openInstalled: "Open the app",
    installLead: "Install from the browser onto your phone or PC home screen — no App Store or Google Play.",
    stepIos: "1. iPhone: Safari → Share → Add to Home Screen",
    stepAndroid: "2. Android: Chrome → Install app",
    stepDesktop: "3. PC: Chrome/Edge → ⊕ icon in the address bar",
    scanInstall: "Scan and install",
    eyebrowApps: "Apps",
    pitch: {
      medipacient:
        "Photograph a PDF or a medical report — even offline. When you reconnect, OCR extracts diagnoses, medicines and follow-ups.",
      mediprep:
        "Prep for admissions at 8 Czech medical faculties. Original biology, chemistry and physics tests. Email + code, no password. First test free.",
      ordizapis: "Record on mobile — dictation or a consult. AI drafts the note from a template.",
      mediflow: "Personal wellness journal — articles, symptoms, supplements and longevity protocols.",
    },
  },
  about: {
    metaTitle: "About | MedScopeGlobal",
    metaDescription:
      "MedScopeGlobal is a Czech medical portal for the public, medical students, physicians and researchers.",
    eyebrow: "About",
    title: "MedScopeGlobal — a medical portal for Czechia",
    cta: "Contact us",
    home: "Home",
    missionTitle: "Our mission",
    mission:
      "MedScopeGlobal connects clinical practice, research and medical education. Curated content, citations and professional desks help physicians, students and the public navigate fast-changing medicine.",
    forWhomTitle: "Who we serve",
    forWhom: "Pick the section that matches you — each path has its own content and tools.",
    independenceTitle: "Brand independence",
    independence:
      "MedScopeGlobal is an independent platform on medscopeglobal.com. We are not affiliated with Medscape, WebMD or other similarly named foreign medical portals. We are not their Czech edition or licence.",
    brandLink: "Brand and intellectual property",
    qualityTitle: "Quality and safety",
    quality:
      "Content goes through editorial review. AI tools are audited and are not a substitute for professional care. In emergencies call 155 or 112.",
    contactTitle: "Contact and partnerships",
    contactBefore: "Questions about content, a partnership or advertising? Visit",
    contactLink: "Contact",
    contactAfter: "— we usually reply within 24 hours.",
    audiences: [
      { href: "/verejnost", label: "Public", desc: "Prevention, symptoms and lifestyle in plain language" },
      { href: "/studenti", label: "Students", desc: "Anatomy, pharmacology and faculty admissions" },
      { href: "/lekari", label: "Physicians", desc: "Guidelines, studies and clinical briefs" },
      { href: "/studie", label: "Research", desc: "Study overviews and evidence-based content" },
    ],
  },
  publicHub: {
    metaTitle: "Public health | MedScopeGlobal",
    metaDescription:
      "Disease guides, prevention, nutrition, sleep, stress and expert interviews — in plain language.",
    eyebrow: "For everyone · Public health",
    title: "Health in plain language — without jargon",
    lead: "A guide to prevention, symptoms, nutrition, sleep, stress and longevity. Educational content for everyone — not a substitute for medical care.",
    lastArticle: "Latest article:",
    downloadApp: "Get MeDipacient",
    findProblem: "Find your topic",
    browseArticles: "Browse articles",
    dailyTip: "Today’s health tip",
    askAi: "Ask AI",
    startEyebrow: "How to start",
    startTitle: "Three steps to get oriented",
    linksEyebrow: "Quick links",
    linksTitle: "What you will find here",
    topicsEyebrow: "Topics",
    topicsTitle: "Explore the areas",
    allTopics: "All topics →",
    latestTitle: "Latest articles",
    showAll: "See all →",
    empty: "The first public articles are being prepared by the medscopeglobal.com desk.",
    emptyHint: "Prevention · nutrition · sleep · stress · ergonomics · interviews",
    steps: [
      { title: "Find your topic", desc: "Browse categories by health area — prevention, nutrition, sleep and more.", cta: "Browse topics" },
      { title: "Read an article or tip", desc: "Short pieces without jargon. A daily video tip with a quiz.", cta: "Show articles" },
      { title: "Ask AI (optional)", desc: "Plain answers on prevention and lifestyle — not a substitute for a physician.", cta: "Ask AI" },
    ],
    quick: [
      { href: "/verejnost/temata", label: "Find your topic", desc: "Symptoms, prevention, illness — start here" },
      { href: "/verejnost/clanky", label: "Articles for everyone", desc: "Plain-language pieces" },
      { href: "/verejnost/clanky?topic=dlouhovekost", label: "Longevity", desc: "Healthspan, sleep, movement and biomarkers" },
      { href: "/verejnost/osveta", label: "Daily health tip", desc: "A short video with an avatar and a quiz" },
      { href: "/ai-asistent/verejnost", label: "Ask AI", desc: "Prevention answers — not a substitute for a physician" },
      { href: "/verejnost/rozhovory", label: "Expert interviews", desc: "Clinicians explain in plain language" },
      { href: "/verejnost/zebricek", label: "XP leaderboard", desc: "Points for watching tips and quizzes" },
    ],
    topics: {
      "pruvodce-nemocemi": { label: "Disease guide", description: "Plain-language guides to common and more serious conditions." },
      symptomy: { label: "Symptoms", description: "What symptoms may mean and when to see a physician." },
      prevence: { label: "Prevention", description: "Vaccination, screening and chronic-disease prevention." },
      "zivotni-styl": { label: "Lifestyle", description: "Movement, habits and everyday decisions for health." },
      vyziva: { label: "Nutrition", description: "Balanced diet, vitamins and food myths." },
      spanek: { label: "Sleep", description: "Sleep hygiene, sleep disorders and recovery." },
      stres: { label: "Stress", description: "Mental wellbeing, stress management and resilience." },
      ergonomie: { label: "Ergonomics", description: "Desk work, posture and pain prevention." },
      rozhovory: { label: "Interviews", description: "Conversations with experts for a general audience." },
      dlouhovekost: { label: "Longevity", description: "Healthspan, ageing prevention, sleep, movement and biomarkers." },
    },
  },
  students: {
    metaTitle: "MedScope for students and medicine applicants",
    metaDescription:
      "Faculty admissions prep, study materials and quizzes. 1 free test, intro month then 149 CZK / €10 ongoing.",
    eyebrow: "MedScope · Students",
    title: "MedScope for the path into medicine",
    titleLine2: "and faculty studies",
    lead: "One clear map for applicants, faculty students and parents: admissions, materials, tests. Start free — no maze, no empty promises.",
    priceLine: "1 free test · intro month · then 149 CZK / €10 · cancel anytime",
    downloadPrep: "Get MeDiprep",
    wantMedicine: "I want to study medicine",
    iAmParent: "I am a parent",
    crumbAria: "Breadcrumb",
    home: "Home",
    students: "Students",
    applicantEyebrow: "Recommended start · applicants",
    applicantTitle: "Three steps today — then a subscription makes sense",
    applicantLead: "Taste the content first. Only when you see the style and feedback does the full student plan make sense.",
    pickPath: "Choose your path",
    applicantH2: "I want to study medicine",
    applicantSub: "Applicant · secondary school · faculty admissions prep",
    applicantBody:
      "Academy prep courses, the self-test and faculty dates belong here. It is structured prep you can try immediately — not one-to-one tutoring.",
    openPrep: "Open admissions prep",
    onLfH2: "I already study at a faculty",
    onLfSub: "Years 1–6 · materials, tests, revision",
    onLfBody: "The materials library, quizzes and AI tutor belong here. The goal is fast orientation — not another cluttered dashboard.",
    openMaterials: "Open study materials",
    studentPlan: "Student plan",
    lfEyebrow: "Recommended start · faculty students",
    lfTitle: "Three steps during the semester",
    lfLead: "Find a material first, then practise. The AI tutor is a complement — not a replacement for lectures or faculty notes.",
    parentsEyebrow: "For parents",
    parentsTitle: "Support prep — clearly, without hype",
    parentsBody:
      "The Student LF plan (intro month, then 149 CZK / €10) opens Academy and the AI tutor. It does not guarantee admission. You pay, then forward the activation link.",
    parentBullets: [
      "1 free test — no card",
      "Intro month, then the regular month — cancel anytime",
      "Priced like a single tutoring session",
      "After payment, a link you forward to the student",
    ],
    giftTrial: "Buy a gift and send the link",
    showPrep: "Show the student the prep",
    subTitle: "Student plan — intro month, then 149 CZK / €10",
    subLead: "The free layer is enough for a taste. The plan is for regular prep or semester support.",
    subBenefits: [
      "All Academy prep courses (not just the first lesson)",
      "AI tutor and study materials without the free-tier limits",
      "Quizzes, games and practice throughout the semester",
      "1 free test, intro month, then 149 CZK / €10 (Student LF)",
    ],
    daysFree: "1 free test · intro price",
    comparePlans: "Compare plans",
    moreTitle: "More useful sections",
    moreLead: "Signposts into MedScope content — they do not replace a full course.",
    applicant: [
      { href: "/studenti/chci-studovat", title: "Academy prep courses", body: "Biology, chemistry, physics, physiology — lessons, slides and quizzes. First lesson free." },
      { href: "/academy/prijimacky/self-test", title: "Admissions self-test", body: "A quick view of strengths and gaps — the first step before courses." },
      { href: "/studium/prijimacky", title: "Faculty dates and requirements", body: "Overview of faculties and admissions — so you know what to prepare for." },
    ],
    onLf: [
      { href: "/studenti/materialy", title: "Study materials", body: "A library of articles and notes by topic — fast orientation during term." },
      { href: "/studenti/testy", title: "Tests and practice", body: "Model questions and drills — separate from study games." },
      { href: "/studenti/ai-tutor", title: "AI tutor", body: "Questions about the material — a complement, not a lecture replacement." },
    ],
    more: [
      { href: "/studenti/hry", title: "Quizzes and study games", body: "Short revision games — anatomy, physiology and admissions." },
      { href: "/studenti/leky", title: "Medicines (SÚKL)", body: "Drug lookup — a practical hub, not a pharmacology course." },
      { href: "/studenti/zkousky", title: "Exams and the semester", body: "Orientation for exam period and revision." },
      { href: "/medicina/plany", title: "Study plans", body: "Structured paths through MedScope." },
    ],
    applicantSteps: [
      { title: "Self-test in MeDiprep (5–10 min)", body: "See where you are and what to catch up — in the phone app.", cta: "Open MeDiprep" },
      { title: "One free lesson", body: "See the style of video, slides and quizzes.", cta: "Open courses" },
      { title: "Buy the intro month", body: "Intro price today, regular month after. Cancel anytime.", cta: "Open the plan" },
    ],
    lfSteps: [
      { title: "Materials by topic", body: "Find a note for an exam or seminar.", cta: "Open the library" },
      { title: "Practice", body: "Quizzes and tests — a short recap before a test.", cta: "Start practice" },
      { title: "AI tutor", body: "Ask about unclear material when you cannot wait.", cta: "Open AI tutor" },
    ],
  },
  contact: {
    metaTitle: "Contact | MedScopeGlobal",
    metaDescription: "Contact MedScopeGlobal for editorial questions, partnerships or advertising.",
    eyebrow: "Contact",
    title: "Write to us — we reply within 24 hours",
    lead: "Questions about public content, university partnerships, advertising or technical support. Every message is logged and routed to the right team.",
    mainContact: "Main contact",
    ads: "Ads & advertising",
    phone: "Phone",
    operator: "Operator",
    sendResearch: "Submit research",
    showPricing: "View pricing",
    replyEyebrow: "Reply within 24 hours",
    replyTitle: "Prioritised contact",
    replyLead: "Contact-form messages are routed by request type and every enquiry is logged.",
    contactsTitle: "Main contacts",
    contactsBody: "for editorial questions, publications and collaboration.",
    phoneSupport: "Support phone",
    seat: "Registered office",
    safeTitle: "Secure processing",
    safeBody: "Forms include validation, anti-spam protection and audit logging.",
    trustEyebrow: "Trust and safety",
    trustTitle: "Why you can write to us",
    privacy: "Privacy (GDPR)",
    about: "About",
    generalTitle: "General enquiry",
    generalDesc: "Write if you need information about content, collaboration or publication.",
    partnerTitle: "Partnership contact",
    partnerDesc: "Use this form for advertising, insertion or commercial partnership.",
  },
};

const DE: MarketingCopy = {
  ...EN,
  disclaimerTitle: "Wichtiger Hinweis",
  disclaimerAria: "Wichtiger Hinweis",
  disclaimerBanner:
    "Inhalte der öffentlichen Sektion dienen der Bildung — sie ersetzen keine ärztliche Versorgung und keine Diagnose. Bei akuten Beschwerden den Arzt kontaktieren oder den Notruf wählen.",
  disclaimerInline:
    "Informationen auf MedScopeGlobal dienen der Bildung und Orientierung. Sie ersetzen keine Untersuchung und keine Behandlung. Im Notfall den örtlichen Notruf wählen.",
  apps: {
    ...EN.apps,
    metaTitle: "MedScopeGlobal-Apps — MediFlow, MeDipacient, OrdiZapis",
    metaDescription:
      "MediFlow-Wellness-Tagebuch, MeDipacient für Berichte und OrdiZapis für Ärzte — plus Legacy-MeDiprep für tschechische Aufnahmeprüfungen. Als PWA installieren.",
    title: "Apps",
    lead: "MediFlow, MeDipacient und OrdiZapis — Wellness, Berichte und Notizen auf einer Plattform.",
    trialCta: "14 Tage kostenlos",
    catalogCta: "Katalog ansehen",
    openApp: "Öffnen",
    howItWorks: "So funktioniert es",
    downloadTitle: "Laden",
    openInstalled: "App öffnen",
    installLead: "Aus dem Browser auf den Homescreen von Handy oder PC — ohne App Store und Google Play.",
    stepIos: "1. iPhone: Safari → Teilen → Zum Home-Bildschirm",
    stepAndroid: "2. Android: Chrome → App installieren",
    stepDesktop: "3. PC: Chrome/Edge → ⊕ in der Adressleiste",
    scanInstall: "Scannen und installieren",
    eyebrowApps: "Apps",
    pitch: {
      medipacient:
        "Fotografieren Sie ein PDF oder einen Arztbericht — auch offline. Nach der Verbindung liest OCR Diagnosen, Medikamente und Kontrolltermine.",
      mediprep:
        "Vorbereitung auf die Aufnahme an 8 tschechischen medizinischen Fakultäten. Originaltests in Biologie, Chemie und Physik. E-Mail + Code, kein Passwort. Erster Test kostenlos.",
      ordizapis: "Am Handy aufnehmen — Diktat oder Gespräch. Die KI entwirft die Notiz nach Vorlage.",
      mediflow: "Persönliches Wellness-Tagebuch — Artikel, Symptome, Supplemente und Longevity-Protokolle.",
    },
  },
  about: {
    ...EN.about,
    metaTitle: "Über uns | MedScopeGlobal",
    metaDescription:
      "MedScopeGlobal ist ein tschechisches medizinisches Portal für die Öffentlichkeit, Medizinstudierende, Ärztinnen und Ärzte sowie Forschung.",
    eyebrow: "Über uns",
    title: "MedScopeGlobal — medizinisches Portal für Tschechien",
    cta: "Kontaktieren Sie uns",
    home: "Start",
    missionTitle: "Unsere Mission",
    forWhomTitle: "Für wen wir da sind",
    independenceTitle: "Unabhängigkeit der Marke",
    brandLink: "Marke und geistiges Eigentum",
    qualityTitle: "Qualität und Sicherheit",
    contactTitle: "Kontakt und Zusammenarbeit",
    contactBefore: "Fragen zum Inhalt, Partnerschaft oder Werbung? Besuchen Sie",
    contactLink: "Kontakt",
    contactAfter: "— wir antworten in der Regel innerhalb von 24 Stunden.",
    audiences: [
      { href: "/verejnost", label: "Öffentlichkeit", desc: "Prävention, Symptome und Lebensstil verständlich" },
      { href: "/studenti", label: "Studierende", desc: "Anatomie, Pharmakologie und Aufnahmeprüfung" },
      { href: "/lekari", label: "Ärzte", desc: "Leitlinien, Studien und klinische Briefs" },
      { href: "/studie", label: "Forschung", desc: "Studienüberblicke und evidenzbasierte Inhalte" },
    ],
  },
  publicHub: {
    ...EN.publicHub,
    metaTitle: "Öffentliche Gesundheit | MedScopeGlobal",
    metaDescription: "Krankheitsführer, Prävention, Ernährung, Schlaf, Stress und Expertengespräche — verständlich.",
    eyebrow: "Für alle · Öffentliche Gesundheit",
    title: "Gesundheit verständlich — ohne Fachjargon",
    lead: "Ein Wegweiser zu Prävention, Symptomen, Ernährung, Schlaf, Stress und Langlebigkeit. Bildungsinhalte — kein Ersatz für ärztliche Versorgung.",
    lastArticle: "Letzter Artikel:",
    downloadApp: "MeDipacient laden",
    findProblem: "Thema finden",
    browseArticles: "Artikel ansehen",
    dailyTip: "Heutiger Gesundheitstipp",
    askAi: "KI fragen",
    startEyebrow: "So starten",
    startTitle: "Drei Schritte zur Orientierung",
    linksEyebrow: "Schnellzugriff",
    linksTitle: "Was Sie hier finden",
    topicsEyebrow: "Themen",
    topicsTitle: "Bereiche entdecken",
    allTopics: "Alle Themen →",
    latestTitle: "Neueste Artikel",
    showAll: "Alles anzeigen →",
    steps: [
      { title: "Thema finden", desc: "Bereiche durchsehen — Prävention, Ernährung, Schlaf und mehr.", cta: "Themen durchsehen" },
      { title: "Artikel oder Tipp lesen", desc: "Kurze Texte ohne Fachjargon. Ein täglicher Videotipp mit Quiz.", cta: "Artikel zeigen" },
      { title: "KI fragen (optional)", desc: "Verständliche Antworten zu Prävention und Lebensstil — kein Ersatz für den Arzt.", cta: "KI fragen" },
    ],
    topics: {
      "pruvodce-nemocemi": { label: "Krankheitsführer", description: "Verständliche Führer zu häufigen und schwereren Erkrankungen." },
      symptomy: { label: "Symptome", description: "Was Symptome bedeuten können und wann ein Arzt nötig ist." },
      prevence: { label: "Prävention", description: "Impfung, Screening und Vorbeugung chronischer Krankheiten." },
      "zivotni-styl": { label: "Lebensstil", description: "Bewegung, Gewohnheiten und alltägliche Entscheidungen." },
      vyziva: { label: "Ernährung", description: "Ausgewogene Kost, Vitamine und Ernährungmythes." },
      spanek: { label: "Schlaf", description: "Schlafhygiene, Schlafstörungen und Erholung." },
      stres: { label: "Stress", description: "Psychisches Wohlbefinden, Stressmanagement und Resilienz." },
      ergonomie: { label: "Ergonomie", description: "Schreibtischarbeit, Haltung und Schmerzvorbeugung." },
      rozhovory: { label: "Gespräche", description: "Interviews mit Fachleuten für ein breites Publikum." },
      dlouhovekost: { label: "Langlebigkeit", description: "Healthspan, Vorbeugung des Alterns, Schlaf, Bewegung und Biomarker." },
    },
  },
  students: {
    ...EN.students,
    metaTitle: "MedScope für Studierende und Medizinbewerber",
    metaDescription:
      "Vorbereitung auf die Aufnahmeprüfung, Lernmaterial und Quiz. 1 Test gratis, erster Monat vergünstigt, danach 10 €.",
    eyebrow: "MedScope · Studierende",
    title: "MedScope auf dem Weg ins Medizinstudium",
    titleLine2: "und im Studium an der Fakultät",
    downloadPrep: "MeDiprep laden",
    wantMedicine: "Ich will Medizin studieren",
    iAmParent: "Ich bin Elternteil",
    home: "Start",
    students: "Studierende",
    pickPath: "Wählen Sie Ihren Weg",
    applicantH2: "Ich will Medizin studieren",
    onLfH2: "Ich studiere bereits an der Fakultät",
    studentPlan: "Studententarif",
    parentsEyebrow: "Für Eltern",
    daysFree: "1 Test gratis · Einstiegspreis",
    priceLine: "1 Test gratis · heute vergünstigt · danach 10 € · jederzeit kündbar",
    comparePlans: "Tarife vergleichen",
    moreTitle: "Weitere nützliche Bereiche",
  },
  contact: {
    ...EN.contact,
    metaTitle: "Kontakt | MedScopeGlobal",
    metaDescription: "Kontaktieren Sie MedScopeGlobal zu Inhalten, Partnerschaften oder Werbung.",
    eyebrow: "Kontakt",
    title: "Schreiben Sie uns — Antwort innerhalb von 24 Stunden",
    mainContact: "Hauptkontakt",
    ads: "Werbung & Anzeigen",
    phone: "Telefon",
    operator: "Betreiber",
    sendResearch: "Forschung einreichen",
    showPricing: "Preise ansehen",
    about: "Über uns",
    generalTitle: "Allgemeine Anfrage",
    partnerTitle: "Partnerkontakt",
  },
};

const FR: MarketingCopy = {
  ...EN,
  disclaimerTitle: "Avis important",
  disclaimerAria: "Avis important",
  disclaimerBanner:
    "Les contenus de la section grand public servent à l’éducation — ils ne remplacent pas des soins ni un diagnostic. En urgence, contactez un médecin ou les secours.",
  disclaimerInline:
    "Les informations sur MedScopeGlobal servent à l’éducation et à l’orientation. Elles ne remplacent pas un examen ni un traitement. En urgence, appelez les secours locaux.",
  apps: {
    ...EN.apps,
    metaTitle: "Applis MedScopeGlobal — MediFlow, MeDipacient, OrdiZapis",
    metaDescription:
      "Journal wellness MediFlow, MeDipacient pour les comptes rendus et OrdiZapis pour les médecins — plus MeDiprep (legacy) pour les concours tchèques. Installation PWA.",
    title: "Applis",
    lead: "MediFlow, MeDipacient et OrdiZapis — wellness, comptes rendus et notes sur une seule plateforme.",
    trialCta: "14 jours gratuits",
    catalogCta: "Voir le catalogue",
    openApp: "Ouvrir",
    howItWorks: "Comment ça marche",
    downloadTitle: "Télécharger",
    openInstalled: "Ouvrir l’appli",
    installLead: "Installez depuis le navigateur sur l’écran d’accueil du téléphone ou du PC — sans App Store ni Google Play.",
    stepIos: "1. iPhone : Safari → Partager → Sur l’écran d’accueil",
    stepAndroid: "2. Android : Chrome → Installer l’application",
    stepDesktop: "3. PC : Chrome/Edge → icône ⊕ dans la barre d’adresse",
    scanInstall: "Scanner et installer",
    eyebrowApps: "Applis",
    pitch: {
      medipacient:
        "Photographiez un PDF ou un compte rendu — même hors ligne. Une fois reconnecté, l’OCR extrait diagnostics, médicaments et contrôles.",
      mediprep:
        "Prépa pour les concours de 8 facultés de médecine tchèques. Tests originaux de biologie, chimie et physique. E-mail + code, sans mot de passe. Premier test gratuit.",
      ordizapis: "Enregistrez sur mobile — dictée ou consultation. L’IA prépare la note selon le modèle.",
      mediflow: "Journal wellness personnel — articles, symptômes, compléments et protocoles de longévité.",
    },
  },
  about: {
    ...EN.about,
    metaTitle: "À propos | MedScopeGlobal",
    metaDescription:
      "MedScopeGlobal est un portail médical tchèque pour le grand public, les étudiants en médecine, les médecins et la recherche.",
    eyebrow: "À propos",
    title: "MedScopeGlobal — portail médical pour la Tchéquie",
    cta: "Nous contacter",
    home: "Accueil",
    missionTitle: "Notre mission",
    forWhomTitle: "Pour qui nous sommes là",
    independenceTitle: "Indépendance de la marque",
    brandLink: "Marque et propriété intellectuelle",
    qualityTitle: "Qualité et sécurité",
    contactTitle: "Contact et partenariats",
    contactBefore: "Une question sur le contenu, un partenariat ou la publicité ? Rendez-vous sur",
    contactLink: "Contact",
    contactAfter: "— nous répondons en général sous 24 heures.",
    audiences: [
      { href: "/verejnost", label: "Grand public", desc: "Prévention, symptômes et mode de vie en clair" },
      { href: "/studenti", label: "Étudiants", desc: "Anatomie, pharmacologie et concours" },
      { href: "/lekari", label: "Médecins", desc: "Guidelines, études et brèves cliniques" },
      { href: "/studie", label: "Recherche", desc: "Aperçus d’études et contenus fondés sur les preuves" },
    ],
  },
  publicHub: {
    ...EN.publicHub,
    metaTitle: "Santé publique | MedScopeGlobal",
    metaDescription:
      "Guides de maladies, prévention, nutrition, sommeil, stress et entretiens — en langage clair.",
    eyebrow: "Pour tous · Santé publique",
    title: "La santé en clair — sans jargon",
    lead: "Un guide de la prévention, des symptômes, de la nutrition, du sommeil, du stress et de la longévité. Contenus éducatifs — pas un substitut aux soins.",
    lastArticle: "Dernier article :",
    downloadApp: "Installer MeDipacient",
    findProblem: "Trouver un sujet",
    browseArticles: "Parcourir les articles",
    dailyTip: "Conseil santé du jour",
    askAi: "Demander à l’IA",
    startEyebrow: "Par où commencer",
    startTitle: "Trois étapes pour s’orienter",
    linksEyebrow: "Accès rapide",
    linksTitle: "Ce que vous trouverez ici",
    topicsEyebrow: "Sujets",
    topicsTitle: "Explorer les domaines",
    allTopics: "Tous les sujets →",
    latestTitle: "Derniers articles",
    showAll: "Tout voir →",
    steps: [
      { title: "Trouver un sujet", desc: "Parcourir les domaines — prévention, nutrition, sommeil et plus.", cta: "Parcourir les sujets" },
      { title: "Lire un article ou un conseil", desc: "Textes courts, sans jargon. Un conseil vidéo du jour avec quiz.", cta: "Voir les articles" },
      { title: "Demander à l’IA (facultatif)", desc: "Réponses claires sur la prévention et le mode de vie — ne remplacent pas un médecin.", cta: "Demander à l’IA" },
    ],
    topics: {
      "pruvodce-nemocemi": { label: "Guide des maladies", description: "Guides clairs des affections courantes et plus graves." },
      symptomy: { label: "Symptômes", description: "Ce que les signes peuvent vouloir dire et quand consulter." },
      prevence: { label: "Prévention", description: "Vaccination, dépistage et prévention des maladies chroniques." },
      "zivotni-styl": { label: "Mode de vie", description: "Mouvement, habitudes et choix du quotidien." },
      vyziva: { label: "Nutrition", description: "Alimentation équilibrée, vitamines et mythes." },
      spanek: { label: "Sommeil", description: "Hygiène du sommeil, troubles et récupération." },
      stres: { label: "Stress", description: "Bien-être mental, gestion du stress et résilience." },
      ergonomie: { label: "Ergonomie", description: "Travail de bureau, posture et prévention de la douleur." },
      rozhovory: { label: "Entretiens", description: "Échanges avec des experts pour le grand public." },
      dlouhovekost: { label: "Longévité", description: "Healthspan, prévention du vieillissement, sommeil, mouvement et biomarqueurs." },
    },
  },
  students: {
    ...EN.students,
    metaTitle: "MedScope pour les étudiants et candidats en médecine",
    metaDescription:
      "Prépa concours, supports et quiz. 1 test gratuit, premier mois d’intro, puis 10 €.",
    eyebrow: "MedScope · Étudiants",
    title: "MedScope pour le chemin vers la médecine",
    titleLine2: "et les études en faculté",
    downloadPrep: "Installer MeDiprep",
    wantMedicine: "Je veux étudier la médecine",
    iAmParent: "Je suis parent",
    home: "Accueil",
    students: "Étudiants",
    pickPath: "Choisissez votre parcours",
    applicantH2: "Je veux étudier la médecine",
    onLfH2: "Je suis déjà en faculté",
    studentPlan: "Formule étudiant",
    parentsEyebrow: "Pour les parents",
    daysFree: "1 test gratuit · prix d’intro",
    priceLine: "1 test gratuit · mois d’intro · puis 10 € · résiliation à tout moment",
    comparePlans: "Comparer les formules",
    moreTitle: "Autres sections utiles",
  },
  contact: {
    ...EN.contact,
    metaTitle: "Contact | MedScopeGlobal",
    metaDescription: "Contactez MedScopeGlobal pour le contenu, les partenariats ou la publicité.",
    eyebrow: "Contact",
    title: "Écrivez-nous — réponse sous 24 heures",
    mainContact: "Contact principal",
    ads: "Publicité & annonces",
    phone: "Téléphone",
    operator: "Exploitant",
    sendResearch: "Envoyer une recherche",
    showPricing: "Voir les tarifs",
    about: "À propos",
    generalTitle: "Demande générale",
    partnerTitle: "Contact partenariat",
  },
};

const PACKS: Record<string, MarketingCopy> = { cs: CS, en: EN, de: DE, fr: FR };

export function getMarketingCopy(locale?: string | null): MarketingCopy {
  const key = pack(locale);
  return localizeListedCzkIn(PACKS[key] ?? PACKS.en, locale);
}
