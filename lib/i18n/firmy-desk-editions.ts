import type { FirmyDeskCopy } from "@/lib/i18n/firmy-desk-copy";

export type FirmyDeskEdition = Partial<Omit<FirmyDeskCopy, "rooms">> & {
  rooms?: Partial<Record<keyof FirmyDeskCopy["rooms"], Partial<FirmyDeskCopy["rooms"][keyof FirmyDeskCopy["rooms"]]>>>;
};

const EDITIONS: Record<string, FirmyDeskEdition> = {
  sk: {
    metaTitle: "Pre firmy — inzercia na ViaLongeVita",
    metaDescription:
      "Bannery, sponzorované články a partnerstvá pre pharma, kliniky a univerzity. Banner od 5 000 Kč/mes.",
    eyebrow: "Firmy a partneri",
    title: "Inzercia na ViaLongeVita",
    lead: "Zdravotnícke firmy inzerujú v magazíne, nie v lekárskej zóne. Cenník je orientačný, ponuka do 2 pracovných dní.",
    exchangeKicker: "Výrobcovia · laboratóriá",
    exchangeTitle: "Trhovisko nie je inzercia v magazíne",
    exchangeLead:
      "Dopyty z Česka a EÚ, CE / IVDR / ISO. Čitateľská reklama je vyššie — trhovisko výrobcov je samostatná stránka.",
    exchangeCta: "Otvoriť trhovisko",
    roomsKicker: "Formáty",
    roomsTitle: "Kam patrí ktorý dopyt",
    rooms: {
      cenik: {
        title: "Cenník",
        body: "Banner 5 000 Kč/mes., sponzorovaný článok 15 000 Kč, enterprise na mieru.",
        metaTitle: "B2B cenník pre firmy",
        lead: "Orientačné ceny bez DPH. Finálnu ponuku pripravíme do 2 pracovných dní.",
      },
      reklama: {
        title: "Reklama",
        body: "Bannery a newsletter sloty v magazíne. Lekárska zóna ostáva bez reklám.",
        metaTitle: "Reklama pre zdravotnícke firmy",
        lead: "Bannery rotujú v magazíne a vo verejnej časti. OrdiZapis a /lekari reklamu neberú.",
      },
      partnerstvi: {
        title: "Partnerstvo",
        body: "Univerzitná a inštitucionálna spolupráca — nie affiliate a nie skrytá inzercia.",
        metaTitle: "Partnerstvá firiem a inštitúcií",
        lead: "Partnerstvo je označené. Nie je to skrytá inzercia a nie je to vstup do lekárskej zóny.",
      },
      kampane: {
        title: "Kampane",
        body: "Segmentácia čitateľmi magazínu / verejnosť. Lekári a študenti majú vlastné plochy bez affiliate.",
        metaTitle: "Kampane pre firmy",
        lead: "Kampane cielia magazín a verejnosť. Odborné plochy lekárov ostávajú bez affiliate.",
      },
      kosmetika: {
        title: "Kozmetické značky",
        body: "Prémiová dermokozmetika v rubrike Kozmetika — označené partnerstvo, nie lekárska zóna.",
        lead: "Bannery, sponzorovaný článok a cielenie na /verejnost/clanky?topic=kosmetika.",
      },
    },
  },
  pl: {
    metaTitle: "Dla firm — reklama na ViaLongeVita",
    metaDescription: "Bannery, artykuły partnerskie i współpraca dla pharmy, klinik i uczelni.",
    eyebrow: "Firmy i partnerzy",
    title: "Reklama na ViaLongeVita",
    lead: "Firmy zdrowotne reklamują się w magazynie, nie w strefie lekarskiej. Cennik jest orientacyjny; oferta w 2 dni robocze.",
    exchangeKicker: "Producenci · laboratoria",
    exchangeTitle: "Rynek nie jest reklamą w magazynie",
    exchangeLead:
      "Zapotrzebowanie z Czech i UE, CE / IVDR / ISO. Reklama dla czytelników jest wyżej — rynek producentów to osobna strona.",
    exchangeCta: "Otwórz rynek",
    roomsKicker: "Formaty",
    roomsTitle: "Gdzie należy które zapytanie",
    rooms: {
      cenik: { title: "Cennik", body: "Banner 5 000 Kč/mies., artykuł partnerski 15 000 Kč, enterprise na zamówienie." },
      reklama: { title: "Reklama", body: "Bannery i sloty newslettera w magazynie. Strefa lekarska bez reklam." },
      partnerstvi: { title: "Partnerstwo", body: "Współpraca uniwersytecka i instytucjonalna — nie affiliate i nie ukryta reklama." },
      kampane: { title: "Kampanie", body: "Segmenty: katalog magazynu / czytelnicy. Lekarze i studenci bez affiliate." },
      kosmetika: { title: "Marki kosmetyczne", body: "Premium dermokosmetyki w Pielęgnacji — oznaczone partnerstwo." },
    },
  },
  ja: {
    metaTitle: "企業向け — ViaLongeVitaの広告",
    metaDescription: "製薬、クリニック、大学向けのバナー、提携記事、パートナーシップ。",
    eyebrow: "企業とパートナー",
    title: "ViaLongeVitaの広告",
    lead: "ヘルスケア企業は雑誌に出稿し、医師ゾーンには出ません。料金は目安。見積もりは2営業日以内。",
    exchangeKicker: "製造者 · ラボ",
    exchangeTitle: "マーケットは雑誌広告ではありません",
    exchangeLead:
      "チェコとEUの需要、CE / IVDR / ISO。読者向け広告は上にあります。製造者デスクは別ページです。",
    exchangeCta: "マーケットを開く",
    roomsKicker: "フォーマット",
    roomsTitle: "どの問い合わせがどこか",
    rooms: {
      cenik: { title: "料金", body: "バナー月5 000 Kč、提携記事15 000 Kč、エンタープライズは個別。" },
      reklama: { title: "広告", body: "雑誌のバナーとニュースレター枠。医師ゾーンは広告なし。" },
      partnerstvi: { title: "提携", body: "大学・機関との協力 — アフィリエイトでも隠れた広告でもない。" },
      kampane: { title: "キャンペーン", body: "雑誌読者と一般向け。医師と学生の面はアフィリエイトなし。" },
      kosmetika: { title: "化粧品ブランド", body: "スキンケア欄のプレミアムダーモコスメ — 表示付き提携。" },
    },
  },
  ro: {
    exchangeKicker: "Producători · laboratoare",
    exchangeTitle: "Piața nu este publicitate în revistă",
    exchangeLead:
      "Cerere din Cehia și UE, CE / IVDR / ISO. Publicitatea pentru cititori e mai sus — biroul producătorilor e o pagină separată.",
    exchangeCta: "Deschide piața",
  },
  hu: {
    exchangeKicker: "Gyártók · laborok",
    exchangeTitle: "A piactér nem magazinreklám",
    exchangeLead:
      "Cseh és uniós kereslet, CE / IVDR / ISO. Az olvasói hirdetés fent van — a gyártói asztal külön oldal.",
    exchangeCta: "Piactér megnyitása",
  },
  ru: {
    exchangeKicker: "Производители · лаборатории",
    exchangeTitle: "Рынок — это не реклама в журнале",
    exchangeLead:
      "Спрос из Чехии и ЕС, CE / IVDR / ISO. Реклама для читателей выше — стол производителей на отдельной странице.",
    exchangeCta: "Открыть рынок",
  },
  uk: {
    exchangeKicker: "Виробники · лабораторії",
    exchangeTitle: "Ринок — це не реклама в журналі",
    exchangeLead:
      "Попит з Чехії та ЄС, CE / IVDR / ISO. Реклама для читачів вище — стіл виробників на окремій сторінці.",
    exchangeCta: "Відкрити ринок",
  },
  be: {
    exchangeKicker: "Вытворцы · лабараторыі",
    exchangeTitle: "Рынак — гэта не рэклама ў часопісе",
    exchangeLead:
      "Попыт з Чэхіі і ЕС, CE / IVDR / ISO. Рэклама для чытачоў вышэй — стол вытворцаў на асобнай старонцы.",
    exchangeCta: "Адкрыць рынак",
  },
  zh: {
    exchangeKicker: "制造商 · 实验室",
    exchangeTitle: "市场不是杂志广告",
    exchangeLead: "捷克与欧盟需求，CE / IVDR / ISO。读者广告在上方 — 制造商工作台是单独页面。",
    exchangeCta: "打开市场",
  },
  ko: {
    exchangeKicker: "제조사 · 랩",
    exchangeTitle: "마켓은 매거진 광고가 아닙니다",
    exchangeLead: "체코·EU 수요, CE / IVDR / ISO. 독자 광고는 위에 있습니다. 제조사 데스크는 별도 페이지입니다.",
    exchangeCta: "마켓 열기",
  },
  vi: {
    exchangeKicker: "Nhà sản xuất · lab",
    exchangeTitle: "Chợ không phải quảng cáo tạp chí",
    exchangeLead: "Nhu cầu Czech và EU, CE / IVDR / ISO. Quảng cáo bạn đọc ở trên — bàn nhà sản xuất là trang riêng.",
    exchangeCta: "Mở chợ",
  },
  id: {
    exchangeKicker: "Produsen · lab",
    exchangeTitle: "Pasar bukan iklan majalah",
    exchangeLead: "Permintaan Ceko dan UE, CE / IVDR / ISO. Iklan pembaca ada di atas — meja produsen halaman terpisah.",
    exchangeCta: "Buka pasar",
  },
  pt: {
    exchangeKicker: "Fabricantes · laboratórios",
    exchangeTitle: "O mercado não é publicidade na revista",
    exchangeLead:
      "Procura da Chéquia e da UE, CE / IVDR / ISO. A publicidade para leitores está acima — o desk de fabricantes é uma página à parte.",
    exchangeCta: "Abrir o mercado",
  },
};

export function firmyDeskEdition(primary: string): FirmyDeskEdition | undefined {
  return EDITIONS[primary];
}
