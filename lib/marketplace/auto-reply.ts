import { campaignPublicUrl } from "@/lib/sales/campaign-copy";
import { formatSalesCzk, salesPriceListPlain, salesFromPriceLabel, salesYearlyEffectiveMonthCzk, salesEntryMonthlyCzk } from "@/lib/sales/packages";
import { marketplaceUiLang, type MarketplaceUiLang } from "@/lib/i18n/marketplace-ui-locale";

export type MarketplaceReplyTopic =
  | "price"
  | "publish"
  | "demand"
  | "legal"
  | "invoice"
  | "timing"
  | "general";

const RULES: { topic: MarketplaceReplyTopic; re: RegExp }[] = [
  { topic: "price", re: /cen[aíy]|paušál|pausal|tarif|kolik|price|cost|kč|kc\b|měsíc|retainer|monthly fee|how much|abonnement|forfait|pauschale/i },
  { topic: "publish", re: /zveřejn|nabídk|nabidk|inzerovat|umístit|umistit|katalog|tržišt|trzist|publish|list(ing)?|advertise|marketplace|catalogue|catalog|inserir|inserisci|publicar oferta/i },
  { topic: "demand", re: /poptáv|poptav|kontakt|nemocnic|laboratoř|laborator|kupujíc|looking for|seeking|rfp|hospital|laboratory|buyer|we need|request for|gesuch|demande d.achat/i },
  { topic: "legal", re: /podmínk|podmink|gdpr|reklam|zákon|zakon|rx|sukl|advertising law|terms|compliance|bedingungen|conditions/i },
  { topic: "invoice", re: /faktura|dph|ico|i[čc]o|platba|stripe|převod|prevod|invoice|vat|payment|transfer|iban|rechnung|facture/i },
  { topic: "timing", re: /jak dlouho|kdy|termín|termin|sla|hodin|how long|when|hours|deadline|wie lange|combien de temps/i },
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
  if (
    /poptáv|poptav|hledám|hledame|hledáme|potřebujem|potrebujem|looking for|we need|seeking|request for|\brfp\b|gesuch|dopyt/.test(
      hay
    )
  ) {
    return "demand";
  }
  if (
    /nabídk|nabidk|inzerov|chci inzer|katalog|umístit nabíd|umistit nabid|publish offer|want to advertise|list our|inserir oferta|publicar oferta/.test(
      hay
    )
  ) {
    return "offer";
  }
  return "question";
}

type ReplyPack = {
  hello: string;
  signoff: string;
  market: string;
  guide: string;
  pausal: string;
  campaign: string;
  replyNote: string;
  price: { subject: string; lead: string };
  publish: { subject: string; lead: string };
  demand: { subject: string; lead: string };
  legal: { subject: string; lead: string };
  invoice: { subject: string; lead: string };
  timing: { subject: string; lead: string };
  general: { subject: string; lead: string };
};

const CS: ReplyPack = {
  hello: "Dobrý den,",
  signoff: "MedScopeGlobal · obchodní oddělení<br>inzerce@medscopeglobal.com",
  market: "Tržiště — nabídky a poptávky",
  guide: "Krátký návod pro inzerenty",
  pausal: "Objednat paušál",
  campaign: "Jednorázová kampaň",
  replyNote: "Můžete odpovědět na tento e-mail — odpovíme automaticky, a pokud to nestačí, obchodní oddělení naváže.",
  price: { subject: "Ceník inzerce na tržišti MedScopeGlobal", lead: salesPriceListPlain() },
  publish: {
    subject: "Jak zveřejnit nabídku na tržišti MedScopeGlobal",
    lead: "Nabídku zadáte formulářem na tržišti nebo e-mailem na inzerce@medscopeglobal.com. Na desce se objeví hned. Kontakty kupujícím předáme, jakmile je paušál aktivní.",
  },
  demand: {
    subject: "Poptávky na tržišti MedScopeGlobal",
    lead: "Poptávky z nemocnic a laboratoří jsou na tržišti vidět hned (bez e-mailu). Celý kontakt dostane platící inzerent e-mailem podle tarifu. Žádná provize z uzavřeného obchodu.",
  },
  legal: {
    subject: "Podmínky inzerce MedScopeGlobal",
    lead: "Každá plocha je označená jako inzerce (zákon o reklamě). Lékařská zóna zůstává bez reklam. Rx jen na odbornou plochu.",
  },
  invoice: {
    subject: "Faktura a platba paušálu MedScopeGlobal",
    lead: "Po objednávce paušálu vystavíme fakturu (číslo MSG-SAL-…) s variabilním symbolem, nebo Stripe kartou. Nejsme plátci DPH.",
  },
  timing: {
    subject: "Lhůty inzerce MedScopeGlobal",
    lead: "Formulář i e-mail dostanou automatickou odpověď ihned. Poptávky předáváme podle tarifu: Start 72 h, Viditelnost 48 h, Magazín 24 h, Klinický 12 h, Partner 8 h.",
  },
  general: {
    subject: "Tržiště MedScopeGlobal — nabídky, poptávky a paušál",
    lead: `Tržiště spojuje nabídky výrobců s poptávkami nemocnic a laboratoří. Inzerent vidí poptávky a dostane kontakty e-mailem. Kupující vidí nabídky hned. Paušál ${salesFromPriceLabel()} / měsíc, roční ${formatSalesCzk(salesYearlyEffectiveMonthCzk(salesEntryMonthlyCzk()))} / měs. (2 měsíce zdarma), bez provize z obchodu.`,
  },
};

