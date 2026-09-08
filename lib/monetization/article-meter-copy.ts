import { editorialMonthlyBannerPrice } from "@/lib/editorial/pricing";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

export type ArticleMeterCopy = {
  remaining: (pct: number) => string;
  youWillRead: string;
  continueReading: string;
  leftoverFallback: string;
  yearSecondary: string;
};

type Pack = Omit<ArticleMeterCopy, "remaining"> & {
  remainingTpl: string;
};

function fillPct(template: string, pct: number): string {
  return template.replace("{pct}", String(pct));
}

const PACKS: Record<string, Pack> = {
  cs: {
    remainingTpl: "Zbývá vám ještě {pct} % článku",
    youWillRead: "Co se dočtete dál",
    continueReading: "Číst dál",
    leftoverFallback: "zbytek argumentu, praktické body a zdroje",
    yearSecondary: "nebo roční předplatné",
  },
  sk: {
    remainingTpl: "Zostáva vám ešte {pct} % článku",
    youWillRead: "Čo sa dočítate ďalej",
    continueReading: "Čítať ďalej",
    leftoverFallback: "zvyšok argumentu, praktické body a zdroje",
    yearSecondary: "alebo ročné predplatné",
  },
  pl: {
    remainingTpl: "Zostało wam jeszcze {pct} % artykułu",
    youWillRead: "Co przeczytacie dalej",
    continueReading: "Czytaj dalej",
    leftoverFallback: "reszta argumentu, praktyczne punkty i źródła",
    yearSecondary: "lub abonament roczny",
  },
  de: {
    remainingTpl: "Es bleiben Ihnen noch {pct} % des Artikels",
    youWillRead: "Das lesen Sie noch",
    continueReading: "Weiterlesen",
    leftoverFallback: "den Rest der Argumente, die Praxispunkte und die Quellen",
    yearSecondary: "oder das Jahresabo",
  },
  fr: {
    remainingTpl: "Il vous reste encore {pct} % de l’article",
    youWillRead: "Ce que vous lirez ensuite",
    continueReading: "Lire la suite",
    leftoverFallback: "le reste de l’argument, les points pratiques et les sources",
    yearSecondary: "ou l’abonnement annuel",
  },
  it: {
    remainingTpl: "Vi resta ancora il {pct} % dell’articolo",
    youWillRead: "Cosa leggerete ancora",
    continueReading: "Leggi di più",
    leftoverFallback: "il resto dell’argomento, i punti pratici e le fonti",
    yearSecondary: "oppure l’abbonamento annuale",
  },
  es: {
    remainingTpl: "Le queda aún el {pct} % del artículo",
    youWillRead: "Lo que leerá a continuación",
    continueReading: "Seguir leyendo",
    leftoverFallback: "el resto del argumento, los puntos prácticos y las fuentes",
    yearSecondary: "o la suscripción anual",
  },
  pt: {
    remainingTpl: "Falta {pct} % do artigo",
    youWillRead: "Ainda vai ler",
    continueReading: "Continuar a ler",
    leftoverFallback: "o resto do argumento, pontos práticos e fontes",
    yearSecondary: "ou a assinatura anual",
  },
  "pt-BR": {
    remainingTpl: "Faltam {pct} % do artigo",
    youWillRead: "Você ainda vai ler",
    continueReading: "Continuar lendo",
    leftoverFallback: "o resto do argumento, pontos práticos e fontes",
    yearSecondary: "ou a assinatura anual",
  },
  ro: {
    remainingTpl: "Mai rămâne {pct} % din articol",
    youWillRead: "Veți mai citi",
    continueReading: "Citește mai departe",
    leftoverFallback: "restul argumentului, punctele practice și sursele",
    yearSecondary: "sau abonamentul anual",
  },
  hu: {
    remainingTpl: "A cikk {pct} %-a van hátra",
    youWillRead: "Még ezt olvassa",
    continueReading: "Olvasás tovább",
    leftoverFallback: "a gondolatmenet végét, a gyakorlati pontokat és a forrásokat",
    yearSecondary: "vagy az éves előfizetés",
  },
  ru: {
    remainingTpl: "Осталось {pct} % статьи",
    youWillRead: "Вы ещё прочитаете",
    continueReading: "Читать дальше",
    leftoverFallback: "остальную аргументацию, практические пункты и источники",
    yearSecondary: "или годовая подписка",
  },
  uk: {
    remainingTpl: "Залишилося {pct} % статті",
    youWillRead: "Ви ще прочитаєте",
    continueReading: "Читати далі",
    leftoverFallback: "решту аргументів, практичні пункти та джерела",
    yearSecondary: "або річна передплата",
  },
  be: {
    remainingTpl: "Засталося {pct} % артыкула",
    youWillRead: "Вы яшчэ прачытаеце",
    continueReading: "Чытаць далей",
    leftoverFallback: "рэшту аргументаў, практычныя пункты і крыніцы",
    yearSecondary: "або гадавая падпіска",
  },
  zh: {
    remainingTpl: "还剩 {pct}% 的文章",
    youWillRead: "接下来还能读到",
    continueReading: "继续阅读",
    leftoverFallback: "余下论述、实用要点和来源",
    yearSecondary: "或年费订阅",
  },
  ja: {
    remainingTpl: "記事の残りは {pct}％",
    youWillRead: "この先も読めます",
    continueReading: "続きを読む",
    leftoverFallback: "残りの論点、実践ポイント、出典",
    yearSecondary: "または年額プラン",
  },
  ko: {
    remainingTpl: "기사의 {pct}%가 남았습니다",
    youWillRead: "이어서 읽게 됩니다",
    continueReading: "계속 읽기",
    leftoverFallback: "남은 논지, 실전 포인트, 출처",
    yearSecondary: "또는 연간 구독",
  },
  vi: {
    remainingTpl: "Còn {pct} % bài viết",
    youWillRead: "Bạn sẽ còn đọc",
    continueReading: "Đọc tiếp",
    leftoverFallback: "phần lập luận còn lại, các điểm thực hành và nguồn",
    yearSecondary: "hoặc gói năm",
  },
  id: {
    remainingTpl: "Tersisa {pct} % artikel",
    youWillRead: "Anda masih akan membaca",
    continueReading: "Baca lanjut",
    leftoverFallback: "sisa argumen, poin praktis, dan sumber",
    yearSecondary: "atau langganan tahunan",
  },
  en: {
    remainingTpl: "You still have {pct}% of the article left",
    youWillRead: "What you will still read",
    continueReading: "Read on",
    leftoverFallback: "the rest of the argument, the practical points and the sources",
    yearSecondary: "or the yearly plan",
  },
};

function packFor(locale?: string | null): Pack {
  const normalized = normalizeLocale(locale ?? "cs");
  if (PACKS[normalized]) return PACKS[normalized]!;
  const primary = primaryArticleLocale(normalized);
  if (PACKS[primary]) return PACKS[primary]!;
  if (primary === "zh") return PACKS.zh!;
  return PACKS.en!;
}

export function getArticleMeterCopy(locale?: string | null): ArticleMeterCopy {
  const pack = packFor(locale);
  return {
    remaining: (pct) => fillPct(pack.remainingTpl, pct),
    youWillRead: pack.youWillRead,
    continueReading: pack.continueReading,
    leftoverFallback: pack.leftoverFallback,
    yearSecondary: pack.yearSecondary,
  };
}

export function articleMeterPriceLabel(locale?: string | null, region?: string | null): string {
  return editorialMonthlyBannerPrice(locale, region);
}
