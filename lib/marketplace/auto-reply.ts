import { formatSalesCzk, salesPriceListPlain, salesFromPriceLabel, salesYearlyEffectiveMonthCzk, salesEntryMonthlyCzk } from "@/lib/sales/packages";

export type MarketplaceReplyTopic =
  | "price"
  | "publish"
  | "demand"
  | "legal"
  | "invoice"
  | "timing"
  | "general";

const RULES: { topic: MarketplaceReplyTopic; re: RegExp }[] = [
  { topic: "price", re: /cen[aíy]|paušál|pausal|tarif|kolik|price|cost|kč|kc\b|měsíc/i },
  { topic: "publish", re: /zveřejn|nabídk|nabidk|inzerovat|umístit|umistit|katalog|tržišt|trzist/i },
  { topic: "demand", re: /poptáv|poptav|kontakt|nemocnic|laboratoř|laborator|kupujíc/i },
  { topic: "legal", re: /podmínk|podmink|gdpr|reklam|zákon|zakon|rx|sukl/i },
  { topic: "invoice", re: /faktura|dph|ico|i[čc]o|platba|stripe|převod|prevod/i },
  { topic: "timing", re: /jak dlouho|kdy|termín|termin|sla|hodin/i },
];

export function classifyMarketplaceMessage(text: string): MarketplaceReplyTopic {
  const hay = text.trim();
  if (!hay) return "general";
  for (const rule of RULES) {
    if (rule.re.test(hay)) return rule.topic;
  }
  return "general";
}

export function classifyMarketplaceKind(text: string): "offer" | "demand" | "question" {
  const hay = text.toLowerCase();
  if (/poptáv|poptav|hledám|hledame|hledáme|potřebujem|potrebujem/.test(hay)) return "demand";
  if (/nabídk|nabidk|inzerov|chci inzer|katalog|umístit nabíd|umistit nabid/.test(hay)) return "offer";
  return "question";
}

export function marketplaceReplyCopy(topic: MarketplaceReplyTopic): { subject: string; html: string; text: string } {
  const bodies: Record<MarketplaceReplyTopic, { subject: string; lead: string }> = {
    price: {
      subject: "Ceník inzerce na tržišti MedScopeGlobal",
      lead: salesPriceListPlain(),
    },
    publish: {
      subject: "Jak zveřejnit nabídku na tržišti MedScopeGlobal",
      lead:
        "Nabídku zadáte formulářem na /exchange nebo e-mailem na inzerce@medscopeglobal.com. Na tržišti se objeví hned. Kontakty kupujícím předáme, jakmile je paušál aktivní. Návod: /exchange/navod",
    },
    demand: {
      subject: "Poptávky na tržišti MedScopeGlobal",
      lead:
        "Poptávky z nemocnic a laboratoří jsou na /exchange vidět hned (bez e-mailu). Celý kontakt dostane platící inzerent e-mailem podle tarifu, nebo v portálu inzerenta. Žádná provize z uzavřeného obchodu.",
    },
    legal: {
      subject: "Podmínky inzerce MedScopeGlobal",
      lead:
        "Každá plocha je označená jako inzerce (zákon o reklamě). Lékařská zóna zůstává bez reklam. Rx jen na odbornou plochu. Podmínky: /inzerce/podminky",
    },
    invoice: {
      subject: "Faktura a platba paušálu MedScopeGlobal",
      lead:
        "Po objednávce na /inzerce/pausal vystavíme fakturu (číslo MSG-SAL-…) s variabilním symbolem, nebo Stripe kartou. Nejsme plátci DPH. Stav faktur je v portálu inzerenta.",
    },
    timing: {
      subject: "Lhůty inzerce MedScopeGlobal",
      lead:
        "Formulář i e-mail dostanou automatickou odpověď ihned. Poptávky předáváme podle tarifu: Start 72 h, Viditelnost 48 h, Magazín 24 h, Klinický 12 h, Partner 8 h.",
    },
    general: {
      subject: "Tržiště MedScopeGlobal — nabídky, poptávky a paušál",
      lead:
        `Tržiště spojuje nabídky výrobců s poptávkami nemocnic a laboratoří. Inzerent vidí poptávky a dostane kontakty e-mailem. Kupující vidí nabídky hned. Paušál ${salesFromPriceLabel()} / měsíc, roční ${formatSalesCzk(salesYearlyEffectiveMonthCzk(salesEntryMonthlyCzk()))} / měs. (2 měsíce zdarma), bez provize z obchodu.`,
    },
  };
  const item = bodies[topic];
  const links = `
    <ul>
      <li><a href="https://medscopeglobal.com/exchange">Tržiště — nabídky a poptávky</a></li>
      <li><a href="https://medscopeglobal.com/exchange/navod">Krátký návod pro inzerenty</a></li>
      <li><a href="https://medscopeglobal.com/inzerce/pausal">Objednat paušál</a></li>
      <li><a href="https://medscopeglobal.com/inzerce/formular">Jednorázová kampaň</a></li>
    </ul>
    <p>Můžete odpovědět na tento e-mail — odpovíme automaticky, a pokud to nestačí, obchodní oddělení naváže.</p>
  `;
  const html = `<p>Dobrý den,</p><p>${item.lead}</p>${links}<p>MedScopeGlobal · obchodní oddělení<br>inzerce@medscopeglobal.com</p>`;
  const text = `${item.lead}\n\nhttps://medscopeglobal.com/exchange\nhttps://medscopeglobal.com/exchange/navod\nhttps://medscopeglobal.com/inzerce/pausal`;
  return { subject: item.subject, html, text };
}