const EN: ReplyPack = {
  hello: "Hello,",
  signoff: "MedScopeGlobal · sales<br>inzerce@medscopeglobal.com",
  market: "Marketplace — offers and demand",
  guide: "Short advertiser guide",
  pausal: "Order the retainer",
  campaign: "One-off campaign",
  replyNote: "You can reply to this email — we answer automatically, and sales follows up if needed.",
  price: { subject: "MedScopeGlobal marketplace price list", lead: salesPriceListPlain() },
  publish: {
    subject: "How to publish an offer on MedScopeGlobal",
    lead: "Post via the marketplace form or email inzerce@medscopeglobal.com. The offer appears at once. We forward buyer contacts once the retainer is active.",
  },
  demand: {
    subject: "Demand on the MedScopeGlobal marketplace",
    lead: "Hospital and lab demand is visible immediately (no email on the board). Paying advertisers receive the full contact by email under the plan SLA. No trade commission.",
  },
  legal: {
    subject: "MedScopeGlobal advertising terms",
    lead: "Every surface is labelled as advertising. The physician zone stays ad-free. Rx runs only on professional surfaces.",
  },
  invoice: {
    subject: "MedScopeGlobal retainer invoice",
    lead: "After ordering the retainer we issue an invoice (MSG-SAL-…) with a variable symbol, or you pay by Stripe card. We are not VAT-registered in Czechia.",
  },
  timing: {
    subject: "MedScopeGlobal advertising timelines",
    lead: "Forms and email receive an automatic reply immediately. Demand is forwarded under the plan SLA: Start 72 h, Visibility 48 h, Magazine 24 h, Clinical 12 h, Partner 8 h.",
  },
  general: {
    subject: "MedScopeGlobal marketplace — offers, demand and retainer",
    lead: `The marketplace matches manufacturer offers with hospital and lab demand. Advertisers see demand and receive contacts by email. Buyers see offers immediately. Retainer from ${salesFromPriceLabel()} / month, yearly ${formatSalesCzk(salesYearlyEffectiveMonthCzk(salesEntryMonthlyCzk()))} / month (two months free), no trade commission.`,
  },
};

const SK: ReplyPack = {
  ...CS,
  hello: "Dobrý deň,",
  market: "Trhovisko — ponuky a dopyty",
  guide: "Krátky návod pre inzerentov",
  pausal: "Objednať paušál",
  campaign: "Jednorazová kampaň",
  replyNote: "Môžete odpovedať na tento e-mail — odpovieme automaticky.",
  price: { subject: "Cenník inzercie na trhovisku MedScopeGlobal", lead: salesPriceListPlain() },
  publish: {
    subject: "Ako zverejniť ponuku na trhovisku MedScopeGlobal",
    lead: "Ponuku zadáte formulárom na trhovisku alebo e-mailom na inzerce@medscopeglobal.com. Na doske je hneď. Kontakty predáme po aktivácii paušálu.",
  },
  demand: {
    subject: "Dopyty na trhovisku MedScopeGlobal",
    lead: "Dopyty nemocníc a laboratórií sú viditeľné hneď (bez e-mailu). Celý kontakt dostane platiaci inzerent e-mailom. Bez provízie z obchodu.",
  },
  legal: {
    subject: "Podmienky inzercie MedScopeGlobal",
    lead: "Každá plocha je označená ako inzercia. Lekárska zóna ostáva bez reklám. Rx len na odbornú plochu.",
  },
  invoice: {
    subject: "Faktúra a platba paušálu MedScopeGlobal",
    lead: "Po objednávke paušálu vystavíme faktúru (MSG-SAL-…) alebo Stripe kartou. Nie sme platcami DPH.",
  },
  timing: {
    subject: "Lehoty inzercie MedScopeGlobal",
    lead: "Formulár aj e-mail dostanú automatickú odpoveď hneď. Dopyty predávame podľa tarifu: Start 72 h až Partner 8 h.",
  },
  general: {
    subject: "Trhovisko MedScopeGlobal — ponuky, dopyty a paušál",
    lead: CS.general.lead.replace("Tržiště", "Trhovisko"),
  },
};

