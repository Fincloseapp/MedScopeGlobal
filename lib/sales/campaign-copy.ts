import { getLegalEntity } from "@/lib/config/legal-entity";
import { SITE } from "@/lib/config/site";
import { buildLocalePath } from "@/lib/i18n/locale-path";
import { marketplaceUiLang } from "@/lib/i18n/marketplace-ui-locale";
import {
  formatSalesCzk,
  salesEntryMonthlyCzk,
  salesYearlyCzk,
  salesYearlyEffectiveMonthCzk,
} from "@/lib/sales/packages";

function baseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(/\/$/, "");
  if (!raw || /localhost|127\.0\.0\.1/i.test(raw)) return "https://medscopeglobal.com";
  return raw;
}

export function campaignPublicUrl(locale: string, pathname: string): string {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === "cs") return `${baseUrl()}${clean}`;
  return `${baseUrl()}${buildLocalePath(locale, clean)}`;
}

export function campaignMarketplaceUrl(locale: string): string {
  return campaignPublicUrl(locale, "/exchange");
}

export function campaignPausalUrl(locale: string): string {
  return campaignPublicUrl(locale, "/inzerce/pausal");
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type Pack = {
  subject: (company: string) => string;
  greeting: (company: string) => string;
  intro: string;
  marketplace: string;
  price: string;
  cta: string;
  legal: string;
  unsub: string;
};

function priceLine(): string {
  const month = salesEntryMonthlyCzk();
  return `${formatSalesCzk(month)} / ${formatSalesCzk(salesYearlyCzk(month))} (${formatSalesCzk(salesYearlyEffectiveMonthCzk(month))}/mo)`;
}

const PACKS: Record<string, Pack> = {
  cs: {
    subject: (c) => `Tržiště MedScopeGlobal — paušál Start pro ${c}`,
    greeting: (c) => `Dobrý den, ${c},`,
    intro:
      "ozýváme se z obchodního oddělení MedScopeGlobal (Al Synaptica Research Institute s.r.o.). Tržiště je samostatná B2B část webu — ne magazín a ne oslovení čtenářů. Firmy tam vkládají nabídky a poptávky služeb.",
    marketplace: "Přímý vstup na tržiště:",
    price:
      "Základní měsíční paušál Start je 450 Kč. Roční předplatné má 2 měsíce zdarma (4 500 Kč / rok, 375 Kč / měs.). Nejsme plátci DPH. Provizi z obchodu nebereme.",
    cta: "Zřídit paušál a začít inzerovat:",
    legal:
      "Jde o obchodní sdělení právnické osobě v souvislosti s její profesní činností (zájem na B2B inzerci zdravotnických služeb). Inzerce je označená. Rx nepatří na veřejné plochy.",
    unsub: "Pokud si další nabídky nepřejete, odhlaste se jedním kliknutím:",
  },
  sk: {
    subject: (c) => `Trhovisko MedScopeGlobal — paušál Start pre ${c}`,
    greeting: (c) => `Dobrý deň, ${c},`,
    intro:
      "ozývame sa z obchodného oddelenia MedScopeGlobal. Trhovisko je samostatná B2B časť webu — nie magazín. Firmy tam vkladajú ponuky a dopyty služieb.",
    marketplace: "Priamy vstup na trhovisko:",
    price:
      "Základný mesačný paušál Start je 450 Kč. Ročné predplatné má 2 mesiace zadarmo (4 500 Kč / rok). Nie sme platcami DPH.",
    cta: "Zriadiť paušál a začať inzerovať:",
    legal:
      "Ide o obchodné oznámenie právnickej osobe v súvislosti s jej profesijnou činnosťou. Inzerciu označujeme. Rx nepatrí na verejné plochy.",
    unsub: "Ďalšie ponuky môžete odhlásiť jedným kliknutím:",
  },
  pl: {
    subject: (c) => `Rynek MedScopeGlobal — abonament Start dla ${c}`,
    greeting: (c) => `Dzień dobry, ${c},`,
    intro:
      "piszemy z działu sprzedaży MedScopeGlobal. Rynek B2B to osobna część serwisu — nie magazyn. Firmy publikują tam oferty i zapytania o usługi.",
    marketplace: "Bezpośredni link do rynku:",
    price:
      "Podstawowy abonament Start: 450 Kč miesięcznie. Roczna płatność = 2 miesiące gratis (4500 Kč / rok). Nie jesteśmy płatnikami VAT w CZ.",
    cta: "Uruchomić abonament i zacząć publikować:",
    legal:
      "To komunikat handlowy do osoby prawnej w związku z jej działalnością. Reklama jest oznaczona. Rx nie trafia na strony publiczne.",
    unsub: "Rezygnacja z kolejnych ofert jednym kliknięciem:",
  },
  de: {
    subject: (c) => `MedScopeGlobal Marktplatz — Start-Pauschale für ${c}`,
    greeting: (c) => `Guten Tag, ${c},`,
    intro:
      "wir schreiben vom Vertrieb von MedScopeGlobal. Der Marktplatz ist ein eigener B2B-Bereich — kein Magazin. Unternehmen stellen dort Angebote und Gesuche ein.",
    marketplace: "Direkter Link zum Marktplatz:",
    price:
      "Die monatliche Start-Pauschale beträgt 450 Kč. Jahresabo mit 2 Monaten gratis (4 500 Kč / Jahr). Wir sind in CZ nicht umsatzsteuerpflichtig.",
    cta: "Pauschale einrichten und inserieren:",
    legal:
      "Dies ist eine geschäftliche Mitteilung an eine juristische Person im Zusammenhang mit ihrer beruflichen Tätigkeit. Werbung ist gekennzeichnet. Rx gehört nicht auf öffentliche Flächen.",
    unsub: "Weitere Angebote mit einem Klick abbestellen:",
  },
  fr: {
    subject: (c) => `Place de marché MedScopeGlobal — forfait Start pour ${c}`,
    greeting: (c) => `Bonjour, ${c},`,
    intro:
      "nous vous contactons depuis le service commercial de MedScopeGlobal. La place de marché est un espace B2B distinct — ce n’est pas le magazine. Les entreprises y publient offres et demandes.",
    marketplace: "Lien direct vers la place de marché :",
    price:
      "Le forfait mensuel Start est de 450 Kč. L’abonnement annuel offre 2 mois gratuits (4 500 Kč / an). Non assujettis à la TVA en Tchéquie.",
    cta: "Ouvrir le forfait et publier :",
    legal:
      "Message commercial adressé à une personne morale dans le cadre de son activité professionnelle. La publicité est identifiée. Les Rx ne vont pas sur les espaces grand public.",
    unsub: "Désinscription en un clic :",
  },
  it: {
    subject: (c) => `Marketplace MedScopeGlobal — pacchetto Start per ${c}`,
    greeting: (c) => `Buongiorno, ${c},`,
    intro:
      "scriviamo dal commerciale di MedScopeGlobal. Il marketplace è una sezione B2B autonoma — non è il magazine. Le aziende pubblicano offerte e richieste di servizi.",
    marketplace: "Link diretto al marketplace:",
    price:
      "Il pacchetto mensile Start è 450 Kč. L’abbonamento annuale include 2 mesi gratis (4 500 Kč / anno). Non siamo soggetti IVA in Cechia.",
    cta: "Attivare il pacchetto e pubblicare:",
    legal:
      "Comunicazione commerciale a persona giuridica in relazione all’attività professionale. La pubblicità è contrassegnata. I farmaci Rx non vanno sulle superfici pubbliche.",
    unsub: "Disiscrizione con un clic:",
  },
  es: {
    subject: (c) => `Mercado MedScopeGlobal — plan Start para ${c}`,
    greeting: (c) => `Buenos días, ${c},`,
    intro:
      "escribimos desde el equipo comercial de MedScopeGlobal. El mercado es un espacio B2B independiente — no es la revista. Las empresas publican ofertas y demandas de servicios.",
    marketplace: "Enlace directo al mercado:",
    price:
      "El plan mensual Start cuesta 450 Kč. El pago anual incluye 2 meses gratis (4 500 Kč / año). No somos sujetos de IVA en Chequia.",
    cta: "Contratar el plan y publicar:",
    legal:
      "Comunicación comercial a persona jurídica en el marco de su actividad profesional. La publicidad está identificada. Los Rx no van a espacios públicos.",
    unsub: "Baja con un clic:",
  },
  pt: {
    subject: (c) => `Mercado MedScopeGlobal — plano Start para ${c}`,
    greeting: (c) => `Exmos. Senhores, ${c},`,
    intro:
      "escrevemos da equipa comercial da MedScopeGlobal. O mercado é uma área B2B independente — não é a revista. As empresas publicam ofertas e pedidos de serviços.",
    marketplace: "Ligação direta para o mercado:",
    price:
      "O plano mensal Start custa 450 Kč. A anuidade inclui 2 meses grátis (4 500 Kč / ano). Não somos sujeitos passivos de IVA na Chéquia.",
    cta: "Ativar o plano e publicar:",
    legal:
      "Comunicação comercial a pessoa coletiva no âmbito da atividade profissional. A publicidade está identificada.",
    unsub: "Cancelar com um clique:",
  },
  "pt-BR": {
    subject: (c) => `Marketplace MedScopeGlobal — plano Start para ${c}`,
    greeting: (c) => `Prezados, ${c},`,
    intro:
      "escrevemos da equipe comercial da MedScopeGlobal. O marketplace é um espaço B2B separado — não é a revista. Empresas publicam ofertas e demandas de serviços.",
    marketplace: "Link direto para o marketplace:",
    price:
      "O plano mensal Start custa 450 Kč. O anual inclui 2 meses grátis (4 500 Kč / ano).",
    cta: "Contratar o plano e publicar:",
    legal:
      "Comunicado comercial a pessoa jurídica no exercício da atividade. A publicidade é identificada.",
    unsub: "Descadastro em um clique:",
  },
  ro: {
    subject: (c) => `Piața MedScopeGlobal — abonament Start pentru ${c}`,
    greeting: (c) => `Bună ziua, ${c},`,
    intro:
      "scriem din departamentul comercial MedScopeGlobal. Piața B2B este o secțiune separată — nu revista. Companiile publică oferte și cereri de servicii.",
    marketplace: "Link direct către piață:",
    price:
      "Abonamentul lunar Start este 450 Kč. Plata anuală include 2 luni gratuite (4 500 Kč / an).",
    cta: "Activați abonamentul și publicați:",
    legal:
      "Comunicare comercială către persoană juridică în legătură cu activitatea profesională. Publicitatea este marcată.",
    unsub: "Dezabonare dintr-un clic:",
  },
  hu: {
    subject: (c) => `MedScopeGlobal piactér — Start csomag ${c} részére`,
    greeting: (c) => `Tisztelt ${c},`,
    intro:
      "a MedScopeGlobal kereskedelmi csapatától írunk. A piactér önálló B2B felület — nem a magazin. A cégek szolgáltatáskínálatot és keresletet tesznek közzé.",
    marketplace: "Közvetlen link a piactérre:",
    price:
      "A havi Start csomag 450 Kč. Az éves előfizetés 2 hónap ingyenes (4 500 Kč / év).",
    cta: "Csomag indítása és hirdetés:",
    legal:
      "Jogi személynek szóló üzleti megkeresés a szakmai tevékenységgel összefüggésben. A hirdetés jelölt.",
    unsub: "Leiratkozás egy kattintással:",
  },
  ru: {
    subject: (c) => `Площадка MedScopeGlobal — тариф Start для ${c}`,
    greeting: (c) => `Здравствуйте, ${c},`,
    intro:
      "пишем из коммерческого отдела MedScopeGlobal. Площадка — отдельный B2B-раздел, не журнал. Компании размещают предложения и запросы услуг.",
    marketplace: "Прямая ссылка на площадку:",
    price:
      "Базовый ежемесячный тариф Start — 450 Kč. Годовая оплата: 2 месяца бесплатно (4 500 Kč / год).",
    cta: "Подключить тариф и разместить объявление:",
    legal:
      "Коммерческое сообщение юридическому лицу в связи с профессиональной деятельностью. Реклама маркируется.",
    unsub: "Отписаться одним нажатием:",
  },
  uk: {
    subject: (c) => `Майданчик MedScopeGlobal — тариф Start для ${c}`,
    greeting: (c) => `Вітаємо, ${c},`,
    intro:
      "пишемо з комерційного відділу MedScopeGlobal. Майданчик — окремий B2B-розділ, не журнал. Компанії розміщують пропозиції та запити послуг.",
    marketplace: "Пряме посилання на майданчик:",
    price:
      "Базовий місячний тариф Start — 450 Kč. Річна оплата: 2 місяці безкоштовно (4 500 Kč / рік).",
    cta: "Підключити тариф і розмістити оголошення:",
    legal:
      "Комерційне повідомлення юридичній особі у зв’язку з професійною діяльністю. Реклама маркується.",
    unsub: "Відписатися одним кліком:",
  },
  be: {
    subject: (c) => `Пляцоўка MedScopeGlobal — тарыф Start для ${c}`,
    greeting: (c) => `Добры дзень, ${c},`,
    intro:
      "пішам з камерцыйнага аддзела MedScopeGlobal. Пляцоўка — асобны B2B-раздзел, не часопіс. Кампаніі размяшчаюць прапановы і запыты паслуг.",
    marketplace: "Прамая спасылка на пляцоўку:",
    price:
      "Базавы месячны тарыф Start — 450 Kč. Гадавая аплата: 2 месяцы бясплатна (4 500 Kč / год).",
    cta: "Падключыць тарыф і размясціць аб’яву:",
    legal:
      "Камерцыйнае паведамленне юрыдычнай асобе ў сувязі з прафесійнай дзейнасцю. Рэклама маркіруецца.",
    unsub: "Адпісацца адным націскам:",
  },
  "zh-CN": {
    subject: (c) => `MedScopeGlobal 企业市场 — Start 套餐（${c}）`,
    greeting: (c) => `${c} 您好，`,
    intro:
      "我们是 MedScopeGlobal 商务团队。市场是独立的企业对企业板块，不是杂志。企业在此发布服务供应与采购需求。",
    marketplace: "市场直达链接：",
    price: "Start 月费 450 捷克克朗；年付赠两个月（4 500 克朗/年）。",
    cta: "开通套餐并发布：",
    legal: "本函为企业对公商务联络。广告将明确标识。处方药不进入大众版面。",
    unsub: "一键退订：",
  },
  ja: {
    subject: (c) => `MedScopeGlobal マーケット — Startプラン（${c}）`,
    greeting: (c) => `${c} ご担当者様`,
    intro:
      "MedScopeGlobal 営業部です。マーケットは雑誌とは別の B2B エリアです。企業はサービス提案・調達ニーズを掲載します。",
    marketplace: "マーケットへの直リンク：",
    price: "Start 月額 450 チェココルナ。年払いは 2 か月無料（4,500 コルナ/年）。",
    cta: "プラン開設と掲載：",
    legal: "法人の業務に関する営業案内です。広告は明示します。",
    unsub: "配信停止はこちら：",
  },
  ko: {
    subject: (c) => `MedScopeGlobal 마켓플레이스 — Start 요금제 (${c})`,
    greeting: (c) => `${c} 담당자님께`,
    intro:
      "MedScopeGlobal 영업팀입니다. 마켓은 매거진과 분리된 B2B 공간입니다. 기업이 서비스 공급·수요를 게시합니다.",
    marketplace: "마켓 바로가기:",
    price: "Start 월 450 CZK, 연 결제는 2개월 무료(연 4,500 CZK).",
    cta: "요금제 개설 및 게시:",
    legal: "법인 업무 관련 영업 안내입니다. 광고는 표시됩니다.",
    unsub: "수신 거부:",
  },
  vi: {
    subject: (c) => `Sàn MedScopeGlobal — gói Start cho ${c}`,
    greeting: (c) => `Kính gửi ${c},`,
    intro:
      "Chúng tôi là bộ phận kinh doanh MedScopeGlobal. Sàn là khu B2B riêng — không phải tạp chí. Doanh nghiệp đăng cung và cầu dịch vụ.",
    marketplace: "Liên kết trực tiếp tới sàn:",
    price: "Gói Start 450 Kč/tháng. Thanh toán năm được tặng 2 tháng (4 500 Kč/năm).",
    cta: "Mở gói và đăng tin:",
    legal: "Thư thương mại gửi pháp nhân liên quan hoạt động nghề nghiệp. Quảng cáo được đánh dấu.",
    unsub: "Hủy nhận thư bằng một cú nhấp:",
  },
  id: {
    subject: (c) => `Pasar MedScopeGlobal — paket Start untuk ${c}`,
    greeting: (c) => `Yth. ${c},`,
    intro:
      "Kami dari tim penjualan MedScopeGlobal. Pasar adalah area B2B terpisah — bukan majalah. Perusahaan memasang penawaran dan permintaan layanan.",
    marketplace: "Tautan langsung ke pasar:",
    price: "Paket bulanan Start 450 Kč. Tahunan termasuk 2 bulan gratis (4 500 Kč/tahun).",
    cta: "Aktifkan paket dan tayangkan:",
    legal: "Pesan komersial kepada badan hukum terkait kegiatan profesional. Iklan ditandai.",
    unsub: "Berhenti berlangganan satu klik:",
  },
  en: {
    subject: (c) => `MedScopeGlobal marketplace — Start retainer for ${c}`,
    greeting: (c) => `Dear ${c},`,
    intro:
      "We are writing from MedScopeGlobal sales. The marketplace is a separate B2B area — not the magazine. Companies post service offers and requests there.",
    marketplace: "Direct marketplace link:",
    price:
      "The Start monthly retainer is 450 CZK. Annual billing includes two months free (4,500 CZK / year, 375 CZK / month). We are not VAT-registered in Czechia.",
    cta: "Set up the retainer and publish:",
    legal:
      "This is a business message to a legal entity in connection with its professional activity. Advertising is labelled. Rx does not run on public surfaces.",
    unsub: "Unsubscribe from further offers in one click:",
  },
};

function packFor(locale: string): Pack {
  const lang = marketplaceUiLang(locale);
  return PACKS[lang] ?? PACKS.en!;
}

export function campaignMarketplaceEmail(input: {
  company: string;
  locale: string;
  unsubscribeUrl: string;
}) {
  const entity = getLegalEntity();
  const pack = packFor(input.locale);
  const market = campaignMarketplaceUrl(input.locale);
  const pausal = campaignPausalUrl(input.locale);
  const subject = pack.subject(input.company);
  const html = `
    <p>${esc(pack.greeting(input.company))}</p>
    <p>${esc(pack.intro)}</p>
    <p>${esc(pack.marketplace)} <a href="${market}">${market}</a></p>
    <p>${esc(pack.price)}</p>
    <p>${esc(pack.cta)} <a href="${pausal}">${pausal}</a></p>
    <p>${esc(pack.legal)}</p>
    <p style="font-size:12px;color:#64748b">${esc(pack.unsub)} <a href="${input.unsubscribeUrl}">${input.unsubscribeUrl}</a></p>
    <p>${esc(entity.name)} · IČO ${esc(entity.ico ?? "")}<br>${esc(entity.supportEmail)}${
      entity.supportPhone ? `<br>${esc(entity.supportPhone)}` : ""
    }</p>
  `;
  const text = [
    pack.greeting(input.company),
    pack.intro,
    `${pack.marketplace} ${market}`,
    pack.price,
    `${pack.cta} ${pausal}`,
    pack.legal,
    `${pack.unsub} ${input.unsubscribeUrl}`,
    `${entity.name} · ${entity.supportEmail}`,
  ].join("\n\n");
  return { subject, html, text, marketplaceUrl: market, pausalUrl: pausal, priceLine: priceLine() };
}
