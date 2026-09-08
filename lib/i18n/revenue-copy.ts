import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { localizeListedCzkIn } from "@/lib/i18n/payment-currency";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";

type Pack = ChromePack;

export function revenueCopyLocale(locale?: string | null): Pack {
  return chromePack(locale);
}

export type RevenueCopy = {
  partnerKicker: string;
  partnerTitle: string;
  partnerBody: string;
  partnerCta: string;
  partnerPrice: string;
  subscribeKicker: string;
  subscribeTitle: string;
  subscribeBody: string;
  subscribeCta: string;
  subscribeHint: string;
  newsletterKicker: string;
  newsletterTitle: string;
  newsletterBody: string;
  newsletterPlaceholder: string;
  newsletterCta: string;
  newsletterPrivacy: string;
  newsletterSuccess: string;
  newsletterDuplicate: string;
  newsletterError: string;
  newsletterInvalid: string;
  affiliateKicker: string;
  affiliateTitle: string;
  affiliateShelfKicker: string;
  affiliateShelfTitle: string;
  affiliateDisclosure: string;
  tipsFollowup: string;
  mediaKitEyebrow: string;
  mediaKitTitle: string;
  mediaKitLead: string;
  mediaKitReach: string;
  mediaKitAudience: string;
  mediaKitCta: string;
  bannerName: string;
  sponsoredName: string;
  newsletterName: string;
  cosmeticsName: string;
  bannerOfferDesc: string;
  sponsoredOfferDesc: string;
  newsletterOfferDesc: string;
  cosmeticsOfferDesc: string;
  priceListName: string;
  priceListDesc: string;
  priceListCta: string;
};