const DE: ReplyPack = {
  ...EN,
  hello: "Guten Tag,",
  market: "Marktplatz — Angebote und Gesuche",
  guide: "Kurzanleitung für Inserenten",
  pausal: "Pauschale bestellen",
  campaign: "Einmalige Kampagne",
  replyNote: "Sie können auf diese E-Mail antworten — wir antworten automatisch.",
  price: { subject: "Preisliste Marktplatz MedScopeGlobal", lead: salesPriceListPlain() },
  publish: {
    subject: "Angebot auf MedScopeGlobal veröffentlichen",
    lead: "Formular auf dem Marktplatz oder E-Mail an inzerce@medscopeglobal.com. Das Angebot erscheint sofort. Kontakte nach aktiver Pauschale.",
  },
  demand: {
    subject: "Gesuche auf dem MedScopeGlobal-Marktplatz",
    lead: "Krankenhaus- und Laborgesuche sind sofort sichtbar (ohne E-Mail). Zahlende Inserenten erhalten den Kontakt per E-Mail. Keine Handelsprovision.",
  },
  legal: {
    subject: "Werbebedingungen MedScopeGlobal",
    lead: "Jede Fläche ist als Werbung gekennzeichnet. Die Arztzone bleibt werbefrei. Rx nur auf Fachflächen.",
  },
  invoice: {
    subject: "Rechnung der MedScopeGlobal-Pauschale",
    lead: "Nach Bestellung stellen wir eine Rechnung (MSG-SAL-…) aus oder Sie zahlen per Stripe. In Tschechien nicht umsatzsteuerpflichtig.",
  },
  timing: {
    subject: "Fristen der MedScopeGlobal-Inserate",
    lead: "Formular und E-Mail erhalten sofort eine automatische Antwort. Gesuche nach Tarif-SLA: Start 72 h bis Partner 8 h.",
  },
  general: {
    subject: "MedScopeGlobal Marktplatz — Angebote, Gesuche, Pauschale",
    lead: EN.general.lead,
  },
};

const FR: ReplyPack = {
  ...EN,
  hello: "Bonjour,",
  market: "Place de marché — offres et demandes",
  guide: "Guide court pour annonceurs",
  pausal: "Commander le forfait",
  campaign: "Campagne ponctuelle",
  replyNote: "Vous pouvez répondre à cet e-mail — réponse automatique, puis le commercial si besoin.",
  price: { subject: "Tarifs place de marché MedScopeGlobal", lead: salesPriceListPlain() },
  publish: {
    subject: "Publier une offre sur MedScopeGlobal",
    lead: "Formulaire de la place de marché ou e-mail inzerce@medscopeglobal.com. L’offre apparaît tout de suite. Contacts après forfait actif.",
  },
  demand: {
    subject: "Demandes sur la place de marché MedScopeGlobal",
    lead: "Les demandes d’hôpitaux et laboratoires sont visibles tout de suite (sans e-mail). L’annonceur payant reçoit le contact. Pas de commission sur l’affaire.",
  },
  legal: {
    subject: "Conditions publicitaires MedScopeGlobal",
    lead: "Chaque surface est identifiée comme publicité. La zone médecins reste sans pubs. Rx uniquement sur surfaces professionnelles.",
  },
  invoice: {
    subject: "Facture du forfait MedScopeGlobal",
    lead: "Après commande nous émettons une facture (MSG-SAL-…) ou paiement Stripe. Non assujettis à la TVA en Tchéquie.",
  },
  timing: {
    subject: "Délais publicitaires MedScopeGlobal",
    lead: "Formulaire et e-mail reçoivent une réponse automatique immédiate. Demandes selon SLA : Start 72 h à Partner 8 h.",
  },
  general: { subject: "Place de marché MedScopeGlobal — offres, demandes, forfait", lead: EN.general.lead },
};

