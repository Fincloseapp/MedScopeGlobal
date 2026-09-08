import type { HomepageLongevityCopy } from "@/lib/i18n/homepage-longevity";

export type LongevityEdition = Partial<
  Pick<HomepageLongevityCopy, "closer" | "contributeHint" | "title" | "lead" | "readingTitle" | "allArticles" | "dailyTip" | "journal" | "eyebrow">
>;

const EDITIONS: Record<string, LongevityEdition> = {
  sk: {
    eyebrow: "ViaLongeVita · dlhovekosť",
    title: "Tri pokojné kroky, ktoré redakcia opakuje",
    lead: "Nie sú to sľuby ani protokoly. Sú to návyky z textov, ktoré ViaLongeVita už publikuje — spánok, pohyb, ktorý vydržíte, a jedlo bez honu za zázrakom.",
    readingTitle: "Z redakcie o dlhovekosti",
    allArticles: "Všetky články o dlhovekosti",
    dailyTip: "Dnešný tip",
    journal: "MediFlow denník",
    closer:
      "Úvod článku ostáva čitateľný. Zvyšok otvára tarif Redakcia — 1 € mesačne alebo 10 € za rok. Tip pri článku je dobrovoľný.",
    contributeHint: "Po dočítaní môžete prispieť — len ak chcete. Držíte tým text prístupný ďalšiemu čitateľovi.",
  },
  pl: {
    eyebrow: "ViaLongeVita · długowieczność",
    title: "Trzy spokojne kroki, które redakcja powtarza",
    lead: "To nie obietnice i nie protokoły. To nawyki z tekstów, które ViaLongeVita już publikuje — sen, ruch, który wytrzymasz, i jedzenie bez gonitwy za cudem.",
    readingTitle: "Z redakcji o długowieczności",
    allArticles: "Wszystkie artykuły o długowieczności",
    dailyTip: "Dzisiejsza wskazówka",
    journal: "Dziennik MediFlow",
    closer:
      "Początek artykułu zostaje czytelny. Resztę otwiera plan Redakcja — 1 € miesięcznie lub 10 € rocznie. Napiwek przy tekście jest dobrowolny.",
    contributeHint: "Po przeczytaniu możesz dołożyć się — tylko jeśli chcesz. Dzięki temu tekst zostaje otwarty dla następnej osoby.",
  },
  ja: {
    eyebrow: "ViaLongeVita · 長寿",
    title: "編集部が繰り返す、静かな三つの歩み",
    lead: "約束でもプロトコルでもありません。ViaLongeVitaがすでに出している習慣です — 睡眠、続けられる動き、奇跡を追わない食事。",
    readingTitle: "長寿についての編集部から",
    allArticles: "長寿の記事をすべて",
    dailyTip: "今日のヒント",
    journal: "MediFlow日記",
    closer:
      "記事の冒頭はそのまま読めます。続きは編集部プランで開きます — 月1€または年10€。記事のチップは任意です。",
    contributeHint: "読み終えたあと、希望すれば支援できます。次の読者のために本文を開いたままにします。",
  },
  ru: {
    eyebrow: "ViaLongeVita · долголетие",
    title: "Три спокойных шага, которые повторяет редакция",
    lead: "Это не обещания и не протоколы. Привычки из текстов, которые ViaLongeVita уже публикует — сон, движение, которое выдержите, и еда без погони за чудом.",
    readingTitle: "Из редакции о долголетии",
    allArticles: "Все статьи о долголетии",
    dailyTip: "Совет дня",
    journal: "Дневник MediFlow",
    closer:
      "Начало статьи остаётся читаемым. Остальное открывает тариф Редакция — 1 € в месяц или 10 € в год. Чаевые у текста добровольные.",
    contributeHint: "После прочтения можно поддержать — только если хотите. Так текст остаётся открытым следующему читателю.",
  },
  zh: {
    eyebrow: "ViaLongeVita · 长寿",
    title: "编辑部反复强调的三个安静步骤",
    lead: "不是承诺，也不是方案。而是 ViaLongeVita 已经写过的习惯——睡眠、能坚持的运动、不追逐奇迹的饮食。",
    readingTitle: "来自长寿编辑部",
    allArticles: "全部长寿文章",
    dailyTip: "今日提示",
    journal: "MediFlow 日记",
    closer: "开头仍可阅读。其余内容由编辑部方案打开——每月 1€ 或每年 10€。文中打赏出于自愿。",
    contributeHint: "读完后可以自愿支持，好让下一位读者也能读到全文。",
  },
  ro: {
    closer:
      "Începutul articolului rămâne lizibil. Restul se deschide cu planul Redacție — 1 € pe lună sau 10 € pe an. Bacșișul rămâne voluntar.",
    contributeHint: "După ce termini poți contribui — doar dacă vrei. Ține textul deschis pentru următorul cititor.",
  },
  hu: {
    closer:
      "A cikk eleje olvasható marad. A többit a Szerkesztőségi csomag nyitja — 1 € / hó vagy 10 € / év. A borravaló önkéntes.",
    contributeHint: "Elolvasás után támogathatsz — csak ha szeretnéd. Így a következő olvasónak is nyitva marad.",
  },
  uk: {
    closer:
      "Початок статті лишається читабельним. Решту відкриває тариф Редакція — 1 € на місяць або 10 € на рік. Чайові добровільні.",
    contributeHint: "Після прочитання можна підтримати — лише якщо хочете. Так текст лишається відкритим наступному читачеві.",
  },
  ko: {
    closer:
      "글의 앞부분은 그대로 읽을 수 있습니다. 나머지는 편집부 요금제로 열립니다 — 월 1€ 또는 연 10€. 팁은 자율입니다.",
    contributeHint: "다 읽은 뒤 원할 때만 후원할 수 있습니다. 다음 독자에게 본문을 열어 둡니다.",
  },
};

export function longevityEdition(primary: string): LongevityEdition | undefined {
  return EDITIONS[primary];
}
