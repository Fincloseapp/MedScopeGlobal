type PortalEdition = {
  apps?: string;
  forWhom?: string;
  inNumbers?: string;
  more?: string;
  newTab?: string;
  trialCta?: string;
  readMagazine?: string;
  servicesNav?: string;
  newsTabs?: string[];
};

const EDITIONS: Record<string, PortalEdition> = {
  sk: {
    apps: "Aplikácie",
    forWhom: "Pre koho",
    inNumbers: "V číslach",
    more: "viac",
    newTab: "nová karta",
    trialCta: "Vyskúšať 14 dní zadarmo",
    readMagazine: "Otvoriť magazín",
    servicesNav: "Služby MedScopeGlobal",
    newsTabs: ["Novinky", "Verejnosť", "Dlhovekosť", "Články"],
  },
  pl: {
    apps: "Aplikacje",
    forWhom: "Dla kogo",
    inNumbers: "W liczbach",
    more: "więcej",
    newTab: "nowa karta",
    trialCta: "Wypróbuj 14 dni za darmo",
    readMagazine: "Otwórz magazyn",
    servicesNav: "Usługi MedScopeGlobal",
    newsTabs: ["Aktualności", "Dla wszystkich", "Długowieczność", "Artykuły"],
  },
  ro: {
    apps: "Aplicații",
    forWhom: "Pentru cine",
    more: "mai mult",
    newTab: "filă nouă",
    trialCta: "Încearcă 14 zile gratuit",
    readMagazine: "Deschide revista",
    newsTabs: ["Știri", "Public", "Longevitate", "Articole"],
  },
  hu: {
    apps: "Alkalmazások",
    forWhom: "Kinek",
    more: "több",
    newTab: "új lap",
    trialCta: "14 nap ingyen",
    readMagazine: "Magazin megnyitása",
    newsTabs: ["Hírek", "Mindenkinek", "Hosszú élet", "Cikkek"],
  },
  ru: {
    apps: "Приложения",
    forWhom: "Для кого",
    inNumbers: "В цифрах",
    more: "ещё",
    newTab: "новая вкладка",
    trialCta: "14 дней бесплатно",
    readMagazine: "Открыть журнал",
    servicesNav: "Сервисы MedScopeGlobal",
    newsTabs: ["Новости", "Для всех", "Долголетие", "Статьи"],
  },
  uk: {
    apps: "Застосунки",
    forWhom: "Для кого",
    more: "ще",
    newTab: "нова вкладка",
    trialCta: "14 днів безкоштовно",
    readMagazine: "Відкрити журнал",
    newsTabs: ["Новини", "Для всіх", "Довголіття", "Статті"],
  },
  be: {
    apps: "Праграмы",
    forWhom: "Для каго",
    more: "яшчэ",
    trialCta: "14 дзён бясплатна",
    readMagazine: "Адкрыць часопіс",
    newsTabs: ["Навіны", "Для ўсіх", "Даўгалецце", "Артыкулы"],
  },
  zh: {
    apps: "应用",
    forWhom: "适合谁",
    inNumbers: "数据",
    more: "更多",
    newTab: "新标签页",
    trialCta: "免费试用 14 天",
    readMagazine: "打开杂志",
    servicesNav: "MedScopeGlobal 服务",
    newsTabs: ["新闻", "大众", "长寿", "文章"],
  },
  ja: {
    apps: "アプリ",
    forWhom: "対象",
    inNumbers: "数字で見る",
    more: "もっと",
    newTab: "新しいタブ",
    trialCta: "14日間無料",
    readMagazine: "雑誌を開く",
    servicesNav: "MedScopeGlobalのサービス",
    newsTabs: ["ニュース", "一般向け", "長寿", "記事"],
  },
  ko: {
    apps: "앱",
    forWhom: "대상",
    more: "더보기",
    newTab: "새 탭",
    trialCta: "14일 무료",
    readMagazine: "매거진 열기",
    newsTabs: ["뉴스", "일반", "장수", "기사"],
  },
  vi: {
    apps: "Ứng dụng",
    forWhom: "Dành cho ai",
    more: "thêm",
    newTab: "tab mới",
    trialCta: "Dùng thử 14 ngày",
    readMagazine: "Mở tạp chí",
    newsTabs: ["Tin", "Cho mọi người", "Trường thọ", "Bài viết"],
  },
  id: {
    apps: "Aplikasi",
    forWhom: "Untuk siapa",
    more: "lainnya",
    newTab: "tab baru",
    trialCta: "Coba 14 hari gratis",
    readMagazine: "Buka majalah",
    newsTabs: ["Berita", "Untuk semua", "Umur panjang", "Artikel"],
  },
};

export function portalChromeEdition(primary: string): PortalEdition | undefined {
  return EDITIONS[primary];
}
