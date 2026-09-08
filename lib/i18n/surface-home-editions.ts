import { MAGAZINE } from "@/lib/brand/magazine";
import type { SurfaceCopy } from "@/lib/i18n/surface-copy";

const TRENDING = {
  longevity: "/verejnost/clanky?topic=dlouhovekost",
  mediflow: "/app/mediflow",
  tip: "/verejnost/osveta",
  pacient: "/app/pacient",
  ordizapis: "/app/dokumentace",
} as const;

export type SurfaceHomeEdition = Partial<
  Pick<
    SurfaceCopy,
    | "why"
    | "b2bTitle"
    | "b2bDescription"
    | "b2bCta"
    | "todayFallback"
    | "writersTitle"
    | "cookieTitle"
    | "cookieNecessary"
    | "cookieAcceptAll"
    | "trending"
  >
> & {
  footer?: Partial<Pick<SurfaceCopy["footer"], "audiences" | "proof" | "vip">>;
};

const EDITIONS: Record<string, SurfaceHomeEdition> = {
  sk: {
    writersTitle: "Redakčné stoly",
    cookieTitle: "Cookies a súkromie",
    cookieNecessary: "Len nevyhnutné",
    cookieAcceptAll: "Prijať všetko",
    todayFallback: `Dnes v ${MAGAZINE.name}`,
    b2bTitle: "Pre firmy a inštitúcie",
    b2bDescription: "Pharma, kliniky, laboratóriá a univerzity — cielené kampane a merateľné partnerstvá.",
    b2bCta: "Ponuka B2B",
    trending: [
      { label: "dlhovekosť", href: TRENDING.longevity },
      { label: "MediFlow", href: TRENDING.mediflow },
      { label: "dnešný tip", href: TRENDING.tip },
      { label: "MeDipacient", href: TRENDING.pacient },
      { label: "OrdiZapis", href: TRENDING.ordizapis },
    ],
    why: [
      {
        title: "Magazín + aplikácie na jednej platforme",
        description: `${MAGAZINE.name} pre dlhovekosť, MediFlow ako denník, MeDipacient a OrdiZapis ako PWA.`,
      },
      {
        title: "Podľa dôkazov, nie clickbait",
        description: "Redakčné texty citujú PubMed, ŠÚKL, EMA a WHO — s kontrolou, nie vymyslenými zdrojmi.",
      },
      {
        title: "Čo dôkazy znamenajú",
        description: "Nielen čo hovorí štúdia, ale čo to znamená v praxi. Písané pre ľudí, nie pre algoritmy.",
      },
      {
        title: "Jedna platforma, viac publík",
        description: "Čitatelia, lekári a študenti majú každý jasnú cestu — magazín a wellness prvé.",
      },
      {
        title: "Academy s certifikátmi",
        description: "Kurzy a kvízy pre tých, čo sa učia, plus obsah v štýle CME pre klinikov.",
      },
      {
        title: "14 dní u OrdiZapisu",
        description: "Lekári a OrdiZapis: 14 dní zadarmo. Tarif Redakcia sa platí hneď — 1 € mesačne alebo 10 € za rok.",
      },
    ],
    footer: {
      vip: "VIP protokoly",
      audiences: [
        { label: `Verejnosť — ${MAGAZINE.name} a MediFlow`, href: "/verejnost" },
        { label: "VIP protokoly dlhovekosti", href: "/vip/protokoly" },
        { label: "Lekári — OrdiZapis a guidelines", href: "/lekari/dokumentace" },
      ],
      proof: [
        { label: `Články · ${MAGAZINE.name}`, href: "/articles" },
        { label: "O redakcii", href: "/o-nas" },
        { label: "OrdiZapis 14 dní", href: "/predplatne?trial=1#dokumentace" },
      ],
    },
  },
  pl: {
    writersTitle: "Biurka redakcyjne",
    cookieTitle: "Cookies i prywatność",
    cookieNecessary: "Tylko niezbędne",
    cookieAcceptAll: "Akceptuj wszystkie",
    todayFallback: `Dziś w ${MAGAZINE.name}`,
    b2bTitle: "Dla firm i instytucji",
    b2bDescription: "Pharma, kliniki, laboratoria i uczelnie — kampanie i mierzalne partnerstwa.",
    b2bCta: "Oferta B2B",
    trending: [
      { label: "długowieczność", href: TRENDING.longevity },
      { label: "MediFlow", href: TRENDING.mediflow },
      { label: "dzisiejsza wskazówka", href: TRENDING.tip },
      { label: "MeDipacient", href: TRENDING.pacient },
      { label: "OrdiZapis", href: TRENDING.ordizapis },
    ],
    why: [
      {
        title: "Magazyn + aplikacje na jednej platformie",
        description: `${MAGAZINE.name} o długowieczności, MediFlow jako dziennik, MeDipacient i OrdiZapis jako PWA.`,
      },
      {
        title: "Oparte na dowodach, nie clickbait",
        description: "Teksty redakcyjne cytują PubMed, URPL, EMA i WHO — z recenzją, bez wymyślonych źródeł.",
      },
      {
        title: "Co oznaczają dowody",
        description: "Nie tylko co mówi badanie, ale co z tego wynika w praktyce.",
      },
      {
        title: "Jedna platforma, kilka publiczności",
        description: "Czytelnicy, lekarze i studenci mają każdy jasną ścieżkę — magazyn i wellness najpierw.",
      },
      {
        title: "Akademia z certyfikatami",
        description: "Kursy i quizy dla uczących się oraz treści w stylu CME dla klinicystów.",
      },
      {
        title: "14 dni w OrdiZapis",
        description: "Lekarze i OrdiZapis: 14 dni za darmo. Plan Redakcja płatny od razu — 1 € / miesiąc lub 10 € / rok.",
      },
    ],
    footer: {
      vip: "Protokoły VIP",
      audiences: [
        { label: `Dla wszystkich — ${MAGAZINE.name} i MediFlow`, href: "/verejnost" },
        { label: "Protokoły VIP długowieczności", href: "/vip/protokoly" },
        { label: "Lekarze — OrdiZapis i wytyczne", href: "/lekari/dokumentace" },
      ],
      proof: [
        { label: `Artykuły · ${MAGAZINE.name}`, href: "/articles" },
        { label: "O redakcji", href: "/o-nas" },
        { label: "OrdiZapis 14 dni", href: "/predplatne?trial=1#dokumentace" },
      ],
    },
  },
  ja: {
    writersTitle: "編集デスク",
    cookieTitle: "Cookieとプライバシー",
    cookieNecessary: "必須のみ",
    cookieAcceptAll: "すべて許可",
    todayFallback: `今日の${MAGAZINE.name}`,
    b2bTitle: "企業と機関向け",
    b2bDescription: "製薬、クリニック、研究室、大学 — ターゲットキャンペーンと測定可能な提携。",
    b2bCta: "B2Bの案内",
    trending: [
      { label: "長寿", href: TRENDING.longevity },
      { label: "MediFlow", href: TRENDING.mediflow },
      { label: "今日のヒント", href: TRENDING.tip },
      { label: "MeDipacient", href: TRENDING.pacient },
      { label: "OrdiZapis", href: TRENDING.ordizapis },
    ],
    why: [
      {
        title: "雑誌とアプリが一つのプラットフォームに",
        description: `${MAGAZINE.name}で長寿、MediFlowは日記、MeDipacientとOrdiZapisはPWA。`,
      },
      {
        title: "根拠あり、クリックベイトなし",
        description: "編集記事はPubMed、PMDA、EMA、WHOを引用 — 確認あり、架空の出典なし。",
      },
      {
        title: "根拠が意味すること",
        description: "研究が何を言うかだけでなく、実務で何が変わるか。",
      },
      {
        title: "一つのプラットフォーム、複数の読者",
        description: "一般読者、医師、学生それぞれに道がある — まず雑誌とウェルネス。",
      },
      {
        title: "証明書つきアカデミー",
        description: "学習者向けの講座とクイズ、臨床向けのCME型コンテンツ。",
      },
      {
        title: "OrdiZapisは14日間",
        description: "医師とOrdiZapisは14日無料。編集部プランはすぐ課金 — 月1€または年10€。",
      },
    ],
    footer: {
      vip: "VIPプロトコル",
      audiences: [
        { label: `一般向け — ${MAGAZINE.name}とMediFlow`, href: "/verejnost" },
        { label: "長寿のVIPプロトコル", href: "/vip/protokoly" },
        { label: "医師 — OrdiZapisとガイドライン", href: "/lekari/dokumentace" },
      ],
      proof: [
        { label: `記事 · ${MAGAZINE.name}`, href: "/articles" },
        { label: "編集部について", href: "/o-nas" },
        { label: "OrdiZapis 14日", href: "/predplatne?trial=1#dokumentace" },
      ],
    },
  },
  ru: {
    writersTitle: "Редакционные столы",
    cookieTitle: "Cookies и конфиденциальность",
    cookieNecessary: "Только необходимые",
    cookieAcceptAll: "Принять все",
    todayFallback: `Сегодня в ${MAGAZINE.name}`,
    b2bTitle: "Для компаний и учреждений",
    b2bDescription: "Фарма, клиники, лаборатории и университеты — кампании и измеримые партнёрства.",
    b2bCta: "Предложение B2B",
    trending: [
      { label: "долголетие", href: TRENDING.longevity },
      { label: "MediFlow", href: TRENDING.mediflow },
      { label: "совет дня", href: TRENDING.tip },
      { label: "MeDipacient", href: TRENDING.pacient },
      { label: "OrdiZapis", href: TRENDING.ordizapis },
    ],
    why: [
      {
        title: "Журнал и приложения на одной платформе",
        description: `${MAGAZINE.name} о долголетии, MediFlow как дневник, MeDipacient и OrdiZapis как PWA.`,
      },
      {
        title: "На доказательствах, не кликбейт",
        description: "Редакционные тексты цитируют PubMed, EMA и ВОЗ — с проверкой, без выдуманных источников.",
      },
      {
        title: "Что значат доказательства",
        description: "Не только что говорит исследование, но что это меняет на практике.",
      },
      {
        title: "Одна платформа, несколько аудиторий",
        description: "Читатели, врачи и студенты — у каждого свой путь. Сначала журнал и wellness.",
      },
      {
        title: "Академия с сертификатами",
        description: "Курсы и тесты для учащихся, материалы в стиле CME для клиницистов.",
      },
      {
        title: "14 дней в OrdiZapis",
        description: "Врачи и OrdiZapis: 14 дней бесплатно. Тариф Редакция сразу — 1 € в месяц или 10 € в год.",
      },
    ],
    footer: {
      vip: "VIP-протоколы",
      audiences: [
        { label: `Для всех — ${MAGAZINE.name} и MediFlow`, href: "/verejnost" },
        { label: "VIP-протоколы долголетия", href: "/vip/protokoly" },
        { label: "Врачи — OrdiZapis и руководства", href: "/lekari/dokumentace" },
      ],
      proof: [
        { label: `Статьи · ${MAGAZINE.name}`, href: "/articles" },
        { label: "О редакции", href: "/o-nas" },
        { label: "OrdiZapis 14 дней", href: "/predplatne?trial=1#dokumentace" },
      ],
    },
  },
  zh: {
    writersTitle: "编辑部栏目",
    cookieTitle: "Cookie 与隐私",
    cookieNecessary: "仅必要",
    cookieAcceptAll: "全部接受",
    todayFallback: `今日${MAGAZINE.name}`,
    b2bTitle: "面向企业与机构",
    b2bDescription: "药企、诊所、实验室与大学 — 定向投放与可衡量的合作。",
    b2bCta: "B2B 方案",
    trending: [
      { label: "长寿", href: TRENDING.longevity },
      { label: "MediFlow", href: TRENDING.mediflow },
      { label: "今日提示", href: TRENDING.tip },
      { label: "MeDipacient", href: TRENDING.pacient },
      { label: "OrdiZapis", href: TRENDING.ordizapis },
    ],
    why: [
      {
        title: "杂志与应用同在一个平台",
        description: `${MAGAZINE.name}讲长寿，MediFlow是日记，MeDipacient 与 OrdiZapis 是 PWA。`,
      },
      {
        title: "有证据，不是标题党",
        description: "编辑文引用 PubMed、NMPA、EMA、WHO — 经审校，不编造出处。",
      },
      {
        title: "证据意味着什么",
        description: "不只是研究说了什么，而是实践中会改变什么。",
      },
      {
        title: "一个平台，多种读者",
        description: "大众、医生、学生各有路径 — 先是杂志与健康管理。",
      },
      {
        title: "带证书的学院",
        description: "给学习者的课程与测验，以及面向临床的 CME 式内容。",
      },
      {
        title: "OrdiZapis 14 天",
        description: "医生与 OrdiZapis：14 天免费。编辑部方案立即计费 — 每月 1€ 或每年 10€。",
      },
    ],
    footer: {
      vip: "VIP 方案",
      audiences: [
        { label: `大众 — ${MAGAZINE.name} 与 MediFlow`, href: "/verejnost" },
        { label: "长寿 VIP 方案", href: "/vip/protokoly" },
        { label: "医生 — OrdiZapis 与指南", href: "/lekari/dokumentace" },
      ],
      proof: [
        { label: `文章 · ${MAGAZINE.name}`, href: "/articles" },
        { label: "关于编辑部", href: "/o-nas" },
        { label: "OrdiZapis 14 天", href: "/predplatne?trial=1#dokumentace" },
      ],
    },
  },
  ro: {
    writersTitle: "Birouri editoriale",
    cookieTitle: "Cookie-uri și confidențialitate",
    todayFallback: `Azi în ${MAGAZINE.name}`,
    b2bTitle: "Pentru companii și instituții",
    b2bCta: "Ofertă B2B",
    why: [
      { title: "Revistă + aplicații pe o platformă", description: `${MAGAZINE.name} pentru longevitate, MediFlow ca jurnal, MeDipacient și OrdiZapis ca PWA.` },
      { title: "Bazat pe dovezi, nu clickbait", description: "Textele editoriale citează PubMed, EMA și OMS — cu verificare." },
      { title: "Ce înseamnă dovezile", description: "Nu doar ce spune studiul, ci ce schimbă în practică." },
      { title: "O platformă, mai multe publicuri", description: "Cititori, medici și studenți — fiecare cu un drum clar." },
      { title: "Academy cu certificate", description: "Cursuri și quiz-uri, plus conținut de tip EMC." },
      { title: "14 zile la OrdiZapis", description: "Medici și OrdiZapis: 14 zile gratuit. Planul Redacție se plătește imediat." },
    ],
    footer: {
      audiences: [
        { label: `Public — ${MAGAZINE.name} și MediFlow`, href: "/verejnost" },
        { label: "Protocoale VIP de longevitate", href: "/vip/protokoly" },
        { label: "Medici — OrdiZapis și ghiduri", href: "/lekari/dokumentace" },
      ],
      proof: [
        { label: `Articole · ${MAGAZINE.name}`, href: "/articles" },
        { label: "Despre redacție", href: "/o-nas" },
        { label: "OrdiZapis 14 zile", href: "/predplatne?trial=1#dokumentace" },
      ],
    },
  },
  hu: {
    writersTitle: "Szerkesztőségi asztalok",
    cookieTitle: "Cookie-k és adatvédelem",
    todayFallback: `Ma a ${MAGAZINE.name} magazinban`,
    b2bTitle: "Cégeknek és intézményeknek",
    why: [
      { title: "Magazin + alkalmazások egy platformon", description: `${MAGAZINE.name} a hosszú életről, MediFlow napló, MeDipacient és OrdiZapis PWA.` },
      { title: "Bizonyítékokon, nem clickbait", description: "A szerkesztőségi szövegek PubMedet, EMA-t és WHO-t idéznek." },
      { title: "Mit jelentenek a bizonyítékok", description: "Nem csak mit mond a tanulmány, hanem mit változtat a gyakorlatban." },
      { title: "Egy platform, több közönség", description: "Olvasók, orvosok, hallgatók — mindnek külön út." },
      { title: "Akadémia tanúsítványokkal", description: "Tanfolyamok és kvízek, plusz CME-jellegű tartalom." },
      { title: "14 nap az OrdiZapisban", description: "Orvosok és OrdiZapis: 14 nap ingyen. A Szerkesztőség azonnal fizetős." },
    ],
  },
  uk: {
    writersTitle: "Редакційні столи",
    cookieTitle: "Cookies і приватність",
    todayFallback: `Сьогодні в ${MAGAZINE.name}`,
    b2bTitle: "Для компаній і установ",
    why: [
      { title: "Журнал + застосунки на одній платформі", description: `${MAGAZINE.name} про довголіття, MediFlow як щоденник, MeDipacient і OrdiZapis як PWA.` },
      { title: "На доказах, не клікбейт", description: "Редакційні тексти цитують PubMed, EMA і ВООЗ." },
      { title: "Що означають докази", description: "Не лише що каже дослідження, а що змінюється на практиці." },
      { title: "Одна платформа, кілька авдиторій", description: "Читачі, лікарі й студенти мають свій шлях." },
      { title: "Академія з сертифікатами", description: "Курси й тести, плюс матеріали в стилі CME." },
      { title: "14 днів в OrdiZapis", description: "Лікарі й OrdiZapis: 14 днів безкоштовно. Тариф Редакція одразу." },
    ],
  },
  ko: {
    writersTitle: "편집 데스크",
    cookieTitle: "쿠키와 개인정보",
    todayFallback: `오늘의 ${MAGAZINE.name}`,
    b2bTitle: "기업과 기관을 위해",
    why: [
      { title: "잡지와 앱이 한 플랫폼에", description: `${MAGAZINE.name}는 장수, MediFlow는 일기, MeDipacient와 OrdiZapis는 PWA.` },
      { title: "근거 중심, 클릭베이트 없음", description: "편집 기사는 PubMed, EMA, WHO를 인용합니다." },
      { title: "근거가 의미하는 것", description: "연구가 무엇을 말하는지뿐 아니라 실무에서 무엇이 바뀌는지." },
      { title: "하나의 플랫폼, 여러 독자", description: "일반 독자, 의사, 학생 각자에게 길이 있습니다." },
      { title: "수료증이 있는 아카데미", description: "학습자용 강좌와 퀴즈, 임상을 위한 CME형 콘텐츠." },
      { title: "OrdiZapis 14일", description: "의사와 OrdiZapis는 14일 무료. 편집부 요금제는 바로 결제." },
    ],
  },
};

export function surfaceHomeEdition(primary: string): SurfaceHomeEdition | undefined {
  return EDITIONS[primary];
}
