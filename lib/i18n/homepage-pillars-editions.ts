import type {
  HomepagePillar,
  HomepagePillarId,
  HomepagePillarsCopy,
} from "@/lib/i18n/homepage-pillars-copy";

export type HomepagePillarsEdition = Partial<Omit<HomepagePillarsCopy, "pillars">> & {
  pillars?: Partial<
    Record<HomepagePillarId, Partial<Omit<HomepagePillar, "id" | "czechOnly" | "href" | "ctaHref" | "secondaryHref">>>
  >;
};

const EDITIONS: Record<string, HomepagePillarsEdition> = {
  sk: {
    title: "Štyri vstupy. Jedna platforma.",
    lead: "Magazín ViaLongeVita, trhovisko výrobcov, MeDiprep pre uchádzačov o LF a OrdiZapis pre ambulanciu. Vyberte, kým ste.",
    jumpLabel: "Rýchla orientácia",
    pillars: {
      magazine: {
        eyebrow: "Čitatelia",
        lead: "Magazín zdravia a dlhovekosti. Spánok, pohyb, výživa a GLP-1 — redakcia s citáciami, nie clickbait.",
        cta: "Čítať magazín",
        secondary: "Hľadať v redakcii",
      },
      marketplace: {
        eyebrow: "Výrobcovia a laboratóriá",
        title: "Trhovisko",
        lead: "Dopyty z Česka a EÚ, CE / IVDR / ISO. Inzercia u čitateľov je zvlášť — v magazíne na /firmy.",
        cta: "Otvoriť trhovisko",
        secondary: "Inzercia v magazíne",
      },
      students: {
        eyebrow: "Uchádzači o medicínu",
        title: "Študenti",
        lead: "MeDiprep — testy biológie, chémie a fyziky podľa požiadaviek českých lekárskych fakúlt.",
        cta: "Otvoriť MeDiprep",
        secondary: "Mapa k prijímačkám",
      },
      physicians: {
        eyebrow: "Ambulancia",
        title: "Lekári",
        lead: "OrdiZapis napíše zápis z diktátu v telefóne. K tomu tri živé ESC odporúčania s DOI.",
        cta: "Stiahnuť OrdiZapis",
        secondary: "Desk lekára",
      },
    },
  },
  pl: {
    title: "Cztery wejścia. Jedna platforma.",
    lead: "Magazyn ViaLongeVita, rynek producentów i OrdiZapis dla gabinetu. Wybierz, kim jesteś.",
    jumpLabel: "Szybka orientacja",
    pillars: {
      magazine: {
        eyebrow: "Czytelnicy",
        lead: "Magazyn zdrowia i długowieczności. Sen, ruch, odżywianie, GLP-1 — redakcja ze źródłami, nie clickbait.",
        cta: "Czytaj magazyn",
        secondary: "Szukaj w redakcji",
      },
      marketplace: {
        eyebrow: "Producenci i laboratoria",
        title: "Rynek",
        lead: "Zapotrzebowanie z Czech i UE, CE / IVDR / ISO. Reklama dla czytelników zostaje w magazynie na /firmy.",
        cta: "Otwórz rynek",
        secondary: "Reklama w magazynie",
      },
      students: {
        eyebrow: "Kandydaci na medycynę",
        title: "Studenci",
        lead: "MeDiprep — testy z biologii, chemii i fizyki na czeskie wydziały lekarskie.",
        cta: "Otwórz MeDiprep",
        secondary: "Mapa rekrutacji",
      },
      physicians: {
        eyebrow: "Gabinet",
        title: "Lekarze",
        lead: "OrdiZapis pisze notatkę z dyktanda w telefonie. Obok trzy wytyczne ESC z DOI.",
        cta: "Pobierz OrdiZapis",
        secondary: "Biurko lekarza",
      },
    },
  },
  ro: {
    title: "Patru uși. O platformă.",
    lead: "Revista ViaLongeVita, piața producătorilor și OrdiZapis pentru cabinet. Alegeți cine sunteți.",
    jumpLabel: "Orientare rapidă",
    pillars: {
      magazine: {
        eyebrow: "Cititori",
        lead: "Revistă de sănătate și longevitate. Somn, mișcare, nutriție, GLP-1 — redacție cu surse, nu clickbait.",
        cta: "Citește revista",
        secondary: "Caută în redacție",
      },
      marketplace: {
        eyebrow: "Producători și laboratoare",
        title: "Piață",
        lead: "Cerere din Cehia și UE, CE / IVDR / ISO. Publicitatea pentru cititori rămâne în revistă, pe /firmy.",
        cta: "Deschide piața",
        secondary: "Publicitate în revistă",
      },
      students: {
        eyebrow: "Candidați la medicină",
        title: "Studenți",
        lead: "MeDiprep — teste de biologie, chimie și fizică pentru facultățile cehe.",
        cta: "Deschide MeDiprep",
        secondary: "Harta admiterii",
      },
      physicians: {
        eyebrow: "Cabinet",
        title: "Medici",
        lead: "OrdiZapis scrie nota din dictare. Alături, trei ghiduri ESC cu DOI.",
        cta: "Descarcă OrdiZapis",
        secondary: "Biroul medicului",
      },
    },
  },
  hu: {
    title: "Négy bejárat. Egy platform.",
    lead: "A ViaLongeVita magazin, gyártói piactér és OrdiZapis a rendelőnek. Válassza ki, ki Ön.",
    jumpLabel: "Gyors tájékozódás",
    pillars: {
      magazine: {
        eyebrow: "Olvasók",
        lead: "Egészség- és hosszúélet-magazin. Alvás, mozgás, táplálkozás, GLP-1 — forrásolt szerkesztőség, nem clickbait.",
        cta: "Magazin olvasása",
        secondary: "Keresés a szerkesztőségben",
      },
      marketplace: {
        eyebrow: "Gyártók és laborok",
        title: "Piactér",
        lead: "Cseh és uniós kereslet, CE / IVDR / ISO. Az olvasói hirdetés a magazinban marad: /firmy.",
        cta: "Piactér megnyitása",
        secondary: "Hirdetés a magazinban",
      },
      students: {
        eyebrow: "Orvosi felvételizők",
        title: "Hallgatók",
        lead: "MeDiprep — biológia, kémia és fizika tesztek cseh orvosi karokra.",
        cta: "MeDiprep megnyitása",
        secondary: "Felvételi térkép",
      },
      physicians: {
        eyebrow: "Rendelő",
        title: "Orvosok",
        lead: "Az OrdiZapis diktálásból írja a bejegyzést. Mellé három ESC irányelv DOI-val.",
        cta: "OrdiZapis letöltése",
        secondary: "Orvosi asztal",
      },
    },
  },
  ru: {
    title: "Четыре входа. Одна платформа.",
    lead: "Журнал ViaLongeVita, рынок производителей и OrdiZapis для клиники. Выберите, кто вы.",
    jumpLabel: "Быстрая ориентация",
    pillars: {
      magazine: {
        eyebrow: "Читатели",
        lead: "Журнал о здоровье и долголетии. Сон, движение, питание, GLP-1 — редакция со ссылками, не кликбейт.",
        cta: "Читать журнал",
        secondary: "Искать в редакции",
      },
      marketplace: {
        eyebrow: "Производители и лаборатории",
        title: "Рынок",
        lead: "Спрос из Чехии и ЕС, CE / IVDR / ISO. Реклама для читателей — в журнале на /firmy.",
        cta: "Открыть рынок",
        secondary: "Реклама в журнале",
      },
      students: {
        eyebrow: "Абитуриенты-медики",
        title: "Студенты",
        lead: "MeDiprep — тесты по биологии, химии и физике для чешских мединститутов.",
        cta: "Открыть MeDiprep",
        secondary: "Карта поступления",
      },
      physicians: {
        eyebrow: "Клиника",
        title: "Врачи",
        lead: "OrdiZapis пишет запись с диктовки в телефоне. Рядом три рекомендации ESC с DOI.",
        cta: "Скачать OrdiZapis",
        secondary: "Кабинет врача",
      },
    },
  },
  uk: {
    title: "Чотири входи. Одна платформа.",
    lead: "Журнал ViaLongeVita, ринок виробників і OrdiZapis для клініки. Оберіть, хто ви.",
    jumpLabel: "Швидка орієнтація",
    pillars: {
      magazine: {
        eyebrow: "Читачі",
        lead: "Журнал про здоров’я та довголіття. Сон, рух, харчування, GLP-1 — редакція з джерелами, не клікбейт.",
        cta: "Читати журнал",
        secondary: "Шукати в редакції",
      },
      marketplace: {
        eyebrow: "Виробники та лабораторії",
        title: "Ринок",
        lead: "Попит з Чехії та ЄС, CE / IVDR / ISO. Реклама для читачів лишається в журналі на /firmy.",
        cta: "Відкрити ринок",
        secondary: "Реклама в журналі",
      },
      students: {
        eyebrow: "Абітурієнти-медики",
        title: "Студенти",
        lead: "MeDiprep — тести з біології, хімії та фізики для чеських медфакультетів.",
        cta: "Відкрити MeDiprep",
        secondary: "Мапа вступу",
      },
      physicians: {
        eyebrow: "Клініка",
        title: "Лікарі",
        lead: "OrdiZapis пише запис з диктування в телефоні. Поруч три настанови ESC з DOI.",
        cta: "Завантажити OrdiZapis",
        secondary: "Стіл лікаря",
      },
    },
  },
  be: {
    title: "Чатыры ўваходы. Адна платформа.",
    lead: "Часопіс ViaLongeVita, рынак вытворцаў і OrdiZapis для клінікі. Абярыце, хто вы.",
    jumpLabel: "Хуткая арыентацыя",
    pillars: {
      magazine: {
        eyebrow: "Чытачы",
        lead: "Часопіс пра здароўе і даўгалецце. Сон, рух, харчаванне, GLP-1 — рэдакцыя з крыніцамі.",
        cta: "Чытаць часопіс",
        secondary: "Шукаць у рэдакцыі",
      },
      marketplace: {
        eyebrow: "Вытворцы і лабараторыі",
        title: "Рынак",
        lead: "Попыт з Чэхіі і ЕС, CE / IVDR / ISO. Рэклама для чытачоў застаецца ў часопісе на /firmy.",
        cta: "Адкрыць рынак",
        secondary: "Рэклама ў часопісе",
      },
      students: {
        eyebrow: "Абітурыенты-медыкі",
        title: "Студэнты",
        lead: "MeDiprep — тэсты па біялогіі, хіміі і фізіцы для чэшскіх медыцынскіх факультэтаў.",
        cta: "Адкрыць MeDiprep",
        secondary: "Мапа паступлення",
      },
      physicians: {
        eyebrow: "Клініка",
        title: "Урачы",
        lead: "OrdiZapis піша запіс з дыктоўкі. Поруч тры рэкамендацыі ESC з DOI.",
        cta: "Спампаваць OrdiZapis",
        secondary: "Стол урача",
      },
    },
  },
  zh: {
    title: "四个入口。一个平台。",
    lead: "ViaLongeVita 杂志、制造商市场，以及诊所使用的 OrdiZapis。选择您的身份。",
    jumpLabel: "快速定位",
    pillars: {
      magazine: {
        eyebrow: "读者",
        lead: "健康与长寿杂志。睡眠、运动、营养、GLP-1 — 有出处的编辑稿，不是标题党。",
        cta: "阅读杂志",
        secondary: "检索编辑部",
      },
      marketplace: {
        eyebrow: "制造商与实验室",
        title: "市场",
        lead: "捷克与欧盟需求，CE / IVDR / ISO。面向读者的广告仍在杂志 /firmy。",
        cta: "打开市场",
        secondary: "杂志广告",
      },
      students: {
        eyebrow: "医学入学考生",
        title: "学生",
        lead: "MeDiprep — 面向捷克医学院的生物、化学、物理测试。",
        cta: "打开 MeDiprep",
        secondary: "招生地图",
      },
      physicians: {
        eyebrow: "诊所",
        title: "医生",
        lead: "OrdiZapis 根据手机口述起草病历。旁边是三份带 DOI 的 ESC 指南。",
        cta: "获取 OrdiZapis",
        secondary: "医生工作台",
      },
    },
  },
  ja: {
    title: "4つの入口。ひとつのプラットフォーム。",
    lead: "ViaLongeVita誌、製造者向けマーケット、診療所用 OrdiZapis。ご自身の立場を選んでください。",
    jumpLabel: "すばやく探す",
    pillars: {
      magazine: {
        eyebrow: "読者",
        lead: "健康と長寿の雑誌。睡眠、運動、栄養、GLP-1 — 出典付きの編集、クリックベイトではありません。",
        cta: "雑誌を読む",
        secondary: "編集部を検索",
      },
      marketplace: {
        eyebrow: "製造者とラボ",
        title: "マーケット",
        lead: "チェコとEUの需要、CE / IVDR / ISO。読者向け広告は雑誌の /firmy に残します。",
        cta: "マーケットを開く",
        secondary: "雑誌広告",
      },
      students: {
        eyebrow: "医学部志望",
        title: "学生",
        lead: "MeDiprep — チェコの医学部向け生物・化学・物理テスト。",
        cta: "MeDiprepを開く",
        secondary: "入試マップ",
      },
      physicians: {
        eyebrow: "診療所",
        title: "医師",
        lead: "OrdiZapis はスマホの口述から記録を作成。横に DOI 付き ESC ガイドライン3本。",
        cta: "OrdiZapisを入手",
        secondary: "医師デスク",
      },
    },
  },
  ko: {
    title: "네 개의 입구. 하나의 플랫폼.",
    lead: "ViaLongeVita 매거진, 제조사 마켓, 의원을 위한 OrdiZapis. 본인의 역할을 고르세요.",
    jumpLabel: "빠른 안내",
    pillars: {
      magazine: {
        eyebrow: "독자",
        lead: "건강과 장수 매거진. 수면, 운동, 영양, GLP-1 — 출처가 있는 편집, 클릭베이트 아님.",
        cta: "매거진 읽기",
        secondary: "편집부 검색",
      },
      marketplace: {
        eyebrow: "제조사와 랩",
        title: "마켓",
        lead: "체코·EU 수요, CE / IVDR / ISO. 독자 광고는 매거진 /firmy에 남습니다.",
        cta: "마켓 열기",
        secondary: "매거진 광고",
      },
      students: {
        eyebrow: "의대 지원자",
        title: "학생",
        lead: "MeDiprep — 체코 의대 생물·화학·물리 시험.",
        cta: "MeDiprep 열기",
        secondary: "입학 지도",
      },
      physicians: {
        eyebrow: "의원",
        title: "의사",
        lead: "OrdiZapis는 휴대폰 구술로 기록을 작성합니다. 옆에 DOI가 있는 ESC 가이드라인 3건.",
        cta: "OrdiZapis 받기",
        secondary: "의사 데스크",
      },
    },
  },
  vi: {
    title: "Bốn cửa. Một nền tảng.",
    lead: "Tạp chí ViaLongeVita, chợ nhà sản xuất và OrdiZapis cho phòng khám. Chọn bạn là ai.",
    jumpLabel: "Định hướng nhanh",
    pillars: {
      magazine: {
        eyebrow: "Bạn đọc",
        lead: "Tạp chí sức khỏe và trường thọ. Ngủ, vận động, dinh dưỡng, GLP-1 — tòa soạn có nguồn, không clickbait.",
        cta: "Đọc tạp chí",
        secondary: "Tìm trong tòa soạn",
      },
      marketplace: {
        eyebrow: "Nhà sản xuất và lab",
        title: "Chợ",
        lead: "Nhu cầu Czech và EU, CE / IVDR / ISO. Quảng cáo bạn đọc vẫn ở tạp chí /firmy.",
        cta: "Mở chợ",
        secondary: "Quảng cáo tạp chí",
      },
      students: {
        eyebrow: "Thí sinh y khoa",
        title: "Sinh viên",
        lead: "MeDiprep — bài kiểm tra sinh, hóa, lý cho các khoa y Czech.",
        cta: "Mở MeDiprep",
        secondary: "Bản đồ tuyển sinh",
      },
      physicians: {
        eyebrow: "Phòng khám",
        title: "Bác sĩ",
        lead: "OrdiZapis viết ghi chú từ đọc chính trên điện thoại. Bên cạnh là ba hướng dẫn ESC có DOI.",
        cta: "Tải OrdiZapis",
        secondary: "Bàn bác sĩ",
      },
    },
  },
  id: {
    title: "Empat pintu. Satu platform.",
    lead: "Majalah ViaLongeVita, pasar produsen, dan OrdiZapis untuk klinik. Pilih siapa Anda.",
    jumpLabel: "Orientasi cepat",
    pillars: {
      magazine: {
        eyebrow: "Pembaca",
        lead: "Majalah kesehatan dan umur panjang. Tidur, gerak, gizi, GLP-1 — redaksi bersumber, bukan clickbait.",
        cta: "Baca majalah",
        secondary: "Cari di redaksi",
      },
      marketplace: {
        eyebrow: "Produsen dan lab",
        title: "Pasar",
        lead: "Permintaan Ceko dan UE, CE / IVDR / ISO. Iklan pembaca tetap di majalah /firmy.",
        cta: "Buka pasar",
        secondary: "Iklan majalah",
      },
      students: {
        eyebrow: "Calon fakultas kedokteran",
        title: "Mahasiswa",
        lead: "MeDiprep — tes biologi, kimia, dan fisika untuk fakultas kedokteran Ceko.",
        cta: "Buka MeDiprep",
        secondary: "Peta masuk",
      },
      physicians: {
        eyebrow: "Klinik",
        title: "Dokter",
        lead: "OrdiZapis menulis catatan dari dikte di ponsel. Di sampingnya tiga pedoman ESC dengan DOI.",
        cta: "Dapatkan OrdiZapis",
        secondary: "Meja dokter",
      },
    },
  },
  pt: {
    title: "Quatro entradas. Uma plataforma.",
    lead: "A revista ViaLongeVita, o mercado de fabricantes e o OrdiZapis para o consultório. Escolha quem é.",
    jumpLabel: "Orientação rápida",
    pillars: {
      magazine: {
        eyebrow: "Leitores",
        lead: "Revista de saúde e longevidade. Sono, movimento, nutrição, GLP-1 — redação com fontes, sem clickbait.",
        cta: "Ler a revista",
        secondary: "Pesquisar na redação",
      },
      marketplace: {
        eyebrow: "Fabricantes e laboratórios",
        title: "Mercado",
        lead: "Procura da Chéquia e da UE, CE / IVDR / ISO. A publicidade para leitores fica na revista, em /firmy.",
        cta: "Abrir o mercado",
        secondary: "Publicidade na revista",
      },
      students: {
        eyebrow: "Candidatos às faculdades",
        title: "Estudantes",
        lead: "MeDiprep — testes de biologia, química e física para faculdades checas.",
        cta: "Abrir o MeDiprep",
        secondary: "Mapa de admissões",
      },
      physicians: {
        eyebrow: "Consultório",
        title: "Médicos",
        lead: "O OrdiZapis redige a nota a partir do ditado. Ao lado, três guidelines ESC com DOI.",
        cta: "Obter o OrdiZapis",
        secondary: "Mesa do médico",
      },
    },
  },
};

export function homepagePillarsEdition(primary: string): HomepagePillarsEdition | undefined {
  return EDITIONS[primary];
}
