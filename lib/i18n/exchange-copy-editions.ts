import type { ExchangeCopy, ExchangeListingCopy } from "@/lib/i18n/exchange-copy";
import type { ExchangeListingId } from "@/lib/b2b/exchange-listings";

export type ExchangeEdition = Partial<Omit<ExchangeCopy, "listings">> & {
  listings?: Partial<Record<ExchangeListingId, Partial<ExchangeListingCopy>>>;
};

const EDITIONS: Record<string, ExchangeEdition> = {
  sk: {
    metaTitle: "B2B trhovisko — výrobcovia a laboratóriá v Česku a EÚ",
    metaDescription:
      "Dopyty zadarmo pre nemocnice a laboratóriá. Kontakty vidí platiaci inzerent. Česko a EÚ, CE / IVDR / ISO.",
    title: "Trhovisko pre výrobcov, nemocnice a laboratóriá",
    leadBefore:
      "Kupujúci z Česka a EÚ dopytuje zadarmo. Kontakty vidí len platiaci inzerent — bez provízie z obchodu. Magazín ViaLongeVita sem nepatrí: čitateľská inzercia je na",
    registerCta: "Registrovať firmu",
    adsCta: "Inzercia v magazíne",
    regions: "Regióny: Česko · EÚ. Certifikácia: CE / IVDR / ISO.",
    heroAlt: "Laboratórna stanica — trhovisko výrobcov MedScopeGlobal",
    listings: {
      "poc-cr-ce": {
        region: "Česko + EÚ",
        category: "Diagnostika · POC",
        title: "CE-IVDR analyzátor pre ambulanciu (imunoassay)",
        maker: "EÚ výrobca, distribúcia ČR/SK",
        summary:
          "Point-of-care imunoassay pre ambulancie a laboratóriá v Česku a na Slovensku. Kontakty až po overení inzerenta.",
      },
      "lab-panels-eu": {
        region: "EÚ",
        category: "Laboratórium",
        title: "Imunologické panely pre EÚ laboratóriá",
        maker: "Výrobca v EÚ, sklady DE/CZ",
        summary: "Špecializované panely pre nemocničné a zmluvné laboratóriá v EÚ. Sklady DE/CZ, CE / ISO 13485.",
      },
      "telemed-b2b-cz": {
        region: "Česko",
        category: "Telemedicína B2B",
        title: "Inštitúcia–inštitúcia: telemedicínsky kanál pre české siete",
        maker: "Dodávateľ so sídlom v ČR",
        summary: "B2B napojenie nemocnica / laboratórium / sieť ambulancií. Žiadna distančná starostlivosť koncovému pacientovi.",
      },
    },
  },
  pl: {
    metaTitle: "Rynek B2B — producenci i laboratoria w Czechach i UE",
    metaDescription: "Bezpłatne zapytania dla szpitali i laboratoriów. Kontakty widzą płatni reklamodawcy. Czechy i UE, CE / IVDR / ISO.",
    title: "Rynek dla producentów, szpitali i laboratoriów",
    leadBefore:
      "Kupujący w Czechach i UE zgłaszają zapotrzebowanie za darmo. Kontakty widzą tylko płatni reklamodawcy — bez prowizji. Magazyn ViaLongeVita tu nie należy: reklama dla czytelników jest na",
    registerCta: "Zarejestruj firmę",
    adsCta: "Reklama w magazynie",
    regions: "Regiony: Czechy · UE. Certyfikacja: CE / IVDR / ISO.",
    heroAlt: "Stanowisko laboratoryjne — rynek producentów MedScopeGlobal",
    listings: {
      "poc-cr-ce": {
        region: "Czechy + UE",
        title: "Analizator immunoassay CE-IVDR do gabinetu",
        summary: "Immunoassay przy pacjencie dla gabinetów i laboratoriów w Czechach i na Słowacji. Kontakty po weryfikacji.",
      },
      "lab-panels-eu": {
        title: "Panele immunologiczne dla laboratoriów UE",
        summary: "Panele specjalistyczne dla laboratoriów szpitalnych i kontraktowych w UE. Magazyny DE/CZ.",
      },
      "telemed-b2b-cz": {
        region: "Czechy",
        title: "Kanał instytucja–instytucja dla sieci czeskich",
        summary: "Połączenie B2B szpital / laboratorium / sieć gabinetów. Bez opieki zdalnej dla pacjenta końcowego.",
      },
    },
  },
  ro: {
    metaTitle: "Piață B2B — producători și laboratoare în Cehia și UE",
    title: "Piață pentru producători, spitale și laboratoare",
    leadBefore:
      "Cumpărătorii din Cehia și UE publică gratuit. Contactele le văd doar advertiserii plătitori. ViaLongeVita nu aparține aici: publicitatea pentru cititori e pe",
    registerCta: "Înregistrează firma",
    adsCta: "Publicitate în revistă",
    regions: "Regiuni: Cehia · UE. Certificare: CE / IVDR / ISO.",
    heroAlt: "Stație de laborator — piața producătorilor MedScopeGlobal",
  },
  hu: {
    metaTitle: "B2B piactér — gyártók és laborok Csehországban és az EU-ban",
    title: "Piactér gyártóknak, kórházaknak és laboroknak",
    leadBefore:
      "A cseh és uniós vevők ingyen hirdetnek keresletet. A kapcsolatokat csak fizető hirdetők látják. A ViaLongeVita ide nem tartozik: az olvasói hirdetés itt van:",
    registerCta: "Cég regisztrálása",
    adsCta: "Hirdetés a magazinban",
    regions: "Régiók: Csehország · EU. Tanúsítás: CE / IVDR / ISO.",
    heroAlt: "Laborállomás — MedScopeGlobal gyártói piactér",
  },
  ru: {
    metaTitle: "B2B-рынок — производители и лаборатории в Чехии и ЕС",
    title: "Рынок для производителей, больниц и лабораторий",
    leadBefore:
      "Покупатели в Чехии и ЕС размещают спрос бесплатно. Контакты видят только платящие рекламодатели. ViaLongeVita сюда не относится: реклама для читателей — на",
    registerCta: "Зарегистрировать компанию",
    adsCta: "Реклама в журнале",
    regions: "Регионы: Чехия · ЕС. Сертификация: CE / IVDR / ISO.",
    heroAlt: "Лабораторная станция — рынок производителей MedScopeGlobal",
  },
  uk: {
    metaTitle: "B2B-ринок — виробники та лабораторії в Чехії та ЄС",
    title: "Ринок для виробників, лікарень і лабораторій",
    leadBefore:
      "Покупці в Чехії та ЄС публікують попит безкоштовно. Контакти бачать лише платні рекламодавці. ViaLongeVita сюди не входить: реклама для читачів на",
    registerCta: "Зареєструвати компанію",
    adsCta: "Реклама в журналі",
    regions: "Регіони: Чехія · ЄС. Сертифікація: CE / IVDR / ISO.",
    heroAlt: "Лабораторна станція — ринок виробників MedScopeGlobal",
  },
  be: {
    metaTitle: "B2B-рынак — вытворцы і лабараторыі ў Чэхіі і ЕС",
    title: "Рынак для вытворцаў, шпіталяў і лабараторый",
    leadBefore:
      "Пакупнікі ў Чэхіі і ЕС публікуюць попыт бясплатна. Кантакты бачаць толькі платныя рэкламадаўцы. ViaLongeVita сюды не належыць: рэклама для чытачоў на",
    registerCta: "Зарэгістраваць кампанію",
    adsCta: "Рэклама ў часопісе",
    regions: "Рэгіёны: Чэхія · ЕС. Сертыфікацыя: CE / IVDR / ISO.",
    heroAlt: "Лабараторная станцыя — рынак вытворцаў MedScopeGlobal",
  },
  zh: {
    metaTitle: "B2B 市场 — 捷克与欧盟的制造商和实验室",
    title: "面向制造商、医院与实验室的市场",
    leadBefore:
      "捷克与欧盟买家免费发布需求。只有付费广告主能看到联系方式。ViaLongeVita 不属于这里：读者广告在",
    registerCta: "注册公司",
    adsCta: "杂志广告",
    regions: "地区：捷克 · 欧盟。认证：CE / IVDR / ISO。",
    heroAlt: "实验室工位 — MedScopeGlobal 制造商市场",
  },
  ja: {
    metaTitle: "B2Bマーケット — チェコとEUの製造者・ラボ",
    title: "製造者、病院、ラボ向けマーケット",
    leadBefore:
      "チェコとEUの買い手は無料で需要を出します。連絡先は有料広告主だけが見られます。ViaLongeVitaはここではありません。読者向け広告は",
    registerCta: "会社を登録",
    adsCta: "雑誌広告",
    regions: "地域：チェコ · EU。認証：CE / IVDR / ISO。",
    heroAlt: "ラボワークステーション — MedScopeGlobal製造者マーケット",
  },
  ko: {
    metaTitle: "B2B 마켓 — 체코와 EU의 제조사·랩",
    title: "제조사, 병원, 랩을 위한 마켓",
    leadBefore:
      "체코와 EU 구매자는 무료로 수요를 올립니다. 연락처는 유료 광고주만 봅니다. ViaLongeVita는 여기가 아닙니다. 독자 광고는",
    registerCta: "회사 등록",
    adsCta: "매거진 광고",
    regions: "지역: 체코 · EU. 인증: CE / IVDR / ISO.",
    heroAlt: "실험실 워크스테이션 — MedScopeGlobal 제조사 마켓",
  },
  vi: {
    metaTitle: "Chợ B2B — nhà sản xuất và lab ở Czech và EU",
    title: "Chợ cho nhà sản xuất, bệnh viện và phòng xét nghiệm",
    leadBefore:
      "Người mua ở Czech và EU đăng nhu cầu miễn phí. Chỉ nhà quảng cáo trả phí thấy liên hệ. ViaLongeVita không thuộc đây: quảng cáo bạn đọc ở",
    registerCta: "Đăng ký công ty",
    adsCta: "Quảng cáo tạp chí",
    regions: "Khu vực: Czech · EU. Chứng nhận: CE / IVDR / ISO.",
    heroAlt: "Trạm thí nghiệm — chợ nhà sản xuất MedScopeGlobal",
  },
  id: {
    metaTitle: "Pasar B2B — produsen dan lab di Ceko dan UE",
    title: "Pasar untuk produsen, rumah sakit, dan laboratorium",
    leadBefore:
      "Pembeli di Ceko dan UE memasang permintaan gratis. Kontak hanya terlihat pengiklan berbayar. ViaLongeVita tidak di sini: iklan pembaca ada di",
    registerCta: "Daftarkan perusahaan",
    adsCta: "Iklan majalah",
    regions: "Wilayah: Ceko · UE. Sertifikasi: CE / IVDR / ISO.",
    heroAlt: "Stasiun laboratorium — pasar produsen MedScopeGlobal",
  },
  pt: {
    metaTitle: "Mercado B2B — fabricantes e laboratórios na Chéquia e na UE",
    title: "Mercado para fabricantes, hospitais e laboratórios",
    leadBefore:
      "Compradores na Chéquia e na UE publicam de graça. Só anunciantes pagantes veem contactos. A ViaLongeVita não entra aqui: a publicidade para leitores fica em",
    registerCta: "Registar empresa",
    adsCta: "Publicidade na revista",
    regions: "Regiões: Chéquia · UE. Certificação: CE / IVDR / ISO.",
    heroAlt: "Estação de laboratório — mercado de fabricantes MedScopeGlobal",
  },
};

export function exchangeEdition(primary: string): ExchangeEdition | undefined {
  return EDITIONS[primary];
}
