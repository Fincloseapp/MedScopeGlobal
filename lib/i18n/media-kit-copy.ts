import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { localizeListedCzkIn } from "@/lib/i18n/payment-currency";

export type MediaKitCopy = {
  letterEyebrow: string;
  letterTitle: string;
  letterBody: string[];
  audienceTitle: string;
  audienceLead: string;
  audienceItems: { label: string; body: string }[];
  digitalTitle: string;
  digitalBody: string;
  formatsTitle: string;
  formatsLead: string;
  formatCol: string;
  placeCol: string;
  priceCol: string;
  noteCol: string;
  formats: { name: string; place: string; note: string }[];
  packagesTitle: string;
  packagesLead: string;
  cleanTitle: string;
  cleanBody: string;
  contactTitle: string;
  contactBody: string;
  contactEmail: string;
  contactForm: string;
  rateCard: string;
  perIssue: string;
};

const EMAIL = "ads@medscopeglobal.com";

const COPY: Record<ChromePack, MediaKitCopy> = {
  cs: {
    letterEyebrow: "Dopis partnerům",
    letterTitle: "Digitální magazín o healthspanu — ne tištěný náklad",
    letterBody: [
      "ViaLongeVita vychází na MedScopeGlobal.com. Čtenáři sem chodí pro srozumitelné texty o spánku, pohybu, výživě a prevenci — bez zázračných slibů.",
      "Inzerci skládáme jen z formátů, které na webu opravdu umíme: native banner, označený sponzorovaný článek, mention v týdenním briefu a kosmetický hub. Lékařská a studentská zóna zůstává bez reklam.",
      "Nedokládáme tu vymyšlené uniques ani přetisk cizího media kitu. Ceny níže jsou listové sazby; finální objednávka jde přes formulář.",
    ],
    audienceTitle: "Koho texty potkávají",
    audienceLead:
      "Neprodáváme demografickou tabulku z jiného webu. Popisujeme témata, která magazín skutečně píše.",
    audienceItems: [
      { label: "Prevence a 40+", body: "Čtenáři, kteří hledají klidné návyky, ne biohacking." },
      { label: "Spánek a pohyb", body: "Rubriky, které se na homepage i v magazínu opakují." },
      { label: "Výživa a kosmetika", body: "Označené partnerství jen tam, kde téma sedí — ne v ordinaci." },
    ],
    digitalTitle: "Jen digitál",
    digitalBody:
      "ViaLongeVita nemá tištěné vydání, pultový prodej ani klubový měsíčník. Kampaně běží na webu, v článku a v newsletteru.",
    formatsTitle: "Inzertní formáty",
    formatsLead:
      "Tabulka je sazebník startovacích formátů. Širší bannery a balíčky jsou na ceníku. Jiné rozměry po dohodě.",
    formatCol: "Formát",
    placeCol: "Umístění",
    priceCol: "Listová cena",
    noteCol: "Poznámka",
    formats: [
      { name: "Native banner", place: "Homepage a článek", note: "Měsíční rotace, označené" },
      { name: "Sponzorovaný článek", place: "Magazín Veřejnost", note: "Jednorázově, vždy s označením partnera" },
      { name: "Mention v newsletteru", place: "Týdenní brief", note: "Za vydání" },
      { name: "Kosmetický hub", place: "/verejnost/clanky?topic=kosmetika", note: "Měsíční přítomnost, označené" },
    ],
    packagesTitle: "Kombinované balíčky",
    packagesLead: "Starter, Clinical a Congress jsou na ceníku. Enterprise a API řešíme individuálně.",
    cleanTitle: "Co se tu neprodává",
    cleanBody:
      "Lékařská zóna, OrdiZapis a studentská Academy jsou bez AdSense i affiliate. Inzerce patří do magazínu ViaLongeVita, s jasným označením.",
    contactTitle: "Objednávka",
    contactBody: "Napište termín, formát a odkaz na značku. Odpovíme sazbou a volným termínem.",
    contactEmail: EMAIL,
    contactForm: "Odeslat poptávku",
    rateCard: "Otevřít kompletní ceník",
    perIssue: "/ vydání",
  },
  de: {
    letterEyebrow: "Brief an Partner",
    letterTitle: "Digitales Healthspan-Magazin — keine Druckauflage",
    letterBody: [
      "ViaLongeVita erscheint auf MedScopeGlobal.com. Leser kommen für klare Texte zu Schlaf, Bewegung, Ernährung und Prävention — ohne Wunderversprechen.",
      "Wir verkaufen nur Formate, die die Seite wirklich trägt: Native Banner, gekennzeichneter Partnertext, Newsletter-Mention und Kosmetik-Hub. Arzt- und Studentenzone bleiben werbefrei.",
      "Wir erfinden hier keine Uniques und kopieren kein fremdes Media-Kit. Die Preise unten sind Listensätze; die Bestellung läuft über das Formular.",
    ],
    audienceTitle: "Wen die Texte treffen",
    audienceLead:
      "Wir verkaufen keine Demografietabelle von einer anderen Site. Wir beschreiben Themen, die das Magazin wirklich schreibt.",
    audienceItems: [
      { label: "Prävention und 40+", body: "Leser, die ruhige Gewohnheiten suchen, kein Biohacking." },
      { label: "Schlaf und Bewegung", body: "Rubriken, die Startseite und Magazin wiederholen." },
      { label: "Ernährung und Kosmetik", body: "Gekennzeichnete Partnerschaft nur, wo das Thema passt — nicht in der Praxis." },
    ],
    digitalTitle: "Nur digital",
    digitalBody:
      "ViaLongeVita hat keine Printausgabe, keinen Kioskverkauf und kein Klub-Monatsheft. Kampagnen laufen auf der Site, im Artikel und im Newsletter.",
    formatsTitle: "Werbeformate",
    formatsLead:
      "Die Tabelle ist der Einstiegstarif. Breitere Banner und Pakete stehen in der Preisliste. Andere Maße nach Absprache.",
    formatCol: "Format",
    placeCol: "Platzierung",
    priceCol: "Listenpreis",
    noteCol: "Hinweis",
    formats: [
      { name: "Native Banner", place: "Startseite und Artikel", note: "Monatliche Rotation, gekennzeichnet" },
      { name: "Gesponserter Artikel", place: "Magazin Öffentlichkeit", note: "Einmalig, immer als Partnertext" },
      { name: "Newsletter-Mention", place: "Wochenbrief", note: "Pro Ausgabe" },
      { name: "Kosmetik-Hub", place: "/verejnost/clanky?topic=kosmetika", note: "Monatliche Präsenz, gekennzeichnet" },
    ],
    packagesTitle: "Kombinationspakete",
    packagesLead: "Starter, Clinical und Congress stehen in der Preisliste. Enterprise und API individuell.",
    cleanTitle: "Was hier nicht verkauft wird",
    cleanBody:
      "Arztzone, OrdiZapis und Academy bleiben ohne AdSense und Affiliate. Werbung gehört ins Magazin ViaLongeVita, klar gekennzeichnet.",
    contactTitle: "Bestellung",
    contactBody: "Schreiben Sie Termin, Format und Markenlink. Wir antworten mit Satz und freiem Slot.",
    contactEmail: EMAIL,
    contactForm: "Anfrage senden",
    rateCard: "Vollständige Preisliste öffnen",
    perIssue: "/ Ausgabe",
  },
  fr: {
    letterEyebrow: "Lettre aux partenaires",
    letterTitle: "Magazine numérique healthspan — pas de tirage papier",
    letterBody: [
      "ViaLongeVita paraît sur MedScopeGlobal.com. Les lecteurs viennent pour des textes clairs sur le sommeil, le mouvement, l’alimentation et la prévention — sans promesse miracle.",
      "Nous ne vendons que des formats que le site porte vraiment : bannière native, article partenaire signalé, mention newsletter et hub cosmétique. Les zones médecin et étudiant restent sans publicité.",
      "Nous n’inventons pas d’uniques ici et nous ne reprenons pas le kit d’un autre titre. Les prix ci-dessous sont des tarifs listés ; la commande passe par le formulaire.",
    ],
    audienceTitle: "Qui croise ces textes",
    audienceLead:
      "Nous ne vendons pas le tableau démographique d’un autre site. Nous décrivons les sujets que le magazine écrit vraiment.",
    audienceItems: [
      { label: "Prévention et 40+", body: "Des lecteurs qui cherchent des habitudes calmes, pas du biohacking." },
      { label: "Sommeil et mouvement", body: "Des rubriques que l’accueil et le magazine répètent." },
      { label: "Nutrition et cosmétique", body: "Partenariat signalé seulement si le sujet tient — pas au cabinet." },
    ],
    digitalTitle: "Numérique seulement",
    digitalBody:
      "ViaLongeVita n’a pas d’édition papier, ni de vente en kiosque, ni de mensuel club. Les campagnes passent par le site, l’article et la newsletter.",
    formatsTitle: "Formats publicitaires",
    formatsLead:
      "Le tableau est le tarif d’entrée. Bannières plus larges et packs sont sur la grille. Autres formats sur demande.",
    formatCol: "Format",
    placeCol: "Emplacement",
    priceCol: "Prix liste",
    noteCol: "Note",
    formats: [
      { name: "Bannière native", place: "Accueil et article", note: "Rotation mensuelle, signalée" },
      { name: "Article sponsorisé", place: "Magazine grand public", note: "Une fois, toujours signalé" },
      { name: "Mention newsletter", place: "Brief hebdomadaire", note: "Par numéro" },
      { name: "Hub cosmétique", place: "/verejnost/clanky?topic=kosmetika", note: "Présence mensuelle, signalée" },
    ],
    packagesTitle: "Packs combinés",
    packagesLead: "Starter, Clinical et Congress sont sur la grille. Enterprise et API au cas par cas.",
    cleanTitle: "Ce qui ne se vend pas ici",
    cleanBody:
      "La zone médecin, OrdiZapis et l’Academy restent sans AdSense ni affiliation. La publicité reste dans le magazine ViaLongeVita, clairement signalée.",
    contactTitle: "Commande",
    contactBody: "Indiquez la date, le format et le lien de la marque. Nous répondons avec le tarif et un créneau.",
    contactEmail: EMAIL,
    contactForm: "Envoyer une demande",
    rateCard: "Ouvrir la grille complète",
    perIssue: "/ numéro",
  },
  en: {
    letterEyebrow: "Note to partners",
    letterTitle: "A digital healthspan magazine — not a print run",
    letterBody: [
      "ViaLongeVita publishes on MedScopeGlobal.com. Readers come for plain pieces on sleep, movement, food and prevention — not miracle claims.",
      "We only sell formats the site actually runs: native banner, labelled sponsored article, newsletter mention and the skincare hub. Physician and student rooms stay ad-free.",
      "We do not invent unique users here and we do not reprint another title’s kit. Prices below are list rates; orders go through the form.",
    ],
    audienceTitle: "Who the pieces meet",
    audienceLead:
      "We are not selling another site’s demographic table. We describe the topics the magazine actually writes.",
    audienceItems: [
      { label: "Prevention and 40+", body: "Readers looking for calm habits, not biohacking." },
      { label: "Sleep and movement", body: "Rubrics the homepage and magazine keep repeating." },
      { label: "Nutrition and skincare", body: "Labelled partnership only where the topic fits — not in clinic rooms." },
    ],
    digitalTitle: "Digital only",
    digitalBody:
      "ViaLongeVita has no print edition, newsstand sale or club monthly. Campaigns run on the site, in the article and in the newsletter.",
    formatsTitle: "Ad formats",
    formatsLead:
      "The table is the starter rate card. Wider banners and packs sit on the full list. Other sizes on request.",
    formatCol: "Format",
    placeCol: "Placement",
    priceCol: "List price",
    noteCol: "Note",
    formats: [
      { name: "Native banner", place: "Homepage and article", note: "Monthly rotation, labelled" },
      { name: "Sponsored article", place: "Public magazine", note: "Once, always labelled as a partner piece" },
      { name: "Newsletter mention", place: "Weekly brief", note: "Per issue" },
      { name: "Skincare hub", place: "/verejnost/clanky?topic=kosmetika", note: "Monthly presence, labelled" },
    ],
    packagesTitle: "Combined packages",
    packagesLead: "Starter, Clinical and Congress are on the rate card. Enterprise and API are quoted case by case.",
    cleanTitle: "What is not for sale here",
    cleanBody:
      "The physician room, OrdiZapis and the student Academy stay without AdSense or affiliates. Advertising belongs on ViaLongeVita, clearly labelled.",
    contactTitle: "Book a campaign",
    contactBody: "Send a date, format and brand link. We reply with the rate and an open slot.",
    contactEmail: EMAIL,
    contactForm: "Send a request",
    rateCard: "Open the full rate card",
    perIssue: "/ issue",
  },
  it: {
    letterEyebrow: "Nota ai partner",
    letterTitle: "Magazine digitale healthspan — non una tiratura cartacea",
    letterBody: [
      "ViaLongeVita esce su MedScopeGlobal.com. I lettori arrivano per testi chiari su sonno, movimento, cibo e prevenzione — senza promesse miracolose.",
      "Vendiamo solo formati che il sito gestisce davvero: banner nativo, articolo partner segnalato, menzione newsletter e hub cosmetico. Le zone medici e studenti restano senza ads.",
      "Qui non inventiamo unici e non ricopiamo il kit di un altro titolo. I prezzi sotto sono listino; l’ordine passa dal modulo.",
    ],
    audienceTitle: "Chi incontra i testi",
    audienceLead:
      "Non vendiamo la tabella demografica di un altro sito. Descriviamo i temi che il magazine scrive davvero.",
    audienceItems: [
      { label: "Prevenzione e over 40", body: "Lettori che cercano abitudini calme, non biohacking." },
      { label: "Sonno e movimento", body: "Rubriche che home e magazine ripetono." },
      { label: "Nutrizione e cosmesi", body: "Partnership segnalata solo dove il tema regge — non in ambulatorio." },
    ],
    digitalTitle: "Solo digitale",
    digitalBody:
      "ViaLongeVita non ha edizione cartacea, edicola o mensile club. Le campagne passano dal sito, dall’articolo e dalla newsletter.",
    formatsTitle: "Formati pubblicitari",
    formatsLead:
      "La tabella è il listino d’ingresso. Banner più ampi e pacchetti sono sul listino. Altri formati su richiesta.",
    formatCol: "Formato",
    placeCol: "Posizione",
    priceCol: "Prezzo listino",
    noteCol: "Nota",
    formats: [
      { name: "Banner nativo", place: "Home e articolo", note: "Rotazione mensile, segnalato" },
      { name: "Articolo sponsorizzato", place: "Magazine pubblico", note: "Una volta, sempre segnalato" },
      { name: "Menzione newsletter", place: "Brief settimanale", note: "Per numero" },
      { name: "Hub cosmetico", place: "/verejnost/clanky?topic=kosmetika", note: "Presenza mensile, segnalata" },
    ],
    packagesTitle: "Pacchetti combinati",
    packagesLead: "Starter, Clinical e Congress sono sul listino. Enterprise e API su preventivo.",
    cleanTitle: "Cosa non si vende qui",
    cleanBody:
      "La zona medici, OrdiZapis e l’Academy restano senza AdSense né affiliate. La pubblicità sta sul magazine ViaLongeVita, segnalata.",
    contactTitle: "Prenota una campagna",
    contactBody: "Invia data, formato e link del brand. Rispondiamo con tariffa e slot libero.",
    contactEmail: EMAIL,
    contactForm: "Invia richiesta",
    rateCard: "Apri il listino completo",
    perIssue: "/ numero",
  },
  es: {
    letterEyebrow: "Nota a los socios",
    letterTitle: "Revista digital de healthspan — sin tirada impresa",
    letterBody: [
      "ViaLongeVita se publica en MedScopeGlobal.com. Los lectores vienen por textos claros sobre sueño, movimiento, comida y prevención — sin promesas milagro.",
      "Solo vendemos formatos que el sitio realmente sirve: banner nativo, artículo socio señalado, mención en newsletter y hub cosmético. Las zonas médica y estudiantil siguen sin anuncios.",
      "Aquí no inventamos uniques ni copiamos el kit de otro título. Los precios de abajo son de lista; el pedido va por el formulario.",
    ],
    audienceTitle: "A quién llegan los textos",
    audienceLead:
      "No vendemos la tabla demográfica de otro sitio. Describimos los temas que la revista escribe de verdad.",
    audienceItems: [
      { label: "Prevención y +40", body: "Lectores que buscan hábitos calmos, no biohacking." },
      { label: "Sueño y movimiento", body: "Rúbricas que la portada y la revista repiten." },
      { label: "Nutrición y cosmética", body: "Alianza señalada solo si el tema encaja — no en consulta." },
    ],
    digitalTitle: "Solo digital",
    digitalBody:
      "ViaLongeVita no tiene edición impresa, quiosco ni mensual de club. Las campañas van en el sitio, el artículo y el boletín.",
    formatsTitle: "Formatos publicitarios",
    formatsLead:
      "La tabla es la tarifa de entrada. Banners más amplios y packs están en la lista. Otros tamaños bajo pedido.",
    formatCol: "Formato",
    placeCol: "Ubicación",
    priceCol: "Precio de lista",
    noteCol: "Nota",
    formats: [
      { name: "Banner nativo", place: "Portada y artículo", note: "Rotación mensual, señalado" },
      { name: "Artículo patrocinado", place: "Revista pública", note: "Una vez, siempre señalado" },
      { name: "Mención newsletter", place: "Brief semanal", note: "Por número" },
      { name: "Hub cosmético", place: "/verejnost/clanky?topic=kosmetika", note: "Presencia mensual, señalada" },
    ],
    packagesTitle: "Paquetes combinados",
    packagesLead: "Starter, Clinical y Congress están en la lista. Enterprise y API bajo presupuesto.",
    cleanTitle: "Lo que no se vende aquí",
    cleanBody:
      "La zona médica, OrdiZapis y la Academy siguen sin AdSense ni afiliados. La publicidad está en ViaLongeVita, claramente señalada.",
    contactTitle: "Reservar una campaña",
    contactBody: "Envíe fecha, formato y enlace de la marca. Respondemos con tarifa y hueco libre.",
    contactEmail: EMAIL,
    contactForm: "Enviar solicitud",
    rateCard: "Abrir la lista completa",
    perIssue: "/ número",
  },
  "pt-BR": {
    letterEyebrow: "Nota aos parceiros",
    letterTitle: "Revista digital de healthspan — sem tiragem impressa",
    letterBody: [
      "ViaLongeVita sai em MedScopeGlobal.com. Os leitores vêm por textos claros sobre sono, movimento, comida e prevenção — sem promessa milagre.",
      "Vendemos só formatos que o site realmente serve: banner nativo, artigo parceiro sinalizado, menção na newsletter e hub de cosmética. As zonas médica e estudantil ficam sem anúncios.",
      "Não inventamos uniques aqui e não copiamos o kit de outro título. Os preços abaixo são de lista; o pedido passa pelo formulário.",
    ],
    audienceTitle: "Quem os textos encontram",
    audienceLead:
      "Não vendemos a tabela demográfica de outro site. Descrevemos os temas que a revista escreve de fato.",
    audienceItems: [
      { label: "Prevenção e 40+", body: "Leitores que buscam hábitos calmos, não biohacking." },
      { label: "Sono e movimento", body: "Rubricas que a capa e a revista repetem." },
      { label: "Nutrição e cosmética", body: "Parceria sinalizada só onde o tema cabe — não no consultório." },
    ],
    digitalTitle: "Só digital",
    digitalBody:
      "ViaLongeVita não tem edição impressa, banca nem mensal de clube. As campanhas correm no site, no artigo e na newsletter.",
    formatsTitle: "Formatos publicitários",
    formatsLead:
      "A tabela é a tarifa de entrada. Banners mais largos e pacotes estão na lista. Outros tamanhos sob consulta.",
    formatCol: "Formato",
    placeCol: "Posição",
    priceCol: "Preço de lista",
    noteCol: "Nota",
    formats: [
      { name: "Banner nativo", place: "Home e artigo", note: "Rotação mensal, sinalizado" },
      { name: "Artigo patrocinado", place: "Revista pública", note: "Uma vez, sempre sinalizado" },
      { name: "Menção na newsletter", place: "Brief semanal", note: "Por edição" },
      { name: "Hub de cosmética", place: "/verejnost/clanky?topic=kosmetika", note: "Presença mensal, sinalizada" },
    ],
    packagesTitle: "Pacotes combinados",
    packagesLead: "Starter, Clinical e Congress estão na lista. Enterprise e API sob orçamento.",
    cleanTitle: "O que não se vende aqui",
    cleanBody:
      "A zona médica, OrdiZapis e a Academy ficam sem AdSense nem afiliados. A publicidade fica na ViaLongeVita, claramente sinalizada.",
    contactTitle: "Reservar uma campanha",
    contactBody: "Envie data, formato e link da marca. Respondemos com tarifa e horário livre.",
    contactEmail: EMAIL,
    contactForm: "Enviar pedido",
    rateCard: "Abrir a lista completa",
    perIssue: "/ edição",
  },
};

export function getMediaKitCopy(locale?: string | null): MediaKitCopy {
  return localizeListedCzkIn(COPY[chromePack(locale)], locale);
}
