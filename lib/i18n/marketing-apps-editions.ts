import type { MarketingCopy } from "@/lib/i18n/marketing-copy";

/** Visible /aplikace + /o-nas chrome for editions that still fall back to the English pack. */
export type MarketingAppsEdition = {
  disclaimerTitle?: string;
  disclaimerAria?: string;
  disclaimerBanner?: string;
  disclaimerInline?: string;
  apps?: Partial<Omit<MarketingCopy["apps"], "pitch">> & {
    pitch?: Partial<MarketingCopy["apps"]["pitch"]>;
  };
  about?: Partial<Omit<MarketingCopy["about"], "audiences">> & {
    audiences?: MarketingCopy["about"]["audiences"];
  };
  contact?: Partial<MarketingCopy["contact"]>;
  students?: Partial<
    Omit<
      MarketingCopy["students"],
      "parentBullets" | "subBenefits" | "applicant" | "onLf" | "more" | "applicantSteps" | "lfSteps"
    >
  >;
};

const EDITIONS: Record<string, MarketingAppsEdition> = {
  sk: {
    disclaimerTitle: "Dôležité upozornenie",
    disclaimerAria: "Dôležité upozornenie",
    disclaimerBanner:
      "Obsah verejnej sekcie slúži na vzdelávanie — nenahrádza lekársku starostlivosť ani diagnózu. Pri akútnych ťažkostiach kontaktujte praktického lekára alebo volajte tiesňovú linku.",
    disclaimerInline:
      "Informácie na MedScopeGlobal slúžia na vzdelávanie a orientáciu v zdraví. Nenahrádzajú vyšetrenie ani liečbu u lekára. V akútnych prípadoch volajte miestnu tiesňovú linku.",
    apps: {
      metaTitle: "Aplikácie MedScopeGlobal — MediFlow, MeDipacient, OrdiZapis",
      metaDescription:
        "Wellness denník MediFlow, MeDipacient pre správy a OrdiZapis pre lekárov — plus legacy MeDiprep. Inštalácia ako PWA.",
      title: "Aplikácie",
      lead: "MediFlow, MeDipacient a OrdiZapis — wellness, správy a zápisy na jednej platforme.",
      trialCta: "14 dní zadarmo",
      catalogCta: "Prehliadnuť katalóg",
      openApp: "Otvoriť",
      howItWorks: "Ako to funguje",
      downloadTitle: "Stiahnuť",
      openInstalled: "Otvoriť aplikáciu",
      installLead: "Nainštalujete z prehliadača na plochu telefónu aj PC — bez App Store aj Google Play.",
      stepIos: "1. iPhone: Safari → Zdieľať → Pridať na plochu",
      stepAndroid: "2. Android: Chrome → Nainštalovať aplikáciu",
      stepDesktop: "3. PC: Chrome/Edge → ikona ⊕ v adresnom riadku",
      scanInstall: "Naskenujte a nainštalujte",
      eyebrowApps: "Aplikácie",
      pitch: {
        medipacient:
          "Odfotíte PDF alebo fotografiu lekárskej správy — aj bez dát. Po pripojení OCR vytiahne diagnózy, lieky a kontroly.",
        mediprep:
          "Príprava na prijímacky 8 českých lekárskych fakúlt. Originálne testy biológie, chémie a fyziky. E-mail + kód, bez hesla. Prvý test zadarmo.",
        ordizapis: "Nahrávajte v mobile — diktát aj konzultácia. AI pripraví zápis podľa šablóny.",
        mediflow: "Osobný wellness denník — články, symptómy, suplementy a protokoly dlhovekosti.",
      },
    },
    about: {
      metaTitle: "O nás | MedScopeGlobal",
      metaDescription:
        "MedScopeGlobal je český odborný medicínsky portál pre laikov, študentov medicíny, lekárov a výskumníkov.",
      eyebrow: "O nás",
      title: "MedScopeGlobal — odborný medicínsky portál pre ČR",
      cta: "Kontaktujte nás",
      home: "Domov",
      missionTitle: "Naša misia",
      mission:
        "MedScopeGlobal prepája klinickú prax, vedecký výskum a vzdelávanie v medicíne. Kurátorský obsah, citácie zdrojov a odborné rubriky pomáhajú lekárom, študentom aj verejnosti orientovať sa v rýchlo sa meniacej medicíne.",
      forWhomTitle: "Pre koho sme tu",
      forWhom: "Vyberte sekciu podľa toho, kto ste — každá cesta má vlastný obsah a nástroje.",
      independenceTitle: "Nezávislosť značky",
      independence:
        "MedScopeGlobal je nezávislá platforma na doméne medscopeglobal.com. Nie sme spriaznení s Medscape, WebMD ani s inými zahraničnými medicínskymi portálmi s podobným názvom. Nie sme ich českou mutáciou ani licenciou.",
      brandLink: "Značka a duševné vlastníctvo",
      qualityTitle: "Kvalita a bezpečnosť",
      quality:
        "Obsah prechádza redakčnou kontrolou. AI nástroje sú auditované a nie sú náhradou odbornej zdravotnej starostlivosti. V akútnych prípadoch volajte linku 155 alebo 112.",
      contactTitle: "Kontakt a spolupráca",
      contactBefore: "Máte otázku k obsahu, chcete nadviazať partnerstvo alebo inzerciu? Navštívte stránku",
      contactLink: "Kontakt",
      contactAfter: "— odpovedáme zvyčajne do 24 hodín.",
      audiences: [
        { href: "/verejnost", label: "Verejnosť", desc: "Prevencia, symptómy a životný štýl zrozumiteľne" },
        { href: "/studenti", label: "Študenti", desc: "Anatómia, farmakológia a príprava na LF" },
        { href: "/lekari", label: "Lekári", desc: "Guidelines, štúdie a klinické briefy" },
        { href: "/studie", label: "Výskum", desc: "Prehľad štúdií a obsah založený na dôkazoch" },
      ],
    },
    contact: {
      metaTitle: "Kontakt | MedScopeGlobal",
      metaDescription: "Kontaktujte MedScopeGlobal pre redakčné otázky, partnerstvo alebo inzerciu.",
      eyebrow: "Kontakt",
      title: "Napíšte nám — odpovieme do 24 hodín",
      lead: "Otázky k obsahu pre verejnosť, partnerstvá s univerzitami, inzerciu aj technickú podporu. Každá správa je evidovaná a smerovaná správnemu tímu.",
      mainContact: "Hlavný kontakt",
      ads: "Reklamy a inzercia",
      phone: "Telefón",
      operator: "Prevádzkovateľ",
      sendResearch: "Odoslať výskum",
      showPricing: "Zobraziť cenník",
      replyEyebrow: "Odpoveď do 24 hodín",
      replyTitle: "Prioritizovaný kontakt",
      replyLead: "Správy z kontaktného formulára sa smerujú podľa typu žiadosti a každý dopyt je evidovaný.",
      contactsTitle: "Hlavné kontakty",
      contactsBody: "pre odborné otázky, publikácie a spoluprácu.",
      phoneSupport: "Telefón podpory",
      seat: "Sídlo",
      safeTitle: "Bezpečné spracovanie",
      safeBody: "Formuláre majú validáciu, anti-spam ochranu a auditné logovanie.",
      trustEyebrow: "Dôvera a bezpečnosť",
      trustTitle: "Prečo nám môžete napísať",
      privacy: "Ochrana súkromia (GDPR)",
      about: "O nás",
      generalTitle: "Všeobecný dopyt",
      generalDesc: "Napíšte, ak potrebujete informácie o obsahu, spolupráci alebo publikácii.",
      partnerTitle: "Partnerský kontakt",
      partnerDesc: "Pre reklamnú spoluprácu, inzerciu alebo komerčné partnerstvo použite tento formulár.",
    },
    students: {
      metaTitle: "MedScope pre študentov a uchádzačov o medicínu",
      metaDescription: "Príprava na prijímacky, materiály a kvízy. 1 test zadarmo, úvodný mesiac, potom 10 €.",
      eyebrow: "MedScope · Študenti",
      title: "MedScope pre cestu na medicínu",
      titleLine2: "a štúdium na LF",
      lead: "Jedna prehľadná mapa pre uchádzačov, študentov LF a rodičov: prijímacky, materiály, testy. Začnite zadarmo — bez sľubu prijatia.",
      priceLine: "1 test zadarmo · úvodný mesiac · potom 10 € · zrušíte kedykoľvek",
      downloadPrep: "Stiahnuť MeDiprep",
      wantMedicine: "Chcem na medicínu",
      iAmParent: "Som rodič",
      home: "Domov",
      students: "Študenti",
      studentPlan: "Študentský plán",
      daysFree: "1 test zadarmo · úvodná cena",
      comparePlans: "Porovnať plány",
    },
  },
  pl: {
    disclaimerTitle: "Ważna informacja",
    disclaimerAria: "Ważna informacja",
    disclaimerBanner:
      "Treści sekcji publicznej służą edukacji — nie zastępują opieki lekarskiej ani diagnozy. Przy ostrych dolegliwościach skontaktuj się z lekarzem lub zadzwoń na pogotowie.",
    disclaimerInline:
      "Informacje na MedScopeGlobal służą edukacji i orientacji. Nie zastępują badania ani leczenia. W nagłych przypadkach zadzwoń na lokalne pogotowie.",
    apps: {
      metaTitle: "Aplikacje MedScopeGlobal — MediFlow, MeDipacient, OrdiZapis",
      metaDescription:
        "Dziennik wellness MediFlow, MeDipacient do wyników i OrdiZapis dla lekarzy — plus legacy MeDiprep. Instalacja jako PWA.",
      title: "Aplikacje",
      lead: "MediFlow, MeDipacient i OrdiZapis — wellness, wyniki i notatki na jednej platformie.",
      trialCta: "14 dni za darmo",
      catalogCta: "Przeglądaj katalog",
      openApp: "Otwórz",
      howItWorks: "Jak to działa",
      downloadTitle: "Pobierz",
      openInstalled: "Otwórz aplikację",
      installLead: "Zainstalujesz z przeglądarki na ekran telefonu lub komputera — bez App Store i Google Play.",
      stepIos: "1. iPhone: Safari → Udostępnij → Dodaj do ekranu początkowego",
      stepAndroid: "2. Android: Chrome → Zainstaluj aplikację",
      stepDesktop: "3. PC: Chrome/Edge → ikona ⊕ na pasku adresu",
      scanInstall: "Zeskanuj i zainstaluj",
      eyebrowApps: "Aplikacje",
      pitch: {
        medipacient:
          "Zrób zdjęcie PDF lub wyniku — nawet offline. Po połączeniu OCR wyciągnie rozpoznania, leki i kontrole.",
        mediprep:
          "Przygotowanie na rekrutację na 8 czeskich wydziałach lekarskich. Oryginalne testy z biologii, chemii i fizyki. E-mail + kod, bez hasła. Pierwszy test za darmo.",
        ordizapis: "Nagrywaj w telefonie — dyktando lub wizyta. AI przygotuje notatkę według szablonu.",
        mediflow: "Osobisty dziennik wellness — artykuły, objawy, suplementy i protokoły długowieczności.",
      },
    },
    about: {
      metaTitle: "O nas | MedScopeGlobal",
      metaDescription:
        "MedScopeGlobal to czeski portal medyczny dla czytelników, studentów medycyny, lekarzy i badaczy.",
      eyebrow: "O nas",
      title: "MedScopeGlobal — portal medyczny dla Czech",
      cta: "Skontaktuj się",
      home: "Start",
      missionTitle: "Nasza misja",
      mission:
        "MedScopeGlobal łączy praktykę kliniczną, badania i edukację medyczną. Kuratorowane treści, cytowania i biurka redakcyjne pomagają lekarzom, studentom i czytelnikom orientować się w szybko zmieniającej się medycynie.",
      forWhomTitle: "Dla kogo jesteśmy",
      forWhom: "Wybierz sekcję według tego, kim jesteś — każda ścieżka ma własne treści i narzędzia.",
      independenceTitle: "Niezależność marki",
      independence:
        "MedScopeGlobal to niezależna platforma na medscopeglobal.com. Nie jesteśmy powiązani z Medscape, WebMD ani z innymi zagranicznymi portalami o podobnej nazwie. Nie jesteśmy ich czeską mutacją ani licencją.",
      brandLink: "Marka i własność intelektualna",
      qualityTitle: "Jakość i bezpieczeństwo",
      quality:
        "Treści przechodzą recenzję redakcyjną. Narzędzia AI są audytowane i nie zastępują opieki medycznej. W nagłych przypadkach zadzwoń pod 155 lub 112.",
      contactTitle: "Kontakt i współpraca",
      contactBefore: "Pytanie o treść, partnerstwo albo reklamę? Odwiedź stronę",
      contactLink: "Kontakt",
      contactAfter: "— zwykle odpowiadamy w ciągu 24 godzin.",
      audiences: [
        { href: "/verejnost", label: "Czytelnicy", desc: "Profilaktyka, objawy i styl życia jasnym językiem" },
        { href: "/studenti", label: "Studenci", desc: "Anatomia, farmakologia i rekrutacja na wydział" },
        { href: "/lekari", label: "Lekarze", desc: "Wytyczne, badania i briefy kliniczne" },
        { href: "/studie", label: "Badania", desc: "Przeglądy badań i treści oparte na dowodach" },
      ],
    },
    contact: {
      metaTitle: "Kontakt | MedScopeGlobal",
      metaDescription: "Skontaktuj się z MedScopeGlobal w sprawie treści, partnerstwa lub reklamy.",
      eyebrow: "Kontakt",
      title: "Napisz do nas — odpowiadamy w ciągu 24 godzin",
      lead: "Pytania o treści publiczne, partnerstwa z uczelniami, reklamę i wsparcie techniczne. Każda wiadomość jest rejestrowana i kierowana do właściwego zespołu.",
      mainContact: "Główny kontakt",
      ads: "Reklama i ogłoszenia",
      phone: "Telefon",
      operator: "Operator",
      sendResearch: "Wyślij badanie",
      showPricing: "Zobacz cennik",
      replyEyebrow: "Odpowiedź w 24 godziny",
      replyTitle: "Priorytetowy kontakt",
      contactsTitle: "Główne kontakty",
      phoneSupport: "Telefon wsparcia",
      seat: "Siedziba",
      safeTitle: "Bezpieczne przetwarzanie",
      trustEyebrow: "Zaufanie i bezpieczeństwo",
      trustTitle: "Dlaczego możesz do nas napisać",
      privacy: "Prywatność (RODO)",
      about: "O nas",
      generalTitle: "Zapytanie ogólne",
      partnerTitle: "Kontakt partnerski",
    },
    students: {
      metaTitle: "MedScope dla studentów i kandydatów na medycynę",
      metaDescription: "Przygotowanie na rekrutację, materiały i quizy. 1 darmowy test, miesiąc wprowadzający, potem 10 €.",
      eyebrow: "MedScope · Studenci",
      title: "MedScope na drodze do medycyny",
      titleLine2: "i studiów na wydziale",
      lead: "Jedna mapa dla kandydatów, studentów i rodziców: rekrutacja, materiały, testy. Zacznij za darmo — bez obietnicy przyjęcia.",
      priceLine: "1 darmowy test · miesiąc wprowadzający · potem 10 € · rezygnacja w każdej chwili",
      downloadPrep: "Pobierz MeDiprep",
      wantMedicine: "Chcę na medycynę",
      iAmParent: "Jestem rodzicem",
      home: "Start",
      students: "Studenci",
      studentPlan: "Plan studencki",
      daysFree: "1 darmowy test · cena wprowadzająca",
      comparePlans: "Porównaj plany",
    },
  },
  ja: {
    disclaimerTitle: "重要な注意",
    disclaimerAria: "重要な注意",
    disclaimerBanner:
      "公開セクションの内容は教育目的です — 医療や診断の代わりではありません。急な不調では医師に連絡するか、救急に電話してください。",
    disclaimerInline:
      "MedScopeGlobalの情報は教育と見当をつけるためのものです。診察や治療の代わりではありません。緊急時は地域の救急に電話してください。",
    apps: {
      metaTitle: "MedScopeGlobalのアプリ — MediFlow、MeDipacient、OrdiZapis",
      metaDescription:
        "ウェルネス日記MediFlow、検査結果のMeDipacient、医師向けOrdiZapis。レガシーのMeDiprepも含む。PWAとしてインストール。",
      title: "アプリ",
      lead: "MediFlow、MeDipacient、OrdiZapis — ウェルネス、検査結果、記録を一つのプラットフォームで。",
      trialCta: "14日間無料",
      catalogCta: "カタログを見る",
      openApp: "開く",
      howItWorks: "使い方",
      downloadTitle: "ダウンロード",
      openInstalled: "アプリを開く",
      installLead: "ブラウザからスマホやPCのホーム画面に追加 — App StoreもGoogle Playも不要。",
      stepIos: "1. iPhone：Safari → 共有 → ホーム画面に追加",
      stepAndroid: "2. Android：Chrome → アプリをインストール",
      stepDesktop: "3. PC：Chrome/Edge → アドレスバーの ⊕",
      scanInstall: "スキャンしてインストール",
      eyebrowApps: "アプリ",
      pitch: {
        medipacient:
          "PDFや検査結果を撮影 — オフラインでも可。再接続後、OCRが診断・薬・フォローを取り出します。",
        mediprep:
          "チェコの医学部8校の入試対策。生物・化学・物理のオリジナル問題。メール＋コード、パスワード不要。最初のテストは無料。",
        ordizapis: "スマホで録音 — 口述または診察。AIがテンプレートから記録を下書きします。",
        mediflow: "個人のウェルネス日記 — 記事、症状、サプリ、長寿プロトコル。",
      },
    },
    about: {
      metaTitle: "私たちについて | MedScopeGlobal",
      metaDescription:
        "MedScopeGlobalは、一般読者・医学生・医師・研究者向けのチェコの医学ポータルです。",
      eyebrow: "私たちについて",
      title: "MedScopeGlobal — チェコの医学ポータル",
      cta: "お問い合わせ",
      home: "ホーム",
      missionTitle: "私たちの使命",
      mission:
        "MedScopeGlobalは臨床、研究、医学教育をつなぎます。編集された記事、出典、専門デスクが、変化の速い医療を医師・学生・読者が把握する助けになります。",
      forWhomTitle: "だれのための場か",
      forWhom: "自分に合うセクションを選んでください — それぞれに内容とツールがあります。",
      independenceTitle: "ブランドの独立性",
      independence:
        "MedScopeGlobalは medscopeglobal.com 上の独立したプラットフォームです。Medscape、WebMD、その他の類似名の海外医学ポータルとは提携していません。それらのチェコ版でもライセンスでもありません。",
      brandLink: "ブランドと知的財産",
      qualityTitle: "品質と安全",
      quality:
        "記事は編集審査を経ます。AIツールは監査され、専門医療の代わりではありません。緊急時は155または112に電話してください。",
      contactTitle: "連絡と提携",
      contactBefore: "記事、提携、広告についてのご質問は",
      contactLink: "お問い合わせ",
      contactAfter: "へ — 通常24時間以内に返信します。",
      audiences: [
        { href: "/verejnost", label: "一般", desc: "予防、症状、生活習慣をわかりやすく" },
        { href: "/studenti", label: "学生", desc: "解剖、薬理、医学部入試" },
        { href: "/lekari", label: "医師", desc: "ガイドライン、研究、臨床ブリーフ" },
        { href: "/studie", label: "研究", desc: "研究概要と根拠に基づく内容" },
      ],
    },
    contact: {
      metaTitle: "お問い合わせ | MedScopeGlobal",
      metaDescription: "編集、提携、広告についてのお問い合わせ。",
      eyebrow: "お問い合わせ",
      title: "ご連絡ください — 24時間以内に返信します",
      lead: "一般向け記事、大学提携、広告、技術サポート。すべてのメッセージを記録し、担当チームへ送ります。",
      mainContact: "主な連絡先",
      ads: "広告",
      phone: "電話",
      operator: "運営者",
      sendResearch: "研究を送る",
      showPricing: "料金を見る",
      replyEyebrow: "24時間以内に返信",
      contactsTitle: "主な連絡先",
      phoneSupport: "サポート電話",
      seat: "所在地",
      safeTitle: "安全な取り扱い",
      trustEyebrow: "信頼と安全",
      privacy: "プライバシー（GDPR）",
      about: "私たちについて",
      generalTitle: "一般のお問い合わせ",
      partnerTitle: "提携のご連絡",
    },
    students: {
      metaTitle: "医学生と受験生向け MedScope",
      metaDescription: "入試対策、教材、クイズ。無料テスト1回、導入月のあと10€。",
      eyebrow: "MedScope · 学生",
      title: "医学への道のための MedScope",
      titleLine2: "と学部の学び",
      lead: "受験生、学部生、保護者のための一枚の地図。入試、教材、テスト。無料で始められます — 合格は約束しません。",
      priceLine: "無料テスト1回 · 導入月 · その後10€ · いつでも解約",
      downloadPrep: "MeDiprepを入手",
      wantMedicine: "医学を学びたい",
      iAmParent: "保護者です",
      home: "ホーム",
      students: "学生",
      studentPlan: "学生プラン",
      daysFree: "無料テスト1回 · 導入価格",
      comparePlans: "プランを比較",
    },
  },
  ru: {
    apps: {
      title: "Приложения",
      lead: "MediFlow, MeDipacient и OrdiZapis — дневник, результаты и записи на одной платформе.",
      trialCta: "14 дней бесплатно",
      catalogCta: "Смотреть каталог",
      openApp: "Открыть",
      howItWorks: "Как это работает",
      downloadTitle: "Скачать",
      eyebrowApps: "Приложения",
      pitch: {
        mediflow: "Личный дневник здоровья — статьи, симптомы, добавки и протоколы долголетия.",
        ordizapis: "Записывайте на телефоне — диктовка или консультация. ИИ готовит запись по шаблону.",
      },
    },
    about: {
      eyebrow: "О нас",
      title: "MedScopeGlobal — медицинский портал для Чехии",
      cta: "Связаться с нами",
      home: "Главная",
      missionTitle: "Наша миссия",
      forWhomTitle: "Для кого мы",
      independenceTitle: "Независимость бренда",
      qualityTitle: "Качество и безопасность",
      contactTitle: "Контакт и партнёрство",
      audiences: [
        { href: "/verejnost", label: "Читатели", desc: "Профилактика, симптомы и образ жизни понятным языком" },
        { href: "/studenti", label: "Студенты", desc: "Анатомия, фармакология и поступление" },
        { href: "/lekari", label: "Врачи", desc: "Рекомендации, исследования и клинические брифы" },
        { href: "/studie", label: "Исследования", desc: "Обзоры исследований и доказательный контент" },
      ],
    },
    contact: {
      eyebrow: "Контакт",
      title: "Напишите нам — отвечаем в течение 24 часов",
      mainContact: "Основной контакт",
      ads: "Реклама",
      privacy: "Конфиденциальность (GDPR)",
      about: "О нас",
    },
    students: {
      eyebrow: "MedScope · Студенты",
      title: "MedScope для пути в медицину",
      wantMedicine: "Хочу в медицину",
      iAmParent: "Я родитель",
      daysFree: "1 бесплатный тест · вводная цена",
    },
  },
  zh: {
    apps: {
      title: "应用",
      lead: "MediFlow、MeDipacient 与 OrdiZapis — 健康日记、报告与记录在同一平台。",
      trialCta: "14 天免费",
      catalogCta: "浏览目录",
      openApp: "打开",
      howItWorks: "使用方法",
      downloadTitle: "下载",
      eyebrowApps: "应用",
      pitch: {
        mediflow: "个人健康日记 — 文章、症状、补充剂与长寿方案。",
      },
    },
    about: {
      eyebrow: "关于我们",
      title: "MedScopeGlobal — 面向捷克的医学门户",
      cta: "联系我们",
      home: "首页",
      missionTitle: "我们的使命",
      forWhomTitle: "我们为谁服务",
      audiences: [
        { href: "/verejnost", label: "读者", desc: "预防、症状与生活方式，讲明白" },
        { href: "/studenti", label: "学生", desc: "解剖、药理与医学院入学" },
        { href: "/lekari", label: "医生", desc: "指南、研究与临床简报" },
        { href: "/studie", label: "研究", desc: "研究综述与循证内容" },
      ],
    },
    contact: {
      eyebrow: "联系",
      title: "写信给我们 — 24 小时内回复",
      privacy: "隐私（GDPR）",
      about: "关于我们",
    },
    students: {
      eyebrow: "MedScope · 学生",
      title: "通往医学之路的 MedScope",
      daysFree: "1 次免费测验 · 入门价",
    },
  },
};

export function marketingAppsEdition(primary: string): MarketingAppsEdition | undefined {
  return EDITIONS[primary];
}