const COPY: Record<Pack, RevenueCopy> = {
  cs: {
    partnerKicker: "Inzerce",
    partnerTitle: "Tento prostor je k rezervaci",
    partnerBody:
      "Native banner u čtenářů dlouhověkosti — od 5 000 Kč/měsíc. Sponzorovaný článek od 15 000 Kč, vždy označený.",
    partnerCta: "Rezervovat inzerci",
    partnerPrice: "od 5 000 Kč/měsíc",
    subscribeKicker: "Volitelné předplatné",
    subscribeTitle: "Číst dál bez reklam",
    subscribeBody:
      "Tarif Redakce 25 Kč měsíčně nebo 250 Kč za rok (v zahraničí 1 € / 10 €), platba ihned. Tipy v článcích zůstávají dobrovolné — toto není VIP členství.",
    subscribeCta: "Otevřít tarif Redakce",
    subscribeHint: "Zrušíte kdykoli před dalším inkasem.",
    newsletterKicker: "ViaLongeVita",
    newsletterTitle: "ViaLongeVita do schránky",
    newsletterBody:
      "Jednou týdně jasně o spánku, pohybu, výživě a dlouhověkosti — v češtině, zdarma.",
    newsletterPlaceholder: "váš@email.cz",
    newsletterCta: "Chci brief",
    newsletterPrivacy: "E-mail použijeme jen na brief ViaLongeVita. Odhlášení v každém vydání.",
    newsletterSuccess: "Děkujeme — ViaLongeVita brief přijde ve vašem jazyce.",
    newsletterDuplicate: "Tento e-mail už brief odebírá.",
    newsletterError: "Odeslání se nepovedlo. Zkuste to znovu.",
    newsletterInvalid: "Zadejte platný e-mail.",
    affiliateKicker: "K tomuto textu se hodí",
    affiliateTitle: "Čtenáři u tohoto tématu často hledají",
    affiliateShelfKicker: "ViaLongeVita",
    affiliateShelfTitle: "Co čtenáři berou dál",
    affiliateDisclosure:
      "Nákup probíhá u obchodníka, ne u redakce. Z nákupu můžeme dostat provizi. Nejde o lékařské doporučení. As an Amazon Associate I earn from qualifying purchases.",
    tipsFollowup: "Chcete dostávat podobné texty e-mailem?",
    mediaKitEyebrow: "ViaLongeVita · mediakit",
    mediaKitTitle: "Inzerce u čtenářů dlouhověkosti",
    mediaKitLead:
      "Inzerce u čtenářů dlouhověkosti — prevence, spánek, pohyb a výživa. Reálná audience 40+, ne boti.",
    mediaKitReach: "Longevity audience",
    mediaKitAudience: "Prevence, spánek, pohyb, výživa, kosmetika",
    mediaKitCta: "Objednat kampaň",
    bannerName: "Native banner",
    sponsoredName: "Sponzorovaný článek",
    newsletterName: "Mention v newsletteru",
    cosmeticsName: "Kosmetický hub",
    bannerOfferDesc: "Homepage a články — 5 000 Kč / měsíc.",
    sponsoredOfferDesc: "Označený partnerský text — 15 000 Kč.",
    newsletterOfferDesc: "Mention v týdenním briefu — od 3 500 Kč.",
    cosmeticsOfferDesc: "Cílení na /verejnost/clanky?topic=kosmetika — 22 000 Kč / měsíc, označené.",
    priceListName: "Ceník",
    priceListDesc: "Kompletní sazebník bannerů a balíčků.",
    priceListCta: "Kompletní ceník",
  },
  de: {
    partnerKicker: "Werbung",
    partnerTitle: "Dieser Platz ist buchbar",
    partnerBody:
      "Native Banner bei Longevity-Lesern — ab 5 000 Kč/Monat. Gesponserter Artikel ab 15 000 Kč, immer gekennzeichnet.",
    partnerCta: "Werbung buchen",
    partnerPrice: "ab 5 000 Kč/Monat",
    subscribeKicker: "Optionales Abo",
    subscribeTitle: "Weiterlesen ohne Werbung",
    subscribeBody:
      "Redaktionsabo 1 € im Monat oder 10 € im Jahr, sofort. Trinkgelder in Artikeln bleiben freiwillig — kein VIP-Zwang.",
    subscribeCta: "Redaktionsabo öffnen",
    subscribeHint: "Jederzeit vor der nächsten Abbuchung kündbar.",
    newsletterKicker: "ViaLongeVita",
    newsletterTitle: "ViaLongeVita in Ihrem Postfach",
    newsletterBody:
      "Einmal pro Woche klar zu Schlaf, Bewegung, Ernährung und Langlebigkeit — auf Deutsch, kostenlos.",
    newsletterPlaceholder: "ihre@email.de",
    newsletterCta: "Brief erhalten",
    newsletterPrivacy: "Nur für den ViaLongeVita-Brief. Abmeldung in jeder Ausgabe.",
    newsletterSuccess: "Danke — der ViaLongeVita-Brief kommt in Ihrer Sprache.",
    newsletterDuplicate: "Diese Adresse ist bereits angemeldet.",
    newsletterError: "Senden fehlgeschlagen. Bitte erneut versuchen.",
    newsletterInvalid: "Bitte eine gültige E-Mail eingeben.",
    affiliateKicker: "Passend zu diesem Text",
    affiliateTitle: "Wonach Leser bei diesem Thema greifen",
    affiliateShelfKicker: "ViaLongeVita",
    affiliateShelfTitle: "Wonach Leser als Nächstes greifen",
    affiliateDisclosure:
      "Der Kauf erfolgt beim Händler, nicht bei der Redaktion. Aus dem Kauf kann eine Provision entstehen. Keine medizinische Empfehlung. As an Amazon Associate I earn from qualifying purchases.",
    tipsFollowup: "Ähnliche Texte per E-Mail?",
    mediaKitEyebrow: "ViaLongeVita · Media-Kit",
    mediaKitTitle: "Werbung bei Longevity-Lesern",
    mediaKitLead:
      "Werbung bei Longevity-Lesern — Prävention, Schlaf, Bewegung, Ernährung. Echte Leser 40+, keine Bots.",
    mediaKitReach: "Longevity-Leser",
    mediaKitAudience: "Prävention, Schlaf, Bewegung, Ernährung",
    mediaKitCta: "Kampagne anfragen",
    bannerName: "Native Banner",
    sponsoredName: "Gesponserter Artikel",
    newsletterName: "Newsletter-Mention",
    cosmeticsName: "Kosmetik-Hub",
    bannerOfferDesc: "Startseite und Artikel — 5 000 Kč / Monat.",
    sponsoredOfferDesc: "Gekennzeichneter Partnertext — 15 000 Kč.",
    newsletterOfferDesc: "Erwähnung im Wochenbrief — ab 3 500 Kč.",
    cosmeticsOfferDesc: "Targeting auf /verejnost/clanky?topic=kosmetika — 22 000 Kč/Monat, gekennzeichnet.",
    priceListName: "Preisliste",
    priceListDesc: "Vollständige Sätze für Banner und Pakete.",
    priceListCta: "Vollständige Preisliste",
  },
  fr: {
    partnerKicker: "Publicité",
    partnerTitle: "Cet emplacement est à réserver",
    partnerBody:
      "Bannière native auprès des lecteurs longévité — dès 5 000 Kč/mois. Article sponsorisé dès 15 000 Kč, toujours signalé.",
    partnerCta: "Réserver un espace",
    partnerPrice: "dès 5 000 Kč/mois",
    subscribeKicker: "Abonnement facultatif",
    subscribeTitle: "Lire sans publicité",
    subscribeBody:
      "Abonnement Rédaction 1 € par mois ou 10 € par an, tout de suite. Les pourboires restent volontaires — ce n’est pas un club VIP.",
    subscribeCta: "Ouvrir la rédaction",
    subscribeHint: "Résiliable avant le prochain prélèvement.",
    newsletterKicker: "ViaLongeVita",
    newsletterTitle: "ViaLongeVita dans votre boîte",
    newsletterBody:
      "Une fois par semaine : sommeil, mouvement, alimentation et longévité — en français, gratuit.",
    newsletterPlaceholder: "vous@email.fr",
    newsletterCta: "Recevoir le brief",
    newsletterPrivacy: "E-mail utilisé uniquement pour le brief ViaLongeVita. Désinscription dans chaque numéro.",
    newsletterSuccess: "Merci — le brief ViaLongeVita arrivera dans votre langue.",
    newsletterDuplicate: "Cette adresse est déjà inscrite.",
    newsletterError: "Envoi impossible. Réessayez.",
    newsletterInvalid: "Indiquez un e-mail valide.",
    affiliateKicker: "Dans le prolongement de ce texte",
    affiliateTitle: "Ce que les lecteurs cherchent sur ce sujet",
    affiliateShelfKicker: "ViaLongeVita",
    affiliateShelfTitle: "Ce que les lecteurs cherchent ensuite",
    affiliateDisclosure:
      "L’achat se fait chez le commerçant, pas chez la rédaction. Un achat peut générer une commission. Pas un avis médical. As an Amazon Associate I earn from qualifying purchases.",
    tipsFollowup: "Recevoir des textes similaires par e-mail ?",
    mediaKitEyebrow: "ViaLongeVita · kit média",
    mediaKitTitle: "Publicité auprès des lecteurs longévité",
    mediaKitLead:
      "Publicité auprès des lecteurs longévité — prévention, sommeil, mouvement, alimentation. Audience réelle 40+, pas des bots.",
    mediaKitReach: "Audience longévité",
    mediaKitAudience: "Prévention, sommeil, mouvement, alimentation",
    mediaKitCta: "Commander une campagne",
    bannerName: "Bannière native",
    sponsoredName: "Article sponsorisé",
    newsletterName: "Mention newsletter",
    cosmeticsName: "Hub cosmétique",
    bannerOfferDesc: "Accueil et articles — 5 000 Kč / mois.",
    sponsoredOfferDesc: "Texte partenaire signalé — 15 000 Kč.",
    newsletterOfferDesc: "Mention dans le brief hebdomadaire — dès 3 500 Kč.",
    cosmeticsOfferDesc: "Ciblage /verejnost/clanky?topic=kosmetika — 22 000 Kč/mois, marqué.",
    priceListName: "Tarifs",
    priceListDesc: "Grille complète des bannières et packs.",
    priceListCta: "Grille tarifaire",
  },
  en: {
    partnerKicker: "Advertising",
    partnerTitle: "This slot is available",
    partnerBody:
      "Native banner with longevity readers — from CZK 5,000/month. Sponsored article from CZK 15,000, always labelled.",
    partnerCta: "Book this space",
    partnerPrice: "from CZK 5,000/month",
    subscribeKicker: "Optional subscription",
    subscribeTitle: "Keep reading without ads",
    subscribeBody:
      "Editorial plan 25 CZK / €1 / $1 a month, or 250 CZK / €10 a year, billed now. Article tips stay voluntary — this is not a VIP club.",
    subscribeCta: "Open Editorial",
    subscribeHint: "Cancel any time before the next charge.",
    newsletterKicker: "ViaLongeVita",
    newsletterTitle: "ViaLongeVita in your inbox",
    newsletterBody:
      "Once a week: sleep, movement, food and longevity — in your language, free.",
    newsletterPlaceholder: "you@email.com",
    newsletterCta: "Send me the brief",
    newsletterPrivacy: "We use the address only for the ViaLongeVita brief. Unsubscribe in every issue.",
    newsletterSuccess: "Thank you — the ViaLongeVita brief will arrive in your language.",
    newsletterDuplicate: "This email is already on the list.",
    newsletterError: "Could not send. Please try again.",
    newsletterInvalid: "Enter a valid email.",
    affiliateKicker: "A natural next step",
    affiliateTitle: "What readers look up after this piece",
    affiliateShelfKicker: "ViaLongeVita",
    affiliateShelfTitle: "What readers reach for next",
    affiliateDisclosure:
      "You buy from the retailer, not the newsroom. A purchase may earn us a commission. Not medical advice. As an Amazon Associate I earn from qualifying purchases.",
    tipsFollowup: "Want similar pieces by email?",
    mediaKitEyebrow: "ViaLongeVita · media kit",
    mediaKitTitle: "Advertise to longevity readers",
    mediaKitLead:
      "Advertise to longevity readers — prevention, sleep, movement, nutrition. Real readers 40+, not bots.",
    mediaKitReach: "Longevity readers",
    mediaKitAudience: "Prevention, sleep, movement, nutrition",
    mediaKitCta: "Book a campaign",
    bannerName: "Native banner",
    sponsoredName: "Sponsored article",
    newsletterName: "Newsletter mention",
    cosmeticsName: "Skincare hub",
    bannerOfferDesc: "Homepage and articles — 5 000 Kč / month.",
    sponsoredOfferDesc: "Labelled partner piece — 15 000 Kč.",
    newsletterOfferDesc: "Mention in the weekly brief — from 3 500 Kč.",
    cosmeticsOfferDesc: "Targeting /verejnost/clanky?topic=kosmetika — 22 000 Kč/month, labeled.",
    priceListName: "Rate card",
    priceListDesc: "Full banner and package rates.",
    priceListCta: "Full rate card",
  },
  it: {
    partnerKicker: "Pubblicità",
    partnerTitle: "Questo spazio è prenotabile",
    partnerBody:
      "Banner nativo tra i lettori di longevità — da 5 000 Kč/mese. Articolo sponsorizzato da 15 000 Kč, sempre segnalato.",
    partnerCta: "Prenota lo spazio",
    partnerPrice: "da 5 000 Kč/mese",
    subscribeKicker: "Abbonamento facoltativo",
    subscribeTitle: "Continua a leggere senza pubblicità",
    subscribeBody:
      "Piano Redazione 1 € al mese o 10 € all’anno, subito. Le mance restano volontarie — non è un club VIP.",
    subscribeCta: "Apri il piano Redazione",
    subscribeHint: "Disdici quando vuoi prima del prossimo addebito.",
    newsletterKicker: "ViaLongeVita",
    newsletterTitle: "ViaLongeVita nella tua casella",
    newsletterBody:
      "Una volta a settimana: sonno, movimento, cibo e longevità — in italiano, gratis.",
    newsletterPlaceholder: "tu@email.it",
    newsletterCta: "Inviami il brief",
    newsletterPrivacy: "Usiamo l’indirizzo solo per il brief ViaLongeVita. Disiscrizione in ogni numero.",
    newsletterSuccess: "Grazie — il brief ViaLongeVita arriverà nella tua lingua.",
    newsletterDuplicate: "Questo indirizzo è già iscritto.",
    newsletterError: "Invio non riuscito. Riprova.",
    newsletterInvalid: "Inserisci un’e-mail valida.",
    affiliateKicker: "Il passo successivo",
    affiliateTitle: "Cosa cercano i lettori su questo tema",
    affiliateShelfKicker: "ViaLongeVita",
    affiliateShelfTitle: "Cosa prendono i lettori dopo",
    affiliateDisclosure:
      "L’acquisto avviene dal commerciante, non dalla redazione. Un acquisto può generare una commissione. Non è un parere medico. As an Amazon Associate I earn from qualifying purchases.",
    tipsFollowup: "Testi simili per e-mail?",
    mediaKitEyebrow: "ViaLongeVita · media kit",
    mediaKitTitle: "Pubblicità ai lettori di longevità",
    mediaKitLead:
      "Pubblicità ai lettori di longevità — prevenzione, sonno, movimento, alimentazione. Lettori reali over 40, non bot.",
    mediaKitReach: "Lettori di longevità",
    mediaKitAudience: "Prevenzione, sonno, movimento, alimentazione",
    mediaKitCta: "Prenota una campagna",
    bannerName: "Banner nativo",
    sponsoredName: "Articolo sponsorizzato",
    newsletterName: "Menzione newsletter",
    cosmeticsName: "Hub cosmetico",
    bannerOfferDesc: "Home e articoli — 5 000 Kč / mese.",
    sponsoredOfferDesc: "Testo partner segnalato — 15 000 Kč.",
    newsletterOfferDesc: "Menzione nel brief settimanale — da 3 500 Kč.",
    cosmeticsOfferDesc: "Targeting su /verejnost/clanky?topic=kosmetika — 22 000 Kč/mese, etichettato.",
    priceListName: "Listino",
    priceListDesc: "Tariffe complete di banner e pacchetti.",
    priceListCta: "Listino completo",
  },
  es: {
    partnerKicker: "Publicidad",
    partnerTitle: "Este espacio está disponible",
    partnerBody:
      "Banner nativo entre lectores de longevidad — desde 5 000 Kč/mes. Artículo patrocinado desde 15 000 Kč, siempre señalado.",
    partnerCta: "Reservar el espacio",
    partnerPrice: "desde 5 000 Kč/mes",
    subscribeKicker: "Suscripción opcional",
    subscribeTitle: "Seguir leyendo sin anuncios",
    subscribeBody:
      "Plan Redacción 1 € al mes o 10 € al año, de inmediato. Las propinas siguen siendo voluntarias — no es un club VIP.",
    subscribeCta: "Abrir el plan Redacción",
    subscribeHint: "Cancela cuando quieras antes del siguiente cargo.",
    newsletterKicker: "ViaLongeVita",
    newsletterTitle: "ViaLongeVita en tu bandeja",
    newsletterBody:
      "Una vez por semana: sueño, movimiento, comida y longevidad — en español, gratis.",
    newsletterPlaceholder: "tu@email.es",
    newsletterCta: "Quiero el brief",
    newsletterPrivacy: "Usamos el correo solo para el brief ViaLongeVita. Baja en cada número.",
    newsletterSuccess: "Gracias — el brief ViaLongeVita llegará en tu idioma.",
    newsletterDuplicate: "Este correo ya está en la lista.",
    newsletterError: "No se pudo enviar. Inténtalo de nuevo.",
    newsletterInvalid: "Introduce un correo válido.",
    affiliateKicker: "El siguiente paso",
    affiliateTitle: "Qué buscan los lectores en este tema",
    affiliateShelfKicker: "ViaLongeVita",
    affiliateShelfTitle: "Qué toman los lectores después",
    affiliateDisclosure:
      "Compras en el comercio, no en la redacción. Una compra puede generar comisión. No es consejo médico. As an Amazon Associate I earn from qualifying purchases.",
    tipsFollowup: "¿Textos similares por correo?",
    mediaKitEyebrow: "ViaLongeVita · media kit",
    mediaKitTitle: "Publicidad para lectores de longevidad",
    mediaKitLead:
      "Publicidad para lectores de longevidad — prevención, sueño, movimiento, alimentación. Lectores reales +40, no bots.",
    mediaKitReach: "Lectores de longevidad",
    mediaKitAudience: "Prevención, sueño, movimiento, alimentación",
    mediaKitCta: "Reservar una campaña",
    bannerName: "Banner nativo",
    sponsoredName: "Artículo patrocinado",
    newsletterName: "Mención newsletter",
    cosmeticsName: "Hub cosmética",
    bannerOfferDesc: "Portada y artículos — 5 000 Kč / mes.",
    sponsoredOfferDesc: "Texto de partner señalado — 15 000 Kč.",
    newsletterOfferDesc: "Mención en el brief semanal — desde 3 500 Kč.",
    cosmeticsOfferDesc: "Segmentación en /verejnost/clanky?topic=kosmetika — 22 000 Kč/mes, etiquetado.",
    priceListName: "Tarifas",
    priceListDesc: "Tarifas completas de banners y packs.",
    priceListCta: "Tarifas completas",
  },
  "pt-BR": {
    partnerKicker: "Publicidade",
    partnerTitle: "Este espaço está disponível",
    partnerBody:
      "Banner nativo entre leitores de longevidade — a partir de 5 000 Kč/mês. Artigo patrocinado a partir de 15 000 Kč, sempre sinalizado.",
    partnerCta: "Reservar o espaço",
    partnerPrice: "a partir de 5 000 Kč/mês",
    subscribeKicker: "Assinatura opcional",
    subscribeTitle: "Continuar lendo sem anúncios",
    subscribeBody:
      "Plano Editorial 1 € por mês ou 10 € por ano, já. Gorjetas continuam voluntárias — não é clube VIP.",
    subscribeCta: "Abrir o plano Editorial",
    subscribeHint: "Cancele quando quiser antes da próxima cobrança.",
    newsletterKicker: "ViaLongeVita",
    newsletterTitle: "ViaLongeVita na sua caixa",
    newsletterBody:
      "Uma vez por semana: sono, movimento, comida e longevidade — no seu idioma, grátis.",
    newsletterPlaceholder: "voce@email.com",
    newsletterCta: "Quero o brief",
    newsletterPrivacy: "Usamos o e-mail só para o brief ViaLongeVita. Descadastrar em cada edição.",
    newsletterSuccess: "Obrigado — o brief ViaLongeVita chega no seu idioma.",
    newsletterDuplicate: "Este e-mail já está na lista.",
    newsletterError: "Não foi possível enviar. Tente de novo.",
    newsletterInvalid: "Digite um e-mail válido.",
    affiliateKicker: "O próximo passo",
    affiliateTitle: "O que os leitores buscam neste tema",
    affiliateShelfKicker: "ViaLongeVita",
    affiliateShelfTitle: "O que os leitores pegam depois",
    affiliateDisclosure:
      "A compra é no varejista, não na redação. Uma compra pode gerar comissão. Não é conselho médico. As an Amazon Associate I earn from qualifying purchases.",
    tipsFollowup: "Textos parecidos por e-mail?",
    mediaKitEyebrow: "ViaLongeVita · media kit",
    mediaKitTitle: "Publicidade para leitores de longevidade",
    mediaKitLead:
      "Publicidade para leitores de longevidade — prevenção, sono, movimento, alimentação. Leitores reais 40+, não bots.",
    mediaKitReach: "Leitores de longevidade",
    mediaKitAudience: "Prevenção, sono, movimento, alimentação",
    mediaKitCta: "Reservar uma campanha",
    bannerName: "Banner nativo",
    sponsoredName: "Artigo patrocinado",
    newsletterName: "Menção na newsletter",
    cosmeticsName: "Hub de cosmética",
    bannerOfferDesc: "Home e artigos — 5 000 Kč / mês.",
    sponsoredOfferDesc: "Texto de parceiro sinalizado — 15 000 Kč.",
    newsletterOfferDesc: "Menção no brief semanal — a partir de 3 500 Kč.",
    cosmeticsOfferDesc: "Segmentação em /verejnost/clanky?topic=kosmetika — 22 000 Kč/mês, identificado.",
    priceListName: "Tabela",
    priceListDesc: "Tabela completa de banners e pacotes.",
    priceListCta: "Tabela completa",
  },
};