const IT: ReplyPack = {
  ...EN,
  hello: "Buongiorno,",
  market: "Marketplace — offerte e richieste",
  guide: "Guida breve per inserzionisti",
  pausal: "Ordina il pacchetto",
  campaign: "Campagna una tantum",
  replyNote: "Potete rispondere a questa e-mail — rispondiamo in automatico.",
  price: { subject: "Listino marketplace MedScopeGlobal", lead: salesPriceListPlain() },
  publish: {
    subject: "Come pubblicare un’offerta su MedScopeGlobal",
    lead: "Modulo del marketplace o e-mail inzerce@medscopeglobal.com. L’offerta compare subito. Contatti dopo il pacchetto attivo.",
  },
  demand: {
    subject: "Richieste sul marketplace MedScopeGlobal",
    lead: "Le richieste di ospedali e laboratori sono visibili subito (senza e-mail). L’inserzionista pagante riceve il contatto. Nessuna commissione sull’affare.",
  },
  legal: {
    subject: "Condizioni pubblicitarie MedScopeGlobal",
    lead: "Ogni superficie è etichettata come pubblicità. La zona medici resta senza ads. Rx solo su superfici professionali.",
  },
  invoice: {
    subject: "Fattura del pacchetto MedScopeGlobal",
    lead: "Dopo l’ordine emettiamo fattura (MSG-SAL-…) o pagamento Stripe. Non soggetti IVA in Cechia.",
  },
  timing: {
    subject: "Tempistiche MedScopeGlobal",
    lead: "Modulo e e-mail ricevono risposta automatica subito. Richieste secondo SLA: Start 72 h fino a Partner 8 h.",
  },
  general: { subject: "Marketplace MedScopeGlobal — offerte, richieste, pacchetto", lead: EN.general.lead },
};

const ES: ReplyPack = {
  ...EN,
  hello: "Hola,",
  market: "Mercado — ofertas y demandas",
  guide: "Guía breve para anunciantes",
  pausal: "Pedir el plan",
  campaign: "Campaña puntual",
  replyNote: "Puede responder a este correo — respondemos automáticamente.",
  price: { subject: "Tarifas del mercado MedScopeGlobal", lead: salesPriceListPlain() },
  publish: {
    subject: "Cómo publicar una oferta en MedScopeGlobal",
    lead: "Formulario del mercado o correo a inzerce@medscopeglobal.com. La oferta aparece al momento. Contactos tras el plan activo.",
  },
  demand: {
    subject: "Demandas en el mercado MedScopeGlobal",
    lead: "Las demandas de hospitales y laboratorios se ven al momento (sin correo). El anunciante de pago recibe el contacto. Sin comisión sobre el trato.",
  },
  legal: {
    subject: "Condiciones publicitarias MedScopeGlobal",
    lead: "Cada superficie está marcada como publicidad. La zona médica permanece sin anuncios. Rx solo en superficies profesionales.",
  },
  invoice: {
    subject: "Factura del plan MedScopeGlobal",
    lead: "Tras el pedido emitimos factura (MSG-SAL-…) o pago Stripe. No somos sujetos de IVA en Chequia.",
  },
  timing: {
    subject: "Plazos publicitarios MedScopeGlobal",
    lead: "Formulario y correo reciben respuesta automática inmediata. Demandas según SLA: Start 72 h hasta Partner 8 h.",
  },
  general: { subject: "Mercado MedScopeGlobal — ofertas, demandas y plan", lead: EN.general.lead },
};

