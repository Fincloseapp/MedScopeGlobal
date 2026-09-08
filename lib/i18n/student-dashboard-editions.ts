type DashboardCopy = {
  kicker: string;
  title: [string, string];
  lead: string;
  open: string;
  test: string;
  gift: string;
  methodKicker: string;
  methodTitle: string;
  method: [string, string, string][];
  roomsKicker: string;
  roomsTitle: string;
  roomsLead: string;
  facultyKicker: string;
  facultyLead: string;
  official: string;
  parentKicker: string;
  parentTitle: string;
  parentLead: string;
  parentCta: string;
  footnote: string;
};

export type StudentDashboardEdition = Partial<DashboardCopy> & {
  rooms?: Record<string, { title?: string; body?: string }>;
};

const EDITIONS: Record<string, StudentDashboardEdition> = {
  sk: {
    kicker: "Ateliér Student LF",
    title: ["Jedna mapa.", "Od požiadaviek fakúlt k dennému kvízu."],
    lead: "Zostavené podľa oficiálnych požiadaviek lekárskych fakúlt, banky B/C/F a miestností, ktoré uchádzači aj študenti LF naozaj otvárajú. Žiadne vymyslené recenzie. Prijatie nesľubujeme.",
    open: "Otvoriť desk",
    test: "Najprv 1 test",
    gift: "Poslať ako darček",
    methodKicker: "Ako to vzniklo",
    methodTitle: "Fakulty, pedagogika, študenti — v tomto poradí.",
    method: [
      ["01  Fakulty", "Oficiálne weby škôl vo vašej krajine. Termíny len z nich — nič si nevymýšľame.", ""],
      ["02  Pedagogika", "Rovnaké predmety ako pri prijímackách: biológia, chémia, fyzika. Banka B/C/F.", ""],
      ["03  Študenti", "Desk ukazuje miestnosti, ktoré sa skutočne používajú — kvíz, simulácia, tutor, semester.", ""],
    ],
    roomsKicker: "Desk",
    roomsTitle: "Miestnosti, nie zľavy.",
    roomsLead: "Prehľad toho, čo otvoríte po prvom teste. Kvízy MeDiprep ostávajú české B/C/F.",
    facultyKicker: "Konzultácia s webmi škôl",
    facultyLead: "Rovnaký formát ako pri českých LF. Zahraničné termíny neuvádzame odhadom.",
    official: "Oficiálny web",
    parentKicker: "Rodičia",
    parentTitle: "Zaplatíte. Odkaz pošlete.",
    parentLead: "Jedna platba, jeden účet. Študent ho aktivuje po prihlásení. Verejne ostane prezývka. 18+ alebo so súhlasom zákonného zástupcu.",
    parentCta: "Ako odkaz funguje",
    footnote: "Uchádzač · študent LF · rodič — bez sľubu prijatia.",
    rooms: {
      "/studenti/klub": { title: "Klub B/C/F", body: "Osem otázok z banky prijímaciek. Na tabuli len prezývka." },
      "/app/priprava": { title: "MeDiprep desk", body: "1 test zadarmo. Cvičenie a simulácie podľa požiadaviek LF." },
      "/studenti/testy": { title: "Testy", body: "Self-test, klub a hry — jedna mapa na precvičenie." },
      "/academy/courses?category=prijimacky": { title: "Academy", body: "Biológia, chémia, fyzika — prvá lekcia na nahliadnutie." },
      "/studenti/materialy": { title: "Materiály", body: "Témy, skúšky, semester — knižnica, nie skládka súborov." },
      "/studenti/ai-tutor": { title: "AI tutor", body: "Vysvetlenie látky. Nevymýšľa fakty ani sľub prijatia." },
      "/studenti/hry": { title: "Odbornosť", body: "Krátke opakovanie anatómie, fyziológie, patológie." },
      "/studenti/zebricek": { title: "Rebríček", body: "Len prezývky. Žiadny e-mail, žiadne falošné mená." },
      "/studenti/chci-studovat": { title: "Chcem na medicínu", body: "Self-test, fakulty, príprava — jedna os uchádzača." },
    },
  },
  pl: {
    kicker: "Atelier Student LF",
    title: ["Jedna mapa.", "Od wymagań wydziałów do codziennego quizu."],
    lead: "Zbudowane z oficjalnych wymagań wydziałów lekarskich, banku B/C/F i sal, które kandydaci i studenci naprawdę otwierają. Bez wymyślonych recenzji. Nie obiecujemy przyjęcia.",
    open: "Otwórz desk",
    test: "Najpierw 1 test",
    gift: "Wyślij jako prezent",
    methodKicker: "Jak to powstało",
    methodTitle: "Wydziały, pedagogika, studenci — w tej kolejności.",
    method: [
      ["01  Wydziały", "Oficjalne strony uczelni w Twoim kraju. Terminy tylko stamtąd — nic nie wymyślamy.", ""],
      ["02  Pedagogika", "Te same przedmioty co na rekrutacji: biologia, chemia, fizyka. Bank B/C/F.", ""],
      ["03  Studenci", "Desk pokazuje sale, które naprawdę się używa — quiz, symulacja, tutor, semestr.", ""],
    ],
    roomsKicker: "Desk",
    roomsTitle: "Sale, nie kupony.",
    roomsLead: "Co otworzysz po pierwszym teście. Quizy MeDiprep zostają czeskim B/C/F.",
    facultyKicker: "Z oficjalnych stron uczelni",
    facultyLead: "Ten sam format co czeskie wydziały. Zagranicznych terminów nie zgadujemy.",
    official: "Oficjalna strona",
    parentKicker: "Rodzice",
    parentTitle: "Płacisz. Wysyłasz link.",
    parentLead: "Jedna płatność, jedno konto. Student aktywuje je po zalogowaniu. Publicznie zostaje ksywka. 18+ albo za zgodą opiekuna.",
    parentCta: "Jak działa link",
    footnote: "Kandydat · student · rodzic — bez obietnicy przyjęcia.",
    rooms: {
      "/studenti/klub": { title: "Klub B/C/F", body: "Osiem pytań z banku rekrutacji. Na tablicy tylko ksywka." },
      "/app/priprava": { title: "MeDiprep desk", body: "1 darmowy test. Ćwiczenia i symulacje według wymagań wydziału." },
      "/studenti/testy": { title: "Testy", body: "Self-test, klub i gry — jedna mapa do ćwiczeń." },
      "/academy/courses?category=prijimacky": { title: "Academy", body: "Biologia, chemia, fizyka — pierwsza lekcja do wglądu." },
      "/studenti/materialy": { title: "Materiały", body: "Tematy, egzaminy, semestr — biblioteka, nie skład plików." },
      "/studenti/ai-tutor": { title: "AI tutor", body: "Wyjaśnia temat. Nie wymyśla faktów i nie obiecuje przyjęcia." },
      "/studenti/hry": { title: "Powtórka", body: "Krótkie powtórzenie anatomii, fizjologii, patologii." },
      "/studenti/zebricek": { title: "Tablica", body: "Tylko ksywki. Bez e-maila, bez wymyślonych imion." },
      "/studenti/chci-studovat": { title: "Chcę na medycynę", body: "Self-test, wydziały, przygotowanie — jedna oś kandydata." },
    },
  },
  ja: {
    kicker: "Student LF アトリエ",
    title: ["一枚の地図。", "学部の要件から毎日のクイズまで。"],
    lead: "公式の医学部要件、B/C/F問題バンク、受験生と学部生が実際に開く部屋から組み立てています。捏造レビューなし。合格は約束しません。",
    open: "デスクを開く",
    test: "まず1回テスト",
    gift: "ギフトとして送る",
    methodKicker: "どう作ったか",
    methodTitle: "学部、教育、学生 — この順です。",
    method: [
      ["01  学部", "自国の公式大学サイト。日程はそこだけ — 推測しません。", ""],
      ["02  教育", "入試と同じ科目：生物、化学、物理。B/C/Fバンク。", ""],
      ["03  学生", "デスクは実際に使う部屋を示します — クイズ、模試、チューター、学期。", ""],
    ],
    roomsKicker: "デスク",
    roomsTitle: "部屋であり、クーポンではない。",
    roomsLead: "最初のテストのあと開くもの。MeDiprepのクイズはチェコのB/C/Fのままです。",
    facultyKicker: "大学サイトから読む",
    facultyLead: "チェコの医学部と同じ形式。海外の締切は推測しません。",
    official: "公式サイト",
    parentKicker: "保護者",
    parentTitle: "支払う。リンクを送る。",
    parentLead: "1回の支払い、1つのアカウント。学生はログイン後に有効化。公開ボードはニックネームのみ。18歳以上、または保護者の同意。",
    parentCta: "リンクの仕組み",
    footnote: "受験生 · 学部生 · 保護者 — 合格の約束なし。",
    rooms: {
      "/studenti/klub": { title: "B/C/Fクラブ", body: "入試バンクから8問。ボードにはニックネームだけ。" },
      "/app/priprava": { title: "MeDiprep desk", body: "無料テスト1回。学部要件に沿った練習と模試。" },
      "/studenti/testy": { title: "テスト", body: "セルフテスト、クラブ、ゲーム — 練習用の一枚の地図。" },
      "/academy/courses?category=prijimacky": { title: "Academy", body: "生物、化学、物理 — 最初のレッスンを試し見。" },
      "/studenti/materialy": { title: "教材", body: "テーマ、試験、学期 — ライブラリであり、ファイルの山ではない。" },
      "/studenti/ai-tutor": { title: "AIチューター", body: "内容を説明します。事実を捏造せず、合格も約束しません。" },
      "/studenti/hry": { title: "復習", body: "解剖、生理、病理の短い復習。" },
      "/studenti/zebricek": { title: "ボード", body: "ニックネームのみ。メールも偽名もなし。" },
      "/studenti/chci-studovat": { title: "医学を学びたい", body: "セルフテスト、学部、対策 — 受験生の一本の軸。" },
    },
  },
};

export function studentDashboardEdition(primary: string): StudentDashboardEdition | undefined {
  return EDITIONS[primary];
}
