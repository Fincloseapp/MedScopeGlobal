#!/usr/bin/env node
/**
 * One-off scaffold for global locale common.json files.
 * Run: node scripts/scaffold-global-locales.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LOCALES = [
  "sk",
  "de",
  "fr",
  "it",
  "es",
  "pl",
  "ro",
  "hu",
  "ru",
  "uk",
  "zh-CN",
  "ja",
  "ko",
  "vi",
  "id",
  "be",
  "pt",
  "ar",
  "hi",
];

/** @type {Record<string, Record<string, unknown>>} */
const COPY = {
  sk: {
    tagline: "Klinická inteligencia a medicína založená na dôkazoch",
    nav: {
      home: "Domov",
      magazine: "Magazín",
      pricing: "Cenník",
      welcome: "O platforme",
      sections: "Sekcie",
      access: "Úrovne prístupu",
      specialties: "Odbory",
      articles: "Články",
      search: "Hľadať",
      login: "Prihlásiť",
      signup: "Registrácia",
      audiences: "Pre koho",
      medicine: "Medicína",
      subscribe: "Predplatné",
    },
    cta: {
      readMore: "Čítať viac",
      share: "Zdieľať",
      supportAuthor: "Podporiť autora",
      saveToMediFlow: "Uložiť do MediFlow",
      tryFree: "14-dňová skúšobná verzia zdarma",
      upgradeVip: "Prejsť na VIP",
      exploreProtocols: "Preskúmať protokoly",
    },
    disclaimer: {
      medical:
        "Obsah nie je lekárska diagnóza ani liečebné odporúčanie. Vždy konzultujte so svojím lekárom.",
    },
    vip: {
      title: "VIP longevity protokoly",
      subtitle: "10 protokolov založených na dôkazoch pre spánok, metabolizmus, imunitu a dlhovekosť.",
      price: "5,99 €/mesiac",
    },
    contribution: {
      title: "Podporiť autora · Tip",
      subtitle:
        "Voliteľný mikro-príspevok — ako prepitné v reštaurácii. Ďakujeme redakcii.",
      custom: "Vlastné",
      vipUpsell: "VIP Longevity je samostatné platené predplatné —",
      unavailable: "Tip momentálne nie je k dispozícii.",
      tip: "Podporte redakciu príspevkom",
      exploreVip: "alebo preskúmajte VIP longevity protokoly",
    },
    donation: {
      title: "Podporiť autora",
      subtitle: "Mikro-dar pomáha pokračovať v tvorbe kvalitného obsahu.",
      amounts: ["€2", "€5", "€9.90"],
      custom: "Vlastná suma",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Váš osobný wellness denník",
      description:
        "Ukladajte články, sledujte príznaky a doplnky. Nie na diagnózu — pre vlastný prehľad.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Záznam v mobile — AI píše poznámku",
      description:
        "Profesionálny nástroj dokumentácie pre lekárov. GDPR, šifrované.",
    },
    trends: {
      title: "Trendy 2026–2027",
      glp1: "GLP-1 a metabolizmus",
      biohacking: "Biohacking pre začiatočníkov",
      sleep: "Optimalizácia spánku",
      mental: "Mentálne wellness",
    },
  },
  de: {
    tagline: "Klinische Intelligenz und evidenzbasierte Medizin",
    nav: {
      home: "Start",
      magazine: "Magazin",
      pricing: "Preise",
      welcome: "Plattform",
      sections: "Bereiche",
      access: "Zugangsstufen",
      specialties: "Fachgebiete",
      articles: "Artikel",
      search: "Suchen",
      login: "Anmelden",
      signup: "Registrieren",
      audiences: "Für wen",
      medicine: "Medizin",
      subscribe: "Abonnement",
    },
    cta: {
      readMore: "Weiterlesen",
      share: "Teilen",
      supportAuthor: "Autor unterstützen",
      saveToMediFlow: "In MediFlow speichern",
      tryFree: "14 Tage kostenlos testen",
      upgradeVip: "VIP upgraden",
      exploreProtocols: "Protokolle entdecken",
    },
    disclaimer: {
      medical:
        "Der Inhalt stellt keine medizinische Diagnose oder Behandlungsempfehlung dar. Konsultieren Sie immer Ihren Arzt.",
    },
    vip: {
      title: "VIP Longevity-Protokolle",
      subtitle:
        "10 evidenzbasierte Protokolle für Schlaf, Stoffwechsel, Immunität und Langlebigkeit.",
      price: "5,99 €/Monat",
    },
    contribution: {
      title: "Autor unterstützen · Tip",
      subtitle:
        "Optionaler Mikrobeitrag — wie ein Trinkgeld im Restaurant. Danke an die Redaktion.",
      custom: "Eigener Betrag",
      vipUpsell: "VIP Longevity ist ein separates bezahltes Abo —",
      unavailable: "Tip ist derzeit nicht verfügbar.",
      tip: "Unterstützen Sie die Redaktion mit einem Contribution",
      exploreVip: "oder entdecken Sie VIP Longevity-Protokolle",
    },
    donation: {
      title: "Autor unterstützen",
      subtitle: "Eine Mikro-Spende hilft, qualitativ hochwertige Inhalte zu erstellen.",
      amounts: ["€2", "€5", "€9.90"],
      custom: "Eigener Betrag",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Ihr persönliches Wellness-Tagebuch",
      description:
        "Artikel speichern, Symptome und Nahrungsergänzung tracken. Keine Diagnose — für den eigenen Überblick.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Mobil aufnehmen — KI schreibt die Notiz",
      description:
        "Professionelles Dokumentationstool für Ärzte. DSGVO-konform, verschlüsselt.",
    },
    trends: {
      title: "Trends 2026–2027",
      glp1: "GLP-1 & Stoffwechsel",
      biohacking: "Biohacking für Einsteiger",
      sleep: "Schlafoptimierung",
      mental: "Mentales Wohlbefinden",
    },
  },
  fr: {
    tagline: "Intelligence clinique et médecine fondée sur les preuves",
    nav: {
      home: "Accueil",
      magazine: "Magazine",
      pricing: "Tarifs",
      welcome: "Plateforme",
      sections: "Sections",
      access: "Niveaux d'accès",
      specialties: "Spécialités",
      articles: "Articles",
      search: "Rechercher",
      login: "Connexion",
      signup: "Inscription",
      audiences: "Pour qui",
      medicine: "Médecine",
      subscribe: "Abonnement",
    },
    cta: {
      readMore: "Lire la suite",
      share: "Partager",
      supportAuthor: "Soutenir l'auteur",
      saveToMediFlow: "Enregistrer dans MediFlow",
      tryFree: "Essai gratuit de 14 jours",
      upgradeVip: "Passer au VIP",
      exploreProtocols: "Explorer les protocoles",
    },
    disclaimer: {
      medical:
        "Le contenu ne constitue pas un diagnostic médical ni une recommandation thérapeutique. Consultez toujours votre médecin.",
    },
    vip: {
      title: "Protocoles VIP longévité",
      subtitle:
        "10 protocoles fondés sur les preuves pour le sommeil, le métabolisme, l'immunité et la longévité.",
      price: "5,99 €/mois",
    },
    contribution: {
      title: "Soutenir l'auteur · Tip",
      subtitle:
        "Micro-contribution optionnelle — comme un pourboire au restaurant. Merci à la rédaction.",
      custom: "Montant libre",
      vipUpsell: "VIP Longevity est un abonnement payant séparé —",
      unavailable: "Tip n'est pas disponible pour le moment.",
      tip: "Soutenez la rédaction avec un tip",
      exploreVip: "ou explorez les protocoles VIP longévité",
    },
    donation: {
      title: "Soutenir l'auteur",
      subtitle: "Un micro-don aide à continuer à créer du contenu de qualité.",
      amounts: ["€2", "€5", "€9.90"],
      custom: "Montant libre",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Votre journal de bien-être personnel",
      description:
        "Enregistrez des articles, suivez symptômes et compléments. Pas un diagnostic — pour votre vue d'ensemble.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Enregistrez sur mobile — l'IA rédige la note",
      description:
        "Outil de documentation professionnelle pour médecins. Conforme RGPD, chiffré.",
    },
    trends: {
      title: "Tendances 2026–2027",
      glp1: "GLP-1 et métabolisme",
      biohacking: "Biohacking pour débutants",
      sleep: "Optimisation du sommeil",
      mental: "Bien-être mental",
    },
  },
  it: {
    tagline: "Intelligenza clinica e medicina basata sulle evidenze",
    nav: {
      home: "Home",
      magazine: "Rivista",
      pricing: "Prezzi",
      welcome: "Piattaforma",
      sections: "Sezioni",
      access: "Livelli di accesso",
      specialties: "Specialità",
      articles: "Articoli",
      search: "Cerca",
      login: "Accedi",
      signup: "Registrati",
      audiences: "Per chi",
      medicine: "Medicina",
      subscribe: "Abbonamento",
    },
    cta: {
      readMore: "Leggi di più",
      share: "Condividi",
      supportAuthor: "Sostieni l'autore",
      saveToMediFlow: "Salva in MediFlow",
      tryFree: "Prova gratuita di 14 giorni",
      upgradeVip: "Passa a VIP",
      exploreProtocols: "Esplora i protocolli",
    },
    disclaimer: {
      medical:
        "Il contenuto non costituisce una diagnosi medica né una raccomandazione terapeutica. Consultare sempre il proprio medico.",
    },
    vip: {
      title: "Protocolli VIP longevità",
      subtitle:
        "10 protocolli basati sulle evidenze per sonno, metabolismo, immunità e longevità.",
      price: "5,99 €/mese",
    },
    contribution: {
      title: "Sostieni l'autore · Tip",
      subtitle:
        "Micro-contributo facoltativo — come una mancia al ristorante. Grazie alla redazione.",
      custom: "Importo personalizzato",
      vipUpsell: "VIP Longevity è un abbonamento a pagamento separato —",
      unavailable: "Tip non è al momento disponibile.",
      tip: "Sostieni la redazione con un tip",
      exploreVip: "o esplora i protocolli VIP longevità",
    },
    donation: {
      title: "Sostieni l'autore",
      subtitle: "Una micro-donazione aiuta a continuare a creare contenuti di qualità.",
      amounts: ["€2", "€5", "€9.90"],
      custom: "Importo personalizzato",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Il tuo diario personale del benessere",
      description:
        "Salva articoli, monitora sintomi e integratori. Non per la diagnosi — per la tua panoramica.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Registra su mobile — l'IA scrive la nota",
      description:
        "Strumento di documentazione professionale per medici. Conforme GDPR, crittografato.",
    },
    trends: {
      title: "Trend 2026–2027",
      glp1: "GLP-1 e metabolismo",
      biohacking: "Biohacking per principianti",
      sleep: "Ottimizzazione del sonno",
      mental: "Benessere mentale",
    },
  },
  es: {
    tagline: "Inteligencia clínica y medicina basada en la evidencia",
    nav: {
      home: "Inicio",
      magazine: "Revista",
      pricing: "Precios",
      welcome: "Plataforma",
      sections: "Secciones",
      access: "Niveles de acceso",
      specialties: "Especialidades",
      articles: "Artículos",
      search: "Buscar",
      login: "Iniciar sesión",
      signup: "Registrarse",
      audiences: "Para quién",
      medicine: "Medicina",
      subscribe: "Suscripción",
    },
    cta: {
      readMore: "Leer más",
      share: "Compartir",
      supportAuthor: "Apoyar al autor",
      saveToMediFlow: "Guardar en MediFlow",
      tryFree: "Prueba gratuita de 14 días",
      upgradeVip: "Actualizar a VIP",
      exploreProtocols: "Explorar protocolos",
    },
    disclaimer: {
      medical:
        "El contenido no constituye un diagnóstico médico ni una recomendación terapéutica. Consulte siempre a su médico.",
    },
    vip: {
      title: "Protocolos VIP de longevidad",
      subtitle:
        "10 protocolos basados en evidencia para sueño, metabolismo, inmunidad y longevidad.",
      price: "5,99 €/mes",
    },
    contribution: {
      title: "Apoyar al autor · Tip",
      subtitle:
        "Micro-aporte opcional — como una propina en un restaurante. Gracias a la redacción.",
      custom: "Importe personalizado",
      vipUpsell: "VIP Longevity es una suscripción de pago aparte —",
      unavailable: "Tip no está disponible en este momento.",
      tip: "Apoye a la redacción con un tip",
      exploreVip: "o explore protocolos VIP de longevidad",
    },
    donation: {
      title: "Apoyar al autor",
      subtitle: "Una micro-donación ayuda a seguir creando contenido de calidad.",
      amounts: ["€2", "€5", "€9.90"],
      custom: "Importe personalizado",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Tu diario personal de bienestar",
      description:
        "Guarda artículos, registra síntomas y suplementos. No para diagnóstico — para tu propia visión.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Graba en móvil — la IA escribe la nota",
      description:
        "Herramienta profesional de documentación para médicos. Cumple GDPR, cifrada.",
    },
    trends: {
      title: "Tendencias 2026–2027",
      glp1: "GLP-1 y metabolismo",
      biohacking: "Biohacking para principiantes",
      sleep: "Optimización del sueño",
      mental: "Bienestar mental",
    },
  },
  pl: {
    tagline: "Inteligencja kliniczna i medycyna oparta na dowodach",
    nav: {
      home: "Strona główna",
      magazine: "Magazyn",
      pricing: "Cennik",
      welcome: "Platforma",
      sections: "Sekcje",
      access: "Poziomy dostępu",
      specialties: "Specjalizacje",
      articles: "Artykuły",
      search: "Szukaj",
      login: "Zaloguj",
      signup: "Rejestracja",
      audiences: "Dla kogo",
      medicine: "Medycyna",
      subscribe: "Subskrypcja",
    },
    cta: {
      readMore: "Czytaj więcej",
      share: "Udostępnij",
      supportAuthor: "Wesprzyj autora",
      saveToMediFlow: "Zapisz w MediFlow",
      tryFree: "14-dniowy bezpłatny okres próbny",
      upgradeVip: "Przejdź na VIP",
      exploreProtocols: "Poznaj protokoły",
    },
    disclaimer: {
      medical:
        "Treść nie stanowi diagnozy medycznej ani zaleceń terapeutycznych. Zawsze konsultuj z lekarzem.",
    },
    vip: {
      title: "Protokoły VIP longevity",
      subtitle:
        "10 protokołów opartych na dowodach dla snu, metabolizmu, odporności i długowieczności.",
      price: "29 zł/miesiąc",
    },
    contribution: {
      title: "Wesprzyj autora · Tip",
      subtitle:
        "Opcjonalny mikro-wkład — jak napiwek w restauracji. Dziękujemy redakcji.",
      custom: "Własna kwota",
      vipUpsell: "VIP Longevity to osobna płatna subskrypcja —",
      unavailable: "Tip jest obecnie niedostępny.",
      tip: "Wesprzyj redakcję contribution",
      exploreVip: "lub poznaj protokoły VIP longevity",
    },
    donation: {
      title: "Wesprzyj autora",
      subtitle: "Mikro-dar pomaga tworzyć wysokiej jakości treści.",
      amounts: ["10 zł", "25 zł", "49 zł"],
      custom: "Własna kwota",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Twój osobisty dziennik wellness",
      description:
        "Zapisuj artykuły, śledź objawy i suplementy. Nie do diagnozy — dla własnego przeglądu.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Nagraj na mobile — AI pisze notatkę",
      description:
        "Profesjonalne narzędzie dokumentacji dla lekarzy. Zgodne z RODO, szyfrowane.",
    },
    trends: {
      title: "Trendy 2026–2027",
      glp1: "GLP-1 i metabolizm",
      biohacking: "Biohacking dla początkujących",
      sleep: "Optymalizacja snu",
      mental: "Dobrostan psychiczny",
    },
  },
  ro: {
    tagline: "Inteligență clinică și medicină bazată pe dovezi",
    nav: {
      home: "Acasă",
      magazine: "Revistă",
      pricing: "Prețuri",
      welcome: "Platformă",
      sections: "Secțiuni",
      access: "Niveluri de acces",
      specialties: "Specialități",
      articles: "Articole",
      search: "Căutare",
      login: "Autentificare",
      signup: "Înregistrare",
      audiences: "Pentru cine",
      medicine: "Medicină",
      subscribe: "Abonament",
    },
    cta: {
      readMore: "Citește mai mult",
      share: "Distribuie",
      supportAuthor: "Susține autorul",
      saveToMediFlow: "Salvează în MediFlow",
      tryFree: "Probă gratuită de 14 zile",
      upgradeVip: "Upgrade la VIP",
      exploreProtocols: "Explorează protocoalele",
    },
    disclaimer: {
      medical:
        "Conținutul nu reprezintă un diagnostic medical sau o recomandare terapeutică. Consultați întotdeauna medicul.",
    },
    vip: {
      title: "Protocoale VIP longevitate",
      subtitle:
        "10 protocoale bazate pe dovezi pentru somn, metabolism, imunitate și longevitate.",
      price: "29 lei/lună",
    },
    contribution: {
      title: "Susține autorul · Tip",
      subtitle:
        "Micro-contribuție opțională — ca un bacșiș la restaurant. Mulțumim redacției.",
      custom: "Sumă personalizată",
      vipUpsell: "VIP Longevity este un abonament plătit separat —",
      unavailable: "Tip nu este disponibil momentan.",
      tip: "Susține redacția cu un tip",
      exploreVip: "sau explorează protocoalele VIP longevitate",
    },
    donation: {
      title: "Susține autorul",
      subtitle: "O micro-donație ajută la crearea de conținut de calitate.",
      amounts: ["10 lei", "25 lei", "49 lei"],
      custom: "Sumă personalizată",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Jurnalul tău personal de wellness",
      description:
        "Salvează articole, urmărește simptome și suplimente. Nu pentru diagnostic — pentru propria imagine de ansamblu.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Înregistrează pe mobil — AI scrie nota",
      description:
        "Instrument profesional de documentare pentru medici. Conform GDPR, criptat.",
    },
    trends: {
      title: "Tendințe 2026–2027",
      glp1: "GLP-1 și metabolism",
      biohacking: "Biohacking pentru începători",
      sleep: "Optimizarea somnului",
      mental: "Bunăstare mentală",
    },
  },
  hu: {
    tagline: "Klinikai intelligencia és evidencián alapuló orvostudomány",
    nav: {
      home: "Kezdőlap",
      magazine: "Magazin",
      pricing: "Árak",
      welcome: "Platform",
      sections: "Szekciók",
      access: "Hozzáférési szintek",
      specialties: "Szakterületek",
      articles: "Cikkek",
      search: "Keresés",
      login: "Bejelentkezés",
      signup: "Regisztráció",
      audiences: "Kinek",
      medicine: "Orvostudomány",
      subscribe: "Előfizetés",
    },
    cta: {
      readMore: "Tovább olvasom",
      share: "Megosztás",
      supportAuthor: "Szerző támogatása",
      saveToMediFlow: "Mentés MediFlow-ba",
      tryFree: "14 napos ingyenes próba",
      upgradeVip: "VIP frissítés",
      exploreProtocols: "Protokollok felfedezése",
    },
    disclaimer: {
      medical:
        "A tartalom nem minősül orvosi diagnózisnak vagy kezelési javaslatnak. Mindig konzultáljon orvosával.",
    },
    vip: {
      title: "VIP longevity protokollok",
      subtitle:
        "10 evidencián alapuló protokoll alvásra, anyagcserére, immunitásra és hosszú életre.",
      price: "1 990 Ft/hó",
    },
    contribution: {
      title: "Szerző támogatása · Tip",
      subtitle:
        "Opcionális mikro-hozzájárulás — mint egy borravaló étteremben. Köszönjük a szerkesztőségnek.",
      custom: "Egyedi összeg",
      vipUpsell: "A VIP Longevity külön fizetős előfizetés —",
      unavailable: "A Tip jelenleg nem elérhető.",
      tip: "Támogassa a szerkesztőséget contribution",
      exploreVip: "vagy fedezze fel a VIP longevity protokollokat",
    },
    donation: {
      title: "Szerző támogatása",
      subtitle: "Egy mikroadomány segít minőségi tartalom készítésében.",
      amounts: ["800 Ft", "2 000 Ft", "3 900 Ft"],
      custom: "Egyedi összeg",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Személyes wellness napló",
      description:
        "Mentsen cikkeket, kövessen tüneteket és kiegészítőket. Nem diagnózisra — saját áttekintéshez.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Rögzítés mobilon — az AI írja a jegyzetet",
      description:
        "Professzionális dokumentációs eszköz orvosoknak. GDPR-kompatibilis, titkosított.",
    },
    trends: {
      title: "Trendek 2026–2027",
      glp1: "GLP-1 és anyagcsere",
      biohacking: "Biohacking kezdőknek",
      sleep: "Alvásoptimalizálás",
      mental: "Mentális jólét",
    },
  },
  ru: {
    tagline: "Клиническая аналитика и доказательная медицина",
    nav: {
      home: "Главная",
      magazine: "Журнал",
      pricing: "Цены",
      welcome: "Платформа",
      sections: "Разделы",
      access: "Уровни доступа",
      specialties: "Специальности",
      articles: "Статьи",
      search: "Поиск",
      login: "Войти",
      signup: "Регистрация",
      audiences: "Для кого",
      medicine: "Медицина",
      subscribe: "Подписка",
    },
    cta: {
      readMore: "Читать далее",
      share: "Поделиться",
      supportAuthor: "Поддержать автора",
      saveToMediFlow: "Сохранить в MediFlow",
      tryFree: "14 дней бесплатно",
      upgradeVip: "Перейти на VIP",
      exploreProtocols: "Изучить протоколы",
    },
    disclaimer: {
      medical:
        "Контент не является медицинским диагнозом или рекомендацией по лечению. Всегда консультируйтесь с врачом.",
    },
    vip: {
      title: "VIP протоколы долголетия",
      subtitle:
        "10 протоколов на основе доказательств для сна, метаболизма, иммунитета и долголетия.",
      price: "299 ₽/мес",
    },
    contribution: {
      title: "Поддержать автора · Tip",
      subtitle:
        "Добровольный микровзнос — как чаевые в ресторане. Спасибо редакции.",
      custom: "Своя сумма",
      vipUpsell: "VIP Longevity — отдельная платная подписка —",
      unavailable: "Tip сейчас недоступен.",
      tip: "Поддержите редакцию contribution",
      exploreVip: "или изучите VIP протоколы долголетия",
    },
    donation: {
      title: "Поддержать автора",
      subtitle: "Микропожертвование помогает создавать качественный контент.",
      amounts: ["100 ₽", "250 ₽", "490 ₽"],
      custom: "Своя сумма",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Ваш личный wellness-дневник",
      description:
        "Сохраняйте статьи, отслеживайте симптомы и добавки. Не для диагноза — для собственного обзора.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Запись на мобильном — ИИ пишет заметку",
      description:
        "Профессиональный инструмент документирования для врачей. GDPR, шифрование.",
    },
    trends: {
      title: "Тренды 2026–2027",
      glp1: "GLP-1 и метаболизм",
      biohacking: "Биохакинг для начинающих",
      sleep: "Оптимизация сна",
      mental: "Ментальное благополучие",
    },
  },
  uk: {
    tagline: "Клінічна аналітика та доказова медицина",
    nav: {
      home: "Головна",
      magazine: "Журнал",
      pricing: "Ціни",
      welcome: "Платформа",
      sections: "Розділи",
      access: "Рівні доступу",
      specialties: "Спеціальності",
      articles: "Статті",
      search: "Пошук",
      login: "Увійти",
      signup: "Реєстрація",
      audiences: "Для кого",
      medicine: "Медицина",
      subscribe: "Підписка",
    },
    cta: {
      readMore: "Читати далі",
      share: "Поділитися",
      supportAuthor: "Підтримати автора",
      saveToMediFlow: "Зберегти в MediFlow",
      tryFree: "14 днів безкоштовно",
      upgradeVip: "Перейти на VIP",
      exploreProtocols: "Переглянути протоколи",
    },
    disclaimer: {
      medical:
        "Контент не є медичним діагнозом чи рекомендацією щодо лікування. Завжди консультуйтеся з лікарем.",
    },
    vip: {
      title: "VIP протоколи довголіття",
      subtitle:
        "10 протоколів на основі доказів для сну, метаболізму, імунітету та довголіття.",
      price: "149 ₴/міс",
    },
    contribution: {
      title: "Підтримати автора · Tip",
      subtitle:
        "Добровільний мікровнесок — як чайові в ресторані. Дякуємо редакції.",
      custom: "Своя сума",
      vipUpsell: "VIP Longevity — окрема платна підписка —",
      unavailable: "Tip зараз недоступний.",
      tip: "Підтримайте редакцію contribution",
      exploreVip: "або перегляньте VIP протоколи довголіття",
    },
    donation: {
      title: "Підтримати автора",
      subtitle: "Мікропожертва допомагає створювати якісний контент.",
      amounts: ["100 ₴", "250 ₴", "490 ₴"],
      custom: "Своя сума",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Ваш особистий wellness-щоденник",
      description:
        "Зберігайте статті, відстежуйте симптоми та добавки. Не для діагнозу — для власного огляду.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Запис на мобільному — ШІ пише нотатку",
      description:
        "Професійний інструмент документування для лікарів. GDPR, шифрування.",
    },
    trends: {
      title: "Тренди 2026–2027",
      glp1: "GLP-1 і метаболізм",
      biohacking: "Біохакінг для початківців",
      sleep: "Оптимізація сну",
      mental: "Ментальне благополуччя",
    },
  },
  "zh-CN": {
    tagline: "临床智能与循证医学",
    nav: {
      home: "首页",
      magazine: "杂志",
      pricing: "定价",
      welcome: "平台",
      sections: "栏目",
      access: "访问级别",
      specialties: "专科",
      articles: "文章",
      search: "搜索",
      login: "登录",
      signup: "注册",
      audiences: "面向人群",
      medicine: "医学",
      subscribe: "订阅",
    },
    cta: {
      readMore: "阅读更多",
      share: "分享",
      supportAuthor: "支持作者",
      saveToMediFlow: "保存到 MediFlow",
      tryFree: "14 天免费试用",
      upgradeVip: "升级 VIP",
      exploreProtocols: "探索方案",
    },
    disclaimer: {
      medical: "本内容不构成医疗诊断或治疗建议。请务必咨询您的医生。",
    },
    vip: {
      title: "VIP 长寿方案",
      subtitle: "10 个基于证据的睡眠、代谢、免疫与长寿方案。",
      price: "¥25/月",
    },
    contribution: {
      title: "支持作者 · Tip",
      subtitle: "可选微捐赠——如同餐厅小费。感谢编辑部。",
      custom: "自定义",
      vipUpsell: "VIP Longevity 是单独的付费订阅 —",
      unavailable: "Tip 目前不可用。",
      tip: "用 tip 支持编辑部",
      exploreVip: "或探索 VIP 长寿方案",
    },
    donation: {
      title: "支持作者",
      subtitle: "微捐赠有助于持续创作优质内容。",
      amounts: ["¥10", "¥25", "¥49"],
      custom: "自定义金额",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "您的个人健康日记",
      description: "保存文章、跟踪症状和补充剂。非诊断用途——供个人概览。",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "手机录音——AI 撰写记录",
      description: "面向医生的专业文档工具。符合 GDPR，加密存储。",
    },
    trends: {
      title: "2026–2027 趋势",
      glp1: "GLP-1 与代谢",
      biohacking: "初学者生物黑客",
      sleep: "睡眠优化",
      mental: "心理健康",
    },
  },
  ja: {
    tagline: "臨床インテリジェンスとエビデンスに基づく医学",
    nav: {
      home: "ホーム",
      magazine: "マガジン",
      pricing: "料金",
      welcome: "プラットフォーム",
      sections: "セクション",
      access: "アクセスレベル",
      specialties: "専門分野",
      articles: "記事",
      search: "検索",
      login: "ログイン",
      signup: "登録",
      audiences: "対象者",
      medicine: "医学",
      subscribe: "購読",
    },
    cta: {
      readMore: "続きを読む",
      share: "共有",
      supportAuthor: "著者を支援",
      saveToMediFlow: "MediFlow に保存",
      tryFree: "14日間無料トライアル",
      upgradeVip: "VIP にアップグレード",
      exploreProtocols: "プロトコルを見る",
    },
    disclaimer: {
      medical:
        "このコンテンツは医学的診断や治療の推奨ではありません。必ず医師にご相談ください。",
    },
    vip: {
      title: "VIP ロンジェビティプロトコル",
      subtitle: "睡眠、代謝、免疫、長寿のための10のエビデンスベースプロトコル。",
      price: "¥600/月",
    },
    contribution: {
      title: "著者を支援 · Tip",
      subtitle: "任意のマイクロ寄付——レストランのチップのように。編集部に感謝します。",
      custom: "カスタム",
      vipUpsell: "VIP Longevity は別の有料サブスクです —",
      unavailable: "Tip は現在利用できません。",
      tip: "contribution で編集部を支援",
      exploreVip: "または VIP ロンジェビティプロトコルを見る",
    },
    donation: {
      title: "著者を支援",
      subtitle: "マイクロ寄付は質の高いコンテンツ制作を支えます。",
      amounts: ["¥300", "¥600", "¥980"],
      custom: "カスタム金額",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "あなた専用のウェルネスジャーナル",
      description:
        "記事を保存し、症状やサプリメントを記録。診断用ではなく——自分の概要のため。",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "モバイルで録音——AI が記録を作成",
      description: "医師向けプロフェッショナル文書ツール。GDPR 準拠、暗号化。",
    },
    trends: {
      title: "2026–2027 トレンド",
      glp1: "GLP-1 と代謝",
      biohacking: "初心者向けバイオハッキング",
      sleep: "睡眠最適化",
      mental: "メンタルウェルネス",
    },
  },
  ko: {
    tagline: "임상 인텔리전스와 근거 기반 의학",
    nav: {
      home: "홈",
      magazine: "매거진",
      pricing: "요금",
      welcome: "플랫폼",
      sections: "섹션",
      access: "접근 수준",
      specialties: "전문 분야",
      articles: "기사",
      search: "검색",
      login: "로그인",
      signup: "가입",
      audiences: "대상",
      medicine: "의학",
      subscribe: "구독",
    },
    cta: {
      readMore: "더 읽기",
      share: "공유",
      supportAuthor: "작가 지원",
      saveToMediFlow: "MediFlow에 저장",
      tryFree: "14일 무료 체험",
      upgradeVip: "VIP 업그레이드",
      exploreProtocols: "프로토콜 탐색",
    },
    disclaimer: {
      medical:
        "이 콘텐츠는 의학적 진단이나 치료 권고가 아닙니다. 항상 의사와 상담하세요.",
    },
    vip: {
      title: "VIP 장수 프로토콜",
      subtitle: "수면, 대사, 면역, 장수를 위한 10가지 근거 기반 프로토콜.",
      price: "₩6,000/월",
    },
    contribution: {
      title: "작가 지원 · Tip",
      subtitle: "선택적 소액 기부 — 레스토랑 팁처럼. 편집부에 감사드립니다.",
      custom: "직접 입력",
      vipUpsell: "VIP Longevity는 별도의 유료 구독입니다 —",
      unavailable: "Contribution을 현재 사용할 수 없습니다.",
      tip: "contribution으로 편집부 지원",
      exploreVip: "또는 VIP 장수 프로토콜 탐색",
    },
    donation: {
      title: "작가 지원",
      subtitle: "소액 기부는 양질의 콘텐츠 제작을 돕습니다.",
      amounts: ["₩3,000", "₩6,000", "₩9,800"],
      custom: "직접 입력",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "개인 웰니스 저널",
      description:
        "기사 저장, 증상 및 보충제 추적. 진단용 아님 — 개인 개요용.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "모바일 녹음 — AI가 기록 작성",
      description: "의사용 전문 문서 도구. GDPR 준수, 암호화.",
    },
    trends: {
      title: "2026–2027 트렌드",
      glp1: "GLP-1 및 대사",
      biohacking: "초보자 바이오해킹",
      sleep: "수면 최적화",
      mental: "정신 웰니스",
    },
  },
  vi: {
    tagline: "Trí tuệ lâm sàng và y học dựa trên bằng chứng",
    nav: {
      home: "Trang chủ",
      magazine: "Tạp chí",
      pricing: "Bảng giá",
      welcome: "Nền tảng",
      sections: "Mục",
      access: "Cấp truy cập",
      specialties: "Chuyên khoa",
      articles: "Bài viết",
      search: "Tìm kiếm",
      login: "Đăng nhập",
      signup: "Đăng ký",
      audiences: "Dành cho ai",
      medicine: "Y học",
      subscribe: "Đăng ký",
    },
    cta: {
      readMore: "Đọc thêm",
      share: "Chia sẻ",
      supportAuthor: "Ủng hộ tác giả",
      saveToMediFlow: "Lưu vào MediFlow",
      tryFree: "Dùng thử miễn phí 14 ngày",
      upgradeVip: "Nâng cấp VIP",
      exploreProtocols: "Khám phá giao thức",
    },
    disclaimer: {
      medical:
        "Nội dung không phải là chẩn đoán y khoa hay khuyến nghị điều trị. Luôn tham khảo ý kiến bác sĩ.",
    },
    vip: {
      title: "Giao thức VIP trường thọ",
      subtitle:
        "10 giao thức dựa trên bằng chứng cho giấc ngủ, chuyển hóa, miễn dịch và trường thọ.",
      price: "120.000 ₫/tháng",
    },
    contribution: {
      title: "Ủng hộ tác giả · Tip",
      subtitle:
        "Đóng góp vi mô tùy chọn — như tiền boa ở nhà hàng. Cảm ơn ban biên tập.",
      custom: "Tùy chỉnh",
      vipUpsell: "VIP Longevity là gói đăng ký trả phí riêng —",
      unavailable: "Tip hiện không khả dụng.",
      tip: "Ủng hộ ban biên tập bằng tip",
      exploreVip: "hoặc khám phá giao thức VIP trường thọ",
    },
    donation: {
      title: "Ủng hộ tác giả",
      subtitle: "Quyên góp vi mô giúp tiếp tục tạo nội dung chất lượng.",
      amounts: ["50.000 ₫", "120.000 ₫", "240.000 ₫"],
      custom: "Số tiền tùy chỉnh",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Nhật ký wellness cá nhân",
      description:
        "Lưu bài viết, theo dõi triệu chứng và thực phẩm bổ sung. Không để chẩn đoán — cho cái nhìn tổng quan.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Ghi trên di động — AI viết ghi chú",
      description:
        "Công cụ tài liệu chuyên nghiệp cho bác sĩ. Tuân thủ GDPR, mã hóa.",
    },
    trends: {
      title: "Xu hướng 2026–2027",
      glp1: "GLP-1 và chuyển hóa",
      biohacking: "Biohacking cho người mới",
      sleep: "Tối ưu giấc ngủ",
      mental: "Sức khỏe tinh thần",
    },
  },
  id: {
    tagline: "Inteligensi klinis dan kedokteran berbasis bukti",
    nav: {
      home: "Beranda",
      magazine: "Majalah",
      pricing: "Harga",
      welcome: "Platform",
      sections: "Bagian",
      access: "Tingkat akses",
      specialties: "Spesialisasi",
      articles: "Artikel",
      search: "Cari",
      login: "Masuk",
      signup: "Daftar",
      audiences: "Untuk siapa",
      medicine: "Kedokteran",
      subscribe: "Berlangganan",
    },
    cta: {
      readMore: "Baca selengkapnya",
      share: "Bagikan",
      supportAuthor: "Dukung penulis",
      saveToMediFlow: "Simpan ke MediFlow",
      tryFree: "Uji coba gratis 14 hari",
      upgradeVip: "Upgrade ke VIP",
      exploreProtocols: "Jelajahi protokol",
    },
    disclaimer: {
      medical:
        "Konten ini bukan diagnosis medis atau rekomendasi pengobatan. Selalu konsultasikan dengan dokter Anda.",
    },
    vip: {
      title: "Protokol VIP longevitas",
      subtitle:
        "10 protokol berbasis bukti untuk tidur, metabolisme, imunitas, dan longevitas.",
      price: "Rp 75.000/bulan",
    },
    contribution: {
      title: "Dukung penulis · Tip",
      subtitle:
        "Kontribusi mikro opsional — seperti tip di restoran. Terima kasih redaksi.",
      custom: "Kustom",
      vipUpsell: "VIP Longevity adalah langganan berbayar terpisah —",
      unavailable: "Tip saat ini tidak tersedia.",
      tip: "Dukung redaksi dengan tip",
      exploreVip: "atau jelajahi protokol VIP longevitas",
    },
    donation: {
      title: "Dukung penulis",
      subtitle: "Micro-donation membantu melanjutkan konten berkualitas.",
      amounts: ["Rp 30.000", "Rp 75.000", "Rp 149.000"],
      custom: "Jumlah kustom",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Jurnal wellness pribadi Anda",
      description:
        "Simpan artikel, lacak gejala dan suplemen. Bukan untuk diagnosis — untuk gambaran Anda sendiri.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Rekam di ponsel — AI menulis catatan",
      description:
        "Alat dokumentasi profesional untuk dokter. Patuh GDPR, terenkripsi.",
    },
    trends: {
      title: "Tren 2026–2027",
      glp1: "GLP-1 & metabolisme",
      biohacking: "Biohacking untuk pemula",
      sleep: "Optimasi tidur",
      mental: "Kesejahteraan mental",
    },
  },
  be: {
    tagline: "Клінічная аналітыка і доказавая медцына",
    nav: {
      home: "Галоўная",
      magazine: "Часопіс",
      pricing: "Цены",
      welcome: "Платформа",
      sections: "Раздзелы",
      access: "Узровні доступу",
      specialties: "Спецыяльнасці",
      articles: "Артыкулы",
      search: "Пошук",
      login: "Увайсці",
      signup: "Рэгістрацыя",
      audiences: "Для каго",
      medicine: "Медцына",
      subscribe: "Падпіска",
    },
    cta: {
      readMore: "Чытаць далей",
      share: "Падзяліцца",
      supportAuthor: "Падтрымаць аўтара",
      saveToMediFlow: "Захаваць у MediFlow",
      tryFree: "14 дзён бесплатна",
      upgradeVip: "Перайсці на VIP",
      exploreProtocols: "Праглядзець пратаколы",
    },
    disclaimer: {
      medical:
        "Кантэнт не з'яўляецца медыцынскім дыягнозам ці рэкамендацыяй па лячэнні. Заўсёды кансультуйцеся з лекарам.",
    },
    vip: {
      title: "VIP пратаколы даўгалетасці",
      subtitle:
        "10 пратаколаў на аснове доказаў для сну, метабалізму, імунітэту і даўгалетасці.",
      price: "14,90 Br/мес",
    },
    contribution: {
      title: "Падтрымаць аўтара · Tip",
      subtitle:
        "Добраахвотны мікраўзнос — як чаевыя ў рэстаране. Дзякуем рэдакцыі.",
      custom: "Свая сума",
      vipUpsell: "VIP Longevity — асобная платная падпіска —",
      unavailable: "Tip зараз недаступны.",
      tip: "Падтрымайце рэдакцыю contribution",
      exploreVip: "або праглядзіце VIP пратаколы даўгалетасці",
    },
    donation: {
      title: "Падтрымаць аўтара",
      subtitle: "Мікраахвота дапамагае ствараць якасны кантэнт.",
      amounts: ["10 Br", "25 Br", "49 Br"],
      custom: "Свая сума",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "Ваш асабісты wellness-штоднённік",
      description:
        "Захоўвайце артыкулы, адсочвайце сімптомы і дабаўкі. Не для дыягнозу — для ўласнага агляду.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Запіс на мабільным — ШІ піша нататку",
      description:
        "Прафесійны інструмент дакументавання для лекараў. GDPR, шыфраванне.",
    },
    trends: {
      title: "Тренды 2026–2027",
      glp1: "GLP-1 і метабалізм",
      biohacking: "Біяхакінг для пачаткоўцаў",
      sleep: "Аптимізацыя сну",
      mental: "Ментальнае дабрабыт",
    },
  },
  pt: {
    tagline: "Inteligência clínica e medicina baseada em evidências",
    nav: {
      home: "Início",
      magazine: "Revista",
      pricing: "Preços",
      welcome: "Plataforma",
      sections: "Secções",
      access: "Níveis de acesso",
      specialties: "Especialidades",
      articles: "Artigos",
      search: "Pesquisar",
      login: "Entrar",
      signup: "Registar",
      audiences: "Para quem",
      medicine: "Medicina",
      subscribe: "Subscrição",
    },
    cta: {
      readMore: "Ler mais",
      share: "Partilhar",
      supportAuthor: "Apoiar autor",
      saveToMediFlow: "Guardar no MediFlow",
      tryFree: "Teste gratuito de 14 dias",
      upgradeVip: "Upgrade para VIP",
      exploreProtocols: "Explorar protocolos",
    },
    disclaimer: {
      medical:
        "O conteúdo não constitui diagnóstico médico nem recomendação terapêutica. Consulte sempre o seu médico.",
    },
    vip: {
      title: "Protocolos VIP longevidade",
      subtitle:
        "10 protocolos baseados em evidência para sono, metabolismo, imunidade e longevidade.",
      price: "€5,99/mês",
    },
    contribution: {
      title: "Apoiar autor · Tip",
      subtitle:
        "Micro-contribuição opcional — como gorjeta num restaurante. Obrigado à redação.",
      custom: "Valor personalizado",
      vipUpsell: "VIP Longevity é uma assinatura paga separada —",
      unavailable: "Tip não está disponível de momento.",
      tip: "Apoie a redação com um tip",
      exploreVip: "ou explore protocolos VIP longevidade",
    },
    donation: {
      title: "Apoiar autor",
      subtitle: "Uma micro-doação ajuda a continuar a criar conteúdo de qualidade.",
      amounts: ["€2", "€5", "€9.90"],
      custom: "Valor personalizado",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "O seu diário pessoal de wellness",
      description:
        "Guarde artigos, registe sintomas e suplementos. Não para diagnóstico — para a sua visão geral.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "Grave no telemóvel — a IA escreve a nota",
      description:
        "Ferramenta profissional de documentação para médicos. Conforme RGPD, encriptada.",
    },
    trends: {
      title: "Tendências 2026–2027",
      glp1: "GLP-1 e metabolismo",
      biohacking: "Biohacking para iniciantes",
      sleep: "Otimização do sono",
      mental: "Bem-estar mental",
    },
  },
  ar: {
    tagline: "الذكاء السريري والطب المبني على الأدلة",
    nav: {
      home: "الرئيسية",
      magazine: "المجلة",
      pricing: "الأسعار",
      welcome: "المنصة",
      sections: "الأقسام",
      access: "مستويات الوصول",
      specialties: "التخصصات",
      articles: "المقالات",
      search: "بحث",
      login: "تسجيل الدخول",
      signup: "التسجيل",
      audiences: "لمن",
      medicine: "الطب",
      subscribe: "الاشتراك",
    },
    cta: {
      readMore: "اقرأ المزيد",
      share: "مشاركة",
      supportAuthor: "ادعم المؤلف",
      saveToMediFlow: "احفظ في MediFlow",
      tryFree: "تجربة مجانية لمدة 14 يومًا",
      upgradeVip: "الترقية إلى VIP",
      exploreProtocols: "استكشف البروتوكولات",
    },
    disclaimer: {
      medical:
        "المحتوى ليس تشخيصًا طبيًا أو توصية علاجية. استشر طبيبك دائمًا.",
    },
    vip: {
      title: "بروتوكولات VIP للعمر الطويل",
      subtitle: "10 بروتوكولات مبنية على الأدلة للنوم والتمثيل الغذائي والمناعة والعمر الطويل.",
      price: "$4.99/شهر",
    },
    contribution: {
      title: "ادعم المؤلف · Tip",
      subtitle: "مساهمة صغيرة اختيارية — مثل الإكرامية في المطعم. شكرًا للتحرير.",
      custom: "مبلغ مخصص",
      vipUpsell: "VIP Longevity اشتراك مدفوع منفصل —",
      unavailable: "Tip غير متاح حاليًا.",
      tip: "ادعم التحرير بـ tip",
      exploreVip: "أو استكشف بروتوكولات VIP للعمر الطويل",
    },
    donation: {
      title: "ادعم المؤلف",
      subtitle: "التبرع الصغير يساعد على مواصلة إنشاء محتوى عالي الجودة.",
      amounts: ["$2.99", "$4.99", "$9.99"],
      custom: "مبلغ مخصص",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "مذكرات العافية الشخصية",
      description:
        "احفظ المقالات، تتبع الأعراض والمكملات. ليس للتشخيص — لنظرة عامة شخصية.",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "سجّل على الهاتف — الذكاء الاصطناعي يكتب الملاحظة",
      description: "أداة توثيق احترافية للأطباء. متوافقة مع GDPR، مشفرة.",
    },
    trends: {
      title: "اتجاهات 2026–2027",
      glp1: "GLP-1 والتمثيل الغذائي",
      biohacking: "Biohacking للمبتدئين",
      sleep: "تحسين النوم",
      mental: "العافية النفسية",
    },
  },
  hi: {
    tagline: "क्लिनिकल इंटेलिजेंस और साक्ष्य-आधारित चिकित्सा",
    nav: {
      home: "होम",
      magazine: "पत्रिका",
      pricing: "मूल्य",
      welcome: "प्लेटफ़ॉर्म",
      sections: "अनुभाग",
      access: "पहुँच स्तर",
      specialties: "विशेषताएँ",
      articles: "लेख",
      search: "खोज",
      login: "लॉग इन",
      signup: "पंजीकरण",
      audiences: "किसके लिए",
      medicine: "चिकित्सा",
      subscribe: "सदस्यता",
    },
    cta: {
      readMore: "और पढ़ें",
      share: "साझा करें",
      supportAuthor: "लेखक का समर्थन",
      saveToMediFlow: "MediFlow में सहेजें",
      tryFree: "14 दिन का निःशुल्क परीक्षण",
      upgradeVip: "VIP में अपग्रेड",
      exploreProtocols: "प्रोटोकॉल देखें",
    },
    disclaimer: {
      medical:
        "यह सामग्री चिकित्सा निदान या उपचार सलाह नहीं है। हमेशा अपने चिकित्सक से परामर्श करें।",
    },
    vip: {
      title: "VIP longevity प्रोटोकॉल",
      subtitle: "नींद, चयापचय, प्रतिरक्षा और longevity के लिए 10 साक्ष्य-आधारित प्रोटोकॉल।",
      price: "$4.99/माह",
    },
    contribution: {
      title: "लेखक का समर्थन · Tip",
      subtitle:
        "वैकल्पिक सूक्ष्म योगदान — рестोरां में टिप की तरह। संपादन को धन्यवाद।",
      custom: "कस्टम",
      vipUpsell: "VIP Longevity एक अलग सशुल्क सदस्यता है —",
      unavailable: "Tip अभी उपलब्ध नहीं है।",
      tip: "tip से संपादन का समर्थन करें",
      exploreVip: "या VIP longevity प्रोटोकॉल देखें",
    },
    donation: {
      title: "लेखक का समर्थन",
      subtitle: "सूक्ष्म दान गुणवत्तापूर्ण सामग्री बनाने में मदद करता है।",
      amounts: ["$2.99", "$4.99", "$9.99"],
      custom: "कस्टम राशि",
    },
    mediflow: {
      name: "MediFlow",
      tagline: "आपकी व्यक्तिगत wellness डायरी",
      description:
        "लेख सहेजें, लक्षण और सप्लीमेंट ट्रैक करें। निदान के लिए नहीं — अपने अवलोकन के लिए।",
    },
    ordizaznam: {
      name: "OrdiZáznam",
      tagline: "मोबाइल पर रिकॉर्ड — AI नोट लिखता है",
      description:
        "चिकित्सकों के लिए पेशेवर दस्तावेज़ उपकरण। GDPR अनुपालन, एन्क्रिप्टेड।",
    },
    trends: {
      title: "रुझान 2026–2027",
      glp1: "GLP-1 और चयापचय",
      biohacking: "शुरुआती के लिए biohacking",
      sleep: "नींद अनुकूलन",
      mental: "मानसिक wellness",
    },
  },
};

function buildLocale(code, copy) {
  return {
    site: {
      name: "MedScopeGlobal",
      tagline: copy.tagline,
    },
    nav: copy.nav,
    cta: copy.cta,
    disclaimer: copy.disclaimer,
    vip: copy.vip,
    contribution: copy.contribution,
    donation: copy.donation,
    mediflow: copy.mediflow,
    ordizaznam: copy.ordizaznam,
    trends: copy.trends,
  };
}

const root = join(process.cwd(), "locales");
for (const code of LOCALES) {
  const copy = COPY[code];
  if (!copy) throw new Error(`Missing copy for ${code}`);
  const dir = join(root, code);
  mkdirSync(dir, { recursive: true });
  const payload = buildLocale(code, copy);
  writeFileSync(
    join(dir, "common.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8"
  );
  console.log(`wrote locales/${code}/common.json`);
}