const PL: ReplyPack = {
  ...EN,
  hello: "Dzień dobry,",
  market: "Rynek — oferty i zapytania",
  guide: "Krótki poradnik reklamodawcy",
  pausal: "Zamów abonament",
  campaign: "Kampania jednorazowa",
  replyNote: "Możesz odpowiedzieć na ten e-mail — odpowiadamy automatycznie.",
  price: { subject: "Cennik rynku MedScopeGlobal", lead: salesPriceListPlain() },
  publish: {
    subject: "Jak opublikować ofertę na MedScopeGlobal",
    lead: "Formularz rynku lub e-mail inzerce@medscopeglobal.com. Oferta pojawia się od razu. Kontakty po aktywnym abonamencie.",
  },
  demand: {
    subject: "Zapytania na rynku MedScopeGlobal",
    lead: "Zapytania szpitali i laboratoriów widać od razu (bez e-maila). Płatny reklamodawca dostaje kontakt. Bez prowizji od transakcji.",
  },
  legal: {
    subject: "Warunki reklamy MedScopeGlobal",
    lead: "Każda powierzchnia jest oznaczona jako reklama. Strefa lekarska bez reklam. Rx tylko na powierzchniach specjalistycznych.",
  },
  invoice: {
    subject: "Faktura abonamentu MedScopeGlobal",
    lead: "Po zamówieniu wystawiamy fakturę (MSG-SAL-…) lub płatność Stripe. Nie jesteśmy płatnikami VAT w CZ.",
  },
  timing: {
    subject: "Terminy reklamy MedScopeGlobal",
    lead: "Formularz i e-mail dostają automatyczną odpowiedź od razu. Zapytania według SLA: Start 72 h do Partner 8 h.",
  },
  general: { subject: "Rynek MedScopeGlobal — oferty, zapytania, abonament", lead: EN.general.lead },
};

const PT: ReplyPack = {
  ...EN,
  hello: "Olá,",
  market: "Mercado — ofertas e pedidos",
  guide: "Guia breve para anunciantes",
  pausal: "Pedir o plano",
  campaign: "Campanha pontual",
  replyNote: "Pode responder a este e-mail — respondemos automaticamente.",
  price: { subject: "Preçário do mercado MedScopeGlobal", lead: salesPriceListPlain() },
  publish: {
    subject: "Como publicar uma oferta no MedScopeGlobal",
    lead: "Formulário do mercado ou e-mail inzerce@medscopeglobal.com. A oferta aparece de imediato. Contactos após o plano ativo.",
  },
  demand: {
    subject: "Pedidos no mercado MedScopeGlobal",
    lead: "Pedidos de hospitais e laboratórios ficam visíveis de imediato (sem e-mail). O anunciante pagante recebe o contacto. Sem comissão sobre o negócio.",
  },
  legal: {
    subject: "Condições publicitárias MedScopeGlobal",
    lead: "Cada superfície é marcada como publicidade. A zona médica permanece sem anúncios. Rx só em superfícies profissionais.",
  },
  invoice: {
    subject: "Fatura do plano MedScopeGlobal",
    lead: "Após a encomenda emitimos fatura (MSG-SAL-…) ou pagamento Stripe. Não somos sujeitos passivos de IVA na Chéquia.",
  },
  timing: {
    subject: "Prazos publicitários MedScopeGlobal",
    lead: "Formulário e e-mail recebem resposta automática de imediato. Pedidos segundo o SLA: Start 72 h até Partner 8 h.",
  },
  general: { subject: "Mercado MedScopeGlobal — ofertas, pedidos e plano", lead: EN.general.lead },
};

const PACK: Record<MarketplaceUiLang, ReplyPack> = {
  cs: CS,
  sk: SK,
  de: DE,
  fr: FR,
  it: IT,
  es: ES,
  pl: PL,
  pt: PT,
  "pt-BR": PT,
  en: EN,
};

export function marketplaceReplyCopy(
  topic: MarketplaceReplyTopic,
  locale?: string | null
): { subject: string; html: string; text: string } {
  const lang = marketplaceUiLang(locale);
  const pack = PACK[lang] ?? EN;
  const item = pack[topic];
  const loc = locale?.trim() || "cs";
  const market = campaignPublicUrl(loc, "/exchange");
  const navod = campaignPublicUrl(loc, "/exchange/navod");
  const pausal = campaignPublicUrl(loc, "/inzerce/pausal");
  const ads = campaignPublicUrl(loc, "/inzerce/formular");
  const links = `
    <ul>
      <li><a href="${market}">${pack.market}</a></li>
      <li><a href="${navod}">${pack.guide}</a></li>
      <li><a href="${pausal}">${pack.pausal}</a></li>
      <li><a href="${ads}">${pack.campaign}</a></li>
    </ul>
    <p>${pack.replyNote}</p>
  `;
  const html = `<p>${pack.hello}</p><p>${item.lead}</p>${links}<p>${pack.signoff}</p>`;
  const text = `${item.lead}\n\n${market}\n${navod}\n${pausal}`;
  return { subject: item.subject, html, text };
}