export function getRevenueCopy(locale?: string | null): RevenueCopy {
  const base = COPY[revenueCopyLocale(locale)];
  const nl = getNewsletterCopy(locale);
  const overlay = affiliateOverlay(locale);
  const subscribe = subscribeOverlay(locale);
  const partner = partnerOverlay(locale);
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  const subscribeCta =
    revenueCopyLocale(locale) === "en" && primary !== "en" ? getSurfaceCopy(locale).whyTrial : base.subscribeCta;
  return localizeListedCzkIn(
    {
      ...base,
      ...overlay,
      ...subscribe,
      ...partner,
      subscribeCta,
      newsletterKicker: nl.kicker,
      newsletterTitle: nl.title,
      newsletterBody: nl.body,
      newsletterPlaceholder: nl.placeholder,
      newsletterCta: nl.cta,
      newsletterPrivacy: nl.privacy,
      newsletterSuccess: nl.success,
      newsletterDuplicate: nl.duplicate,
      newsletterError: nl.error,
      newsletterInvalid: nl.invalid,
    },
    locale
  );
}

function partnerOverlay(
  locale?: string | null
): Partial<
  Pick<
    RevenueCopy,
    | "partnerKicker"
    | "partnerTitle"
    | "partnerBody"
    | "partnerCta"
    | "subscribeBody"
    | "mediaKitCta"
    | "bannerName"
    | "sponsoredName"
  >
> {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "en"));
  if (primary === "sk") {
    return {
      partnerKicker: "Inzercia",
      partnerTitle: "Tento priestor je na rezerváciu",
      partnerBody:
        "Native banner u čitateľov dlhovekosti — od 5 000 Kč/mesiac. Sponzorovaný článok od 15 000 Kč, vždy označený.",
      partnerCta: "Rezervovať inzerciu",
      subscribeBody:
        "Tarif Redakcia 1 € mesačne alebo 10 € za rok, platba hneď. Tipy v článkoch ostávajú dobrovoľné — toto nie je VIP klub.",
      mediaKitCta: "Objednať kampaň",
      bannerName: "Native banner",
      sponsoredName: "Sponzorovaný článok",
    };
  }
  if (primary === "pl") {
    return {
      partnerKicker: "Reklama",
      partnerTitle: "To miejsce jest do rezerwacji",
      partnerBody:
        "Baner native wśród czytelników długowieczności — od 5 000 Kč/miesiąc. Artykuł sponsorowany od 15 000 Kč, zawsze oznaczony.",
      partnerCta: "Zarezerwuj reklamę",
      subscribeBody:
        "Plan Redakcja 1 € miesięcznie lub 10 € rocznie, od razu. Napiwki w artykułach zostają dobrowolne — to nie klub VIP.",
      mediaKitCta: "Zamów kampanię",
      bannerName: "Baner native",
      sponsoredName: "Artykuł sponsorowany",
    };
  }
  if (primary === "ja") {
    return {
      partnerKicker: "広告",
      partnerTitle: "この枠は予約できます",
      partnerBody:
        "長寿読者向けのネイティブバナー — 月5 000 Kčから。スポンサー記事は15 000 Kčから、必ず表示します。",
      partnerCta: "広告枠を予約",
      subscribeBody:
        "編集部プランは月1€または年10€、すぐに課金。記事のチップは任意です — VIPクラブではありません。",
      mediaKitCta: "キャンペーンを申し込む",
      bannerName: "ネイティブバナー",
      sponsoredName: "スポンサー記事",
    };
  }
  if (primary === "ru") {
    return {
      partnerKicker: "Реклама",
      partnerTitle: "Это место можно забронировать",
      partnerBody:
        "Нативный баннер у читателей долголетия — от 5 000 Kč/месяц. Спонсорская статья от 15 000 Kč, всегда помечена.",
      partnerCta: "Забронировать рекламу",
      subscribeBody:
        "Тариф Редакция 1 € в месяц или 10 € в год, сразу. Чаевые в статьях остаются добровольными — это не VIP-клуб.",
      mediaKitCta: "Заказать кампанию",
      bannerName: "Нативный баннер",
      sponsoredName: "Спонсорская статья",
    };
  }
  if (primary === "zh") {
    return {
      partnerKicker: "广告",
      partnerTitle: "此位置可预订",
      partnerBody: "面向长寿读者的原生广告 — 每月 5 000 Kč 起。赞助文章 15 000 Kč 起，一律标注。",
      partnerCta: "预订广告位",
      subscribeBody: "编辑部方案每月 1€ 或每年 10€，立即计费。文中打赏仍属自愿 — 不是 VIP 俱乐部。",
      mediaKitCta: "预订投放",
      bannerName: "原生横幅",
      sponsoredName: "赞助文章",
    };
  }
  if (primary === "ro") {
    return {
      partnerKicker: "Publicitate",
      partnerTitle: "Acest spațiu poate fi rezervat",
      partnerCta: "Rezervă spațiul",
      mediaKitCta: "Comandă o campanie",
    };
  }
  if (primary === "hu") {
    return {
      partnerKicker: "Hirdetés",
      partnerTitle: "Ez a hely foglalható",
      partnerCta: "Hirdetés foglalása",
      mediaKitCta: "Kampány megrendelése",
    };
  }
  if (primary === "uk") {
    return {
      partnerKicker: "Реклама",
      partnerTitle: "Це місце можна забронювати",
      partnerCta: "Забронювати рекламу",
      mediaKitCta: "Замовити кампанію",
    };
  }
  if (primary === "ko") {
    return {
      partnerKicker: "광고",
      partnerTitle: "이 자리는 예약할 수 있습니다",
      partnerCta: "광고 자리 예약",
      mediaKitCta: "캠페인 신청",
    };
  }
  return {};
}

function subscribeOverlay(
  locale?: string | null
): Partial<Pick<RevenueCopy, "subscribeKicker" | "subscribeTitle" | "subscribeHint">> {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "en"));
  if (primary === "sk") {
    return {
      subscribeKicker: "Voliteľné predplatné",
      subscribeTitle: "Čítať ďalej bez reklám",
      subscribeHint: "Zrušíte kedykoľvek pred ďalším inkasom.",
    };
  }
  if (primary === "pl") {
    return {
      subscribeKicker: "Opcjonalna prenumerata",
      subscribeTitle: "Czytaj dalej bez reklam",
      subscribeHint: "Anulujesz w dowolnej chwili przed kolejną opłatą.",
    };
  }
  if (primary === "ro") {
    return {
      subscribeKicker: "Abonament opțional",
      subscribeTitle: "Citește mai departe fără reclame",
      subscribeHint: "Poți anula oricând înainte de următoarea taxare.",
    };
  }
  if (primary === "hu") {
    return {
      subscribeKicker: "Opcionális előfizetés",
      subscribeTitle: "Olvasás tovább reklám nélkül",
      subscribeHint: "A következő terhelés előtt bármikor lemondható.",
    };
  }
  if (primary === "ru") {
    return {
      subscribeKicker: "Необязательная подписка",
      subscribeTitle: "Читать дальше без рекламы",
      subscribeHint: "Отменить можно в любой момент до следующего списания.",
    };
  }
  if (primary === "uk") {
    return {
      subscribeKicker: "Необов’язкова передплата",
      subscribeTitle: "Читати далі без реклами",
      subscribeHint: "Скасувати можна будь-коли до наступного списання.",
    };
  }
  if (primary === "be") {
    return {
      subscribeKicker: "Неабавязковая падпіска",
      subscribeTitle: "Чытаць далей без рэкламы",
      subscribeHint: "Скасаваць можна ў любы час да наступнага спісання.",
    };
  }
  if (primary === "zh") {
    return {
      subscribeKicker: "可选订阅",
      subscribeTitle: "无广告继续阅读",
      subscribeHint: "可在下次扣费前随时取消。",
    };
  }
  if (primary === "ja") {
    return {
      subscribeKicker: "任意の購読",
      subscribeTitle: "広告なしで読み続ける",
      subscribeHint: "次回課金の前ならいつでも解約できます。",
    };
  }
  if (primary === "ko") {
    return {
      subscribeKicker: "선택 구독",
      subscribeTitle: "광고 없이 계속 읽기",
      subscribeHint: "다음 결제 전이면 언제든 해지할 수 있습니다.",
    };
  }
  if (primary === "vi") {
    return {
      subscribeKicker: "Đăng ký tùy chọn",
      subscribeTitle: "Đọc tiếp không quảng cáo",
      subscribeHint: "Hủy bất cứ lúc nào trước lần tính phí tiếp theo.",
    };
  }
  if (primary === "id") {
    return {
      subscribeKicker: "Langganan opsional",
      subscribeTitle: "Lanjut membaca tanpa iklan",
      subscribeHint: "Batalkan kapan saja sebelum tagihan berikutnya.",
    };
  }
  return {};
}

function affiliateOverlay(
  locale?: string | null
): Partial<Pick<RevenueCopy, "affiliateKicker" | "affiliateTitle" | "affiliateShelfKicker" | "affiliateShelfTitle">> {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "en"));
  if (primary === "sk") {
    return {
      affiliateKicker: "K tomuto textu sa hodí",
      affiliateTitle: "Čitatelia pri tejto téme často hľadajú",
      affiliateShelfKicker: "ViaLongeVita",
      affiliateShelfTitle: "Čo čitatelia berú ďalej",
    };
  }
  if (primary === "pl") {
    return {
      affiliateKicker: "Pasuje do tego tekstu",
      affiliateTitle: "Czego szukają czytelnicy przy tym temacie",
      affiliateShelfKicker: "ViaLongeVita",
      affiliateShelfTitle: "Po co sięgają czytelnicy dalej",
    };
  }
  if (primary === "it") {
    return {
      affiliateKicker: "In linea con questo testo",
      affiliateTitle: "Cosa cercano i lettori su questo tema",
      affiliateShelfKicker: "ViaLongeVita",
      affiliateShelfTitle: "Cosa scelgono i lettori dopo",
    };
  }
  if (primary === "es") {
    return {
      affiliateKicker: "En la línea de este texto",
      affiliateTitle: "Lo que buscan los lectores en este tema",
      affiliateShelfKicker: "ViaLongeVita",
      affiliateShelfTitle: "Lo que los lectores eligen después",
    };
  }
  if (primary === "ja") {
    return {
      affiliateKicker: "この記事の続きとして",
      affiliateTitle: "読者がこのテーマでよく探すもの",
      affiliateShelfKicker: "ViaLongeVita",
      affiliateShelfTitle: "読者が次に手に取るもの",
    };
  }
  return {};
}
