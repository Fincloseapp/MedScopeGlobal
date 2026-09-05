/**
 * Native labels for the five ViaLongeVita magazine categories.
 * Used by locale newsletter editions so non-CS desks never inherit Czech chrome.
 */

import { WRITER_DESKS, type WriterDeskId } from "@/lib/editorial/writer-agents";
import { resolveGlobalLocale } from "@/lib/i18n/locale-path";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";

export const MAGAZINE_CATEGORY_IDS = [
  "zivotni-styl",
  "nemoci",
  "prevence",
  "rozhovory",
  "dlouhovekost",
] as const;

export type MagazineCategoryId = (typeof MAGAZINE_CATEGORY_IDS)[number];

export type MagazineCategoryCopy = {
  id: MagazineCategoryId;
  deskId: WriterDeskId;
  title: string;
  intro: string;
  fallbackTitle: string;
  fallbackSummary: string;
};

type Pack = Record<MagazineCategoryId, { title: string; intro: string; fallbackTitle: string; fallbackSummary: string }>;

const EN: Pack = {
  "zivotni-styl": {
    title: "Lifestyle",
    intro: "Sleep, movement and food — habits you can keep after forty.",
    fallbackTitle: "A quieter week starts with one repeatable habit",
    fallbackSummary:
      "Pick one change you can hold for five days: an earlier lights-out, a short walk after lunch, or a protein-first breakfast. Longevity is built from routines, not restarts.",
  },
  nemoci: {
    title: "Conditions",
    intro: "Plain language on common illnesses — no scare tactics.",
    fallbackTitle: "What the symptoms are trying to say",
    fallbackSummary:
      "Most everyday complaints have a simple first step: rest, hydration, and a note of what changed. See a clinician when pain, fever or shortness of breath is new or worsening.",
  },
  prevence: {
    title: "Prevention",
    intro: "Screening and daily habits that move healthspan.",
    fallbackTitle: "Prevention that fits a working week",
    fallbackSummary:
      "The useful screenings are the ones you actually book. Pair them with sleep, movement and a grocery list you can repeat in winter — not a perfect Monday reset.",
  },
  rozhovory: {
    title: "Conversations",
    intro: "Field notes and Q&A from practice, not portraits.",
    fallbackTitle: "What clinicians keep repeating",
    fallbackSummary:
      "The same three questions come back: how is your sleep, what do you walk, and who is your usual doctor. Useful journalism stays close to those answers.",
  },
  dlouhovekost: {
    title: "Longevity",
    intro: "Healthspan and biomarkers — evidence, not gadget hype.",
    fallbackTitle: "Healthspan is slower than the feed",
    fallbackSummary:
      "VO2, strength, sleep regularity and blood pressure still outrank most wearables. Read studies as one clear sentence: what changes for you this month.",
  },
};

const PACKS: Record<string, Pack> = {
  en: EN,
  cs: {
    "zivotni-styl": {
      title: "Životní styl",
      intro: "Spánek, pohyb a výživa — návyky, které jdou udržet po čtyřicítce.",
      fallbackTitle: "Klidnější týden začíná jedním opakovatelným návykem",
      fallbackSummary:
        "Vyberte jednu změnu na pět dní: dřívější zhasnutí, krátkou chůzi po obědě, nebo snídani s bílkovinou. Dlouhověkost staví rutina, ne pondělní restart.",
    },
    nemoci: {
      title: "Nemoci",
      intro: "Srozumitelně o běžných onemocněních — bez strašení.",
      fallbackTitle: "Co se příznaky snaží říct",
      fallbackSummary:
        "U každodenních potíží stačí první krok: klid, tekutiny a záznam, co se změnilo. Lékaře hledejte, když je bolest, horečka nebo dušnost nová nebo se zhoršuje.",
    },
    prevence: {
      title: "Prevence",
      intro: "Screening a denní návyky, které posouvají healthspan.",
      fallbackTitle: "Prevence, která se vejde do pracovního týdne",
      fallbackSummary:
        "Užitečný je ten screening, který opravdu objednáte. Spojte ho se spánkem, pohybem a nákupem, který vydrží i v listopadu.",
    },
    rozhovory: {
      title: "Rozhovory",
      intro: "Poznámky z praxe a Q&A — bez portrétů.",
      fallbackTitle: "Co praktici opakují pořád dokola",
      fallbackSummary:
        "Vracejí se tři otázky: jak spíte, kolik ujdete a kdo je váš praktický lékař. Užitečná žurnalistika drží u těchto odpovědí.",
    },
    dlouhovekost: {
      title: "Dlouhověkost",
      intro: "Healthspan a biomarkery — evidence, ne hype gadgetů.",
      fallbackTitle: "Healthspan je pomalejší než feed",
      fallbackSummary:
        "VO2, síla, pravidelnost spánku a krevní tlak pořád porážejí většinu náramků. Studii čtěte jako jednu jasnou větu: co se pro vás mění tento měsíc.",
    },
  },
  sk: {
    "zivotni-styl": {
      title: "Životný štýl",
      intro: "Spánok, pohyb a výživa — návyky, ktoré sa dajú udržať po štyridsiatke.",
      fallbackTitle: "Pokojnejší týždeň začína jedným opakovaným návykom",
      fallbackSummary:
        "Vyberte jednu zmenu na päť dní: skoršie zhasnutie, krátku chôdzu po obede, alebo raňajky s bielkovinou.",
    },
    nemoci: {
      title: "Choroby",
      intro: "Zrozumiteľne o bežných ochoreniach — bez strašenia.",
      fallbackTitle: "Čo sa príznaky snažia povedať",
      fallbackSummary:
        "Pri bežných ťažkostiach stačí pokoj, tekutiny a záznam zmien. Lekára hľadajte pri novej bolesti, horúčke alebo dýchavičnosti.",
    },
    prevence: {
      title: "Prevencia",
      intro: "Skríning a denné návyky, ktoré posúvajú healthspan.",
      fallbackTitle: "Prevencia, ktorá sa zmestí do pracovného týždňa",
      fallbackSummary: "Užitočný je ten skríning, ktorý si naozaj objednáte. Spojte ho so spánkom a pohybom.",
    },
    rozhovory: {
      title: "Rozhovory",
      intro: "Poznámky z praxe a Q&A — bez portrétov.",
      fallbackTitle: "Čo praktici opakujú stále dookola",
      fallbackSummary: "Tri otázky: ako spíte, koľko prejdete a kto je váš všeobecný lekár.",
    },
    dlouhovekost: {
      title: "Dlhovekosť",
      intro: "Healthspan a biomarkery — evidencia, nie hype gadgetov.",
      fallbackTitle: "Healthspan je pomalší ako feed",
      fallbackSummary: "VO2, sila, spánok a tlak stále bijú väčšinu náramkov.",
    },
  },
  de: {
    "zivotni-styl": {
      title: "Lebensstil",
      intro: "Schlaf, Bewegung und Ernährung — haltbar nach vierzig.",
      fallbackTitle: "Eine ruhigere Woche beginnt mit einer wiederholbaren Gewohnheit",
      fallbackSummary:
        "Wählen Sie eine Änderung für fünf Tage: früheres Licht-aus, ein kurzer Gang nach dem Essen oder ein proteinreiches Frühstück.",
    },
    nemoci: {
      title: "Erkrankungen",
      intro: "Verständlich zu häufigen Krankheiten — ohne Panik.",
      fallbackTitle: "Was die Symptome sagen wollen",
      fallbackSummary:
        "Alltagsbeschwerden: Ruhe, Flüssigkeit, notieren was sich geändert hat. Zum Arzt bei neuem Schmerz, Fieber oder Luftnot.",
    },
    prevence: {
      title: "Prävention",
      intro: "Screening und Alltagsroutinen, die Healthspan bewegen.",
      fallbackTitle: "Prävention, die in die Arbeitswoche passt",
      fallbackSummary: "Nützlich ist das Screening, das Sie wirklich buchen. Kombinieren Sie es mit Schlaf und Bewegung.",
    },
    rozhovory: {
      title: "Gespräche",
      intro: "Notizen aus der Praxis und Q&A — ohne Porträts.",
      fallbackTitle: "Was Kliniker immer wieder sagen",
      fallbackSummary: "Drei Fragen: Wie schlafen Sie, wie viel laufen Sie, wer ist Ihr Hausarzt?",
    },
    dlouhovekost: {
      title: "Langlebigkeit",
      intro: "Healthspan und Biomarker — Evidenz, kein Gadget-Hype.",
      fallbackTitle: "Healthspan ist langsamer als der Feed",
      fallbackSummary: "VO2, Kraft, Schlafregelmäßigkeit und Blutdruck schlagen die meisten Wearables.",
    },
  },
  fr: {
    "zivotni-styl": {
      title: "Mode de vie",
      intro: "Sommeil, mouvement et alimentation — tenable après 40 ans.",
      fallbackTitle: "Une semaine plus calme commence par une habitude répétée",
      fallbackSummary:
        "Choisissez un changement pour cinq jours : coucher plus tôt, une marche après le déjeuner, ou un petit-déjeuner protéiné.",
    },
    nemoci: {
      title: "Maladies",
      intro: "Les maladies courantes en clair — sans panique.",
      fallbackTitle: "Ce que les symptômes essaient de dire",
      fallbackSummary:
        "Pour les gênes du quotidien : repos, hydratation, noter ce qui a changé. Voir un médecin si douleur, fièvre ou essoufflement est nouveau.",
    },
    prevence: {
      title: "Prévention",
      intro: "Dépistage et habitudes qui font bouger le healthspan.",
      fallbackTitle: "Une prévention qui tient dans la semaine",
      fallbackSummary: "Utile est le dépistage que vous prenez vraiment rendez-vous. Reliez-le au sommeil et au mouvement.",
    },
    rozhovory: {
      title: "Entretiens",
      intro: "Notes de terrain et Q&R — sans portraits.",
      fallbackTitle: "Ce que les cliniciens répètent",
      fallbackSummary: "Trois questions : comment dormez-vous, combien marchez-vous, qui est votre médecin traitant ?",
    },
    dlouhovekost: {
      title: "Longévité",
      intro: "Healthspan et biomarqueurs — preuves, pas le hype gadget.",
      fallbackTitle: "Le healthspan est plus lent que le fil",
      fallbackSummary: "VO2, force, régularité du sommeil et tension battent encore la plupart des montres.",
    },
  },
  es: {
    "zivotni-styl": {
      title: "Estilo de vida",
      intro: "Sueño, movimiento y comida — hábitos que se sostienen después de los 40.",
      fallbackTitle: "Una semana más quieta empieza con un hábito repetible",
      fallbackSummary:
        "Elija un cambio para cinco días: apagar antes la luz, un paseo corto después de comer o un desayuno con proteína.",
    },
    nemoci: {
      title: "Enfermedades",
      intro: "Enfermedades frecuentes en claro — sin alarmismo.",
      fallbackTitle: "Lo que intentan decir los síntomas",
      fallbackSummary:
        "Molestias cotidianas: descanso, hidratación y anotar qué cambió. Vea a un médico si el dolor, la fiebre o la falta de aire es nueva.",
    },
    prevence: {
      title: "Prevención",
      intro: "Cribado y hábitos que mueven el healthspan.",
      fallbackTitle: "Prevención que cabe en la semana laboral",
      fallbackSummary: "Útil es el cribado que de verdad cita. Únalo al sueño y al movimiento.",
    },
    rozhovory: {
      title: "Conversaciones",
      intro: "Notas de consulta y preguntas — sin retratos.",
      fallbackTitle: "Lo que los clínicos repiten",
      fallbackSummary: "Tres preguntas: cómo duerme, cuánto camina y quién es su médico de familia.",
    },
    dlouhovekost: {
      title: "Longevidad",
      intro: "Healthspan y biomarcadores — evidencia, no hype de gadgets.",
      fallbackTitle: "El healthspan es más lento que el feed",
      fallbackSummary: "VO2, fuerza, regularidad del sueño y tensión siguen ganando a la mayoría de wearables.",
    },
  },
  it: {
    "zivotni-styl": {
      title: "Stile di vita",
      intro: "Sonno, movimento e cibo — abitudini che reggono dopo i 40.",
      fallbackTitle: "Una settimana più calma inizia con un’abitudine ripetibile",
      fallbackSummary:
        "Scegliete un cambiamento per cinque giorni: spegnere prima le luci, una camminata dopo pranzo o una colazione con proteine.",
    },
    nemoci: {
      title: "Malattie",
      intro: "Malattie comuni, in chiaro — senza allarmismo.",
      fallbackTitle: "Cosa cercano di dire i sintomi",
      fallbackSummary:
        "Disturbi quotidiani: riposo, idratazione, annotare cosa è cambiato. Dal medico se dolore, febbre o fiatone è nuovo.",
    },
    prevence: {
      title: "Prevenzione",
      intro: "Screening e abitudini che muovono l’healthspan.",
      fallbackTitle: "Prevenzione che sta nella settimana lavorativa",
      fallbackSummary: "Utile è lo screening che prenotate davvero. Collegatelo a sonno e movimento.",
    },
    rozhovory: {
      title: "Conversazioni",
      intro: "Note dal campo e Q&A — senza ritratti.",
      fallbackTitle: "Quello che i clinici ripetono",
      fallbackSummary: "Tre domande: come dormite, quanto camminate, chi è il vostro medico di base.",
    },
    dlouhovekost: {
      title: "Longevità",
      intro: "Healthspan e biomarcatori — evidenza, non hype dei gadget.",
      fallbackTitle: "L’healthspan è più lento del feed",
      fallbackSummary: "VO2, forza, regolarità del sonno e pressione battono ancora la maggior parte dei wearable.",
    },
  },
  pt: {
    "zivotni-styl": {
      title: "Estilo de vida",
      intro: "Sono, movimento e alimentação — hábitos que se aguentam depois dos 40.",
      fallbackTitle: "Uma semana mais calma começa com um hábito repetível",
      fallbackSummary:
        "Escolha uma mudança para cinco dias: apagar a luz mais cedo, um passeio depois do almoço ou um pequeno-almoço com proteína.",
    },
    nemoci: {
      title: "Doenças",
      intro: "Doenças frequentes em linguagem clara — sem assustar.",
      fallbackTitle: "O que os sintomas tentam dizer",
      fallbackSummary:
        "Queixas do dia a dia: descanso, hidratação e anotar o que mudou. Consulte o médico se a dor, a febre ou a falta de ar for nova.",
    },
    prevence: {
      title: "Prevenção",
      intro: "Rastreio e hábitos que movem o healthspan.",
      fallbackTitle: "Prevenção que cabe na semana de trabalho",
      fallbackSummary: "Útil é o rastreio que marca mesmo. Junte-o ao sono e ao movimento.",
    },
    rozhovory: {
      title: "Conversas",
      intro: "Notas do consultório e perguntas — sem retratos.",
      fallbackTitle: "O que os clínicos repetem",
      fallbackSummary: "Três perguntas: como dorme, quanto caminha e quem é o seu médico de família.",
    },
    dlouhovekost: {
      title: "Longevidade",
      intro: "Healthspan e biomarcadores — evidência, não hype de gadgets.",
      fallbackTitle: "O healthspan é mais lento do que o feed",
      fallbackSummary: "VO2, força, regularidade do sono e tensão ainda ganham à maioria dos wearables.",
    },
  },
  "pt-BR": {
    "zivotni-styl": {
      title: "Estilo de vida",
      intro: "Sono, movimento e alimentação — hábitos que dão para manter depois dos 40.",
      fallbackTitle: "Uma semana mais calma começa com um hábito repetível",
      fallbackSummary:
        "Escolha uma mudança por cinco dias: apagar a luz mais cedo, uma caminhada depois do almoço ou um café da manhã com proteína.",
    },
    nemoci: {
      title: "Doenças",
      intro: "Doenças comuns em linguagem clara — sem assustar.",
      fallbackTitle: "O que os sintomas tentam dizer",
      fallbackSummary:
        "Queixas do dia a dia: descanso, hidratação e anotar o que mudou. Procure o médico ou o SUS se a dor, a febre ou a falta de ar for nova.",
    },
    prevence: {
      title: "Prevenção",
      intro: "Rastreamento e hábitos que movem o healthspan.",
      fallbackTitle: "Prevenção que cabe na semana de trabalho",
      fallbackSummary: "Útil é o exame que você realmente agenda. Una ao sono e ao movimento.",
    },
    rozhovory: {
      title: "Conversas",
      intro: "Notas do consultório e perguntas — sem retratos.",
      fallbackTitle: "O que os clínicos repetem",
      fallbackSummary: "Três perguntas: como você dorme, quanto caminha e quem é o seu médico de família.",
    },
    dlouhovekost: {
      title: "Longevidade",
      intro: "Healthspan e biomarcadores — evidência, não hype de gadgets.",
      fallbackTitle: "O healthspan é mais lento que o feed",
      fallbackSummary: "VO2, força, regularidade do sono e pressão ainda ganham da maioria dos wearables.",
    },
  },
  pl: {
    "zivotni-styl": {
      title: "Styl życia",
      intro: "Sen, ruch i jedzenie — nawyki, które trzymają po czterdziestce.",
      fallbackTitle: "Spokojniejszy tydzień zaczyna się od jednego powtarzalnego nawyku",
      fallbackSummary:
        "Wybierz jedną zmianę na pięć dni: wcześniejsze gaszenie światła, krótki spacer po obiedzie albo śniadanie z białkiem.",
    },
    nemoci: {
      title: "Choroby",
      intro: "Częste choroby jasno — bez straszenia.",
      fallbackTitle: "Co objawy próbują powiedzieć",
      fallbackSummary:
        "Codzienne dolegliwości: odpoczynek, płyny i zapis zmian. Do lekarza, gdy ból, gorączka lub duszność jest nowa.",
    },
    prevence: {
      title: "Profilaktyka",
      intro: "Badania i nawyki, które przesuwają healthspan.",
      fallbackTitle: "Profilaktyka, która mieści się w tygodniu pracy",
      fallbackSummary: "Pożyteczne jest to badanie, które naprawdę umawiasz. Połącz je ze snem i ruchem.",
    },
    rozhovory: {
      title: "Rozmowy",
      intro: "Notatki z praktyki i Q&A — bez portretów.",
      fallbackTitle: "Co klinicyści powtarzają",
      fallbackSummary: "Trzy pytania: jak śpisz, ile chodzisz i kto jest Twoim lekarzem rodzinnym.",
    },
    dlouhovekost: {
      title: "Długowieczność",
      intro: "Healthspan i biomarkery — dowody, nie hype gadżetów.",
      fallbackTitle: "Healthspan jest wolniejszy niż feed",
      fallbackSummary: "VO2, siła, regularność snu i ciśnienie wciąż wygrywają z większością opasek.",
    },
  },
  ro: {
    "zivotni-styl": {
      title: "Stil de viață",
      intro: "Somn, mișcare și mâncare — obiceiuri care țin după 40 de ani.",
      fallbackTitle: "O săptămână mai liniștită începe cu un obicei repetabil",
      fallbackSummary: "Alegeți o schimbare pentru cinci zile: stingerea mai devreme, o plimbare după prânz sau un mic dejun cu proteine.",
    },
    nemoci: {
      title: "Boli",
      intro: "Boli frecvente, clar — fără panică.",
      fallbackTitle: "Ce încearcă să spună simptomele",
      fallbackSummary: "Neplăceri zilnice: odihnă, hidratare, notați ce s-a schimbat. La medic dacă durerea, febra sau lipsa de aer e nouă.",
    },
    prevence: {
      title: "Prevenție",
      intro: "Screening și obiceiuri care mișcă healthspan-ul.",
      fallbackTitle: "Prevenție care încape în săptămâna de lucru",
      fallbackSummary: "Util e screeningul pe care îl programați cu adevărat. Legati-l de somn și mișcare.",
    },
    rozhovory: {
      title: "Convorbiri",
      intro: "Note din cabinet și întrebări — fără portrete.",
      fallbackTitle: "Ce repetă clinicienii",
      fallbackSummary: "Trei întrebări: cum dormiți, cât mergeți, cine e medicul de familie.",
    },
    dlouhovekost: {
      title: "Longevitate",
      intro: "Healthspan și biomarkeri — dovezi, nu hype de gadgeturi.",
      fallbackTitle: "Healthspan-ul e mai lent decât feed-ul",
      fallbackSummary: "VO2, forță, regularitatea somnului și tensiunea bat încă majoritatea brățărilor.",
    },
  },
  hu: {
    "zivotni-styl": {
      title: "Életmód",
      intro: "Alvás, mozgás és étkezés — szokások, amelyek 40 után is tarthatók.",
      fallbackTitle: "A csendesebb hét egy ismételhető szokással indul",
      fallbackSummary: "Válasszon egy változást öt napra: korábbi villanyoltás, rövid séta ebéd után vagy fehérjés reggeli.",
    },
    nemoci: {
      title: "Betegségek",
      intro: "Gyakori betegségek érthetően — riogatás nélkül.",
      fallbackTitle: "Mit próbálnak mondani a tünetek",
      fallbackSummary: "Hétköznapi panasz: pihenés, folyadék, jegyezze fel, mi változott. Orvoshoz új fájdalom, láz vagy nehézlégzés esetén.",
    },
    prevence: {
      title: "Megelőzés",
      intro: "Szűrés és szokások, amelyek viszik a healthspan-t.",
      fallbackTitle: "Megelőzés, ami belefér a munkahétbe",
      fallbackSummary: "Az a szűrés hasznos, amit tényleg lefoglal. Kösse alváshoz és mozgáshoz.",
    },
    rozhovory: {
      title: "Beszélgetések",
      intro: "Rendelői jegyzetek és kérdések — portré nélkül.",
      fallbackTitle: "Amit a klinikusok ismételnek",
      fallbackSummary: "Három kérdés: hogyan alszik, mennyit sétál, ki a háziorvosa.",
    },
    dlouhovekost: {
      title: "Hosszúélet",
      intro: "Healthspan és biomarkerek — evidenciák, nem gadget-hype.",
      fallbackTitle: "A healthspan lassabb, mint a feed",
      fallbackSummary: "A VO2, az erő, az alvás ritmusa és a vérnyomás még mindig veri a karkötők többségét.",
    },
  },
  ru: {
    "zivotni-styl": {
      title: "Образ жизни",
      intro: "Сон, движение и еда — привычки, которые держатся после сорока.",
      fallbackTitle: "Спокойная неделя начинается с одной повторяемой привычки",
      fallbackSummary: "Выберите одно изменение на пять дней: раньше гасить свет, короткая прогулка после еды или завтрак с белком.",
    },
    nemoci: {
      title: "Заболевания",
      intro: "Частые болезни простым языком — без запугивания.",
      fallbackTitle: "Что пытаются сказать симптомы",
      fallbackSummary: "Повседневные жалобы: отдых, вода и запись изменений. К врачу, если боль, температура или одышка новые.",
    },
    prevence: {
      title: "Профилактика",
      intro: "Скрининг и привычки, которые двигают healthspan.",
      fallbackTitle: "Профилактика, которая помещается в рабочую неделю",
      fallbackSummary: "Полезен тот скрининг, который вы реально записываете. Свяжите его со сном и движением.",
    },
    rozhovory: {
      title: "Разговоры",
      intro: "Заметки из практики и вопросы — без портретов.",
      fallbackTitle: "Что клиницисты повторяют",
      fallbackSummary: "Три вопроса: как вы спите, сколько ходите и кто ваш терапевт.",
    },
    dlouhovekost: {
      title: "Долголетие",
      intro: "Healthspan и биомаркеры — данные, не хайп гаджетов.",
      fallbackTitle: "Healthspan медленнее ленты",
      fallbackSummary: "VO2, сила, регулярность сна и давление всё ещё сильнее большинства браслетов.",
    },
  },
  uk: {
    "zivotni-styl": {
      title: "Спосіб життя",
      intro: "Сон, рух і їжа — звички, які тримаються після сорока.",
      fallbackTitle: "Спокійніший тиждень починається з однієї повторюваної звички",
      fallbackSummary: "Оберіть одну зміну на п’ять днів: раніше гасити світло, коротка прогулянка після їжі або сніданок із білком.",
    },
    nemoci: {
      title: "Хвороби",
      intro: "Поширені хвороби простою мовою — без залякування.",
      fallbackTitle: "Що намагаються сказати симптоми",
      fallbackSummary: "Повсякденні скарги: відпочинок, вода і запис змін. До лікаря, якщо біль, температура чи задишка нові.",
    },
    prevence: {
      title: "Профілактика",
      intro: "Скринінг і звички, які рухають healthspan.",
      fallbackTitle: "Профілактика, яка вміщується в робочий тиждень",
      fallbackSummary: "Корисний той скринінг, який ви справді записуєте. Поєднайте його зі сном і рухом.",
    },
    rozhovory: {
      title: "Розмови",
      intro: "Нотатки з практики та запитання — без портретів.",
      fallbackTitle: "Що клініцисти повторюють",
      fallbackSummary: "Три питання: як ви спите, скільки ходите і хто ваш сімейний лікар.",
    },
    dlouhovekost: {
      title: "Довголіття",
      intro: "Healthspan і біомаркери — дані, не хайп гаджетів.",
      fallbackTitle: "Healthspan повільніший за стрічку",
      fallbackSummary: "VO2, сила, регулярність сну і тиск досі сильніші за більшість браслетів.",
    },
  },
  be: {
    "zivotni-styl": {
      title: "Лад жыцця",
      intro: "Сон, рух і ежа — звычкі, якія трымаюцца пасля сарака.",
      fallbackTitle: "Спакойны тыдзень пачынаецца з адной паўтаральнай звычкі",
      fallbackSummary: "Абярыце адну змену на пяць дзён: раней гасіць святло, кароткая прагулка пасля ежы або сняданак з бялком.",
    },
    nemoci: {
      title: "Хваробы",
      intro: "Пашыраныя хваробы простай мовай — без запалохвання.",
      fallbackTitle: "Што спрабуюць сказаць сімптомы",
      fallbackSummary: "Штодзённыя скаргі: адпачынак, вада і запіс змен. Да лекара, калі боль, тэмпература ці дыхавіца новыя.",
    },
    prevence: {
      title: "Прафілактыка",
      intro: "Скрынінг і звычкі, якія рухаюць healthspan.",
      fallbackTitle: "Прафілактыка, якая змяшчаецца ў працоўны тыдзень",
      fallbackSummary: "Карысны той скрынінг, які вы сапраўды запісваеце. Злучыце яго са сном і рухам.",
    },
    rozhovory: {
      title: "Гутаркі",
      intro: "Нататкі з практыкі і пытанні — без партрэтаў.",
      fallbackTitle: "Што клініцысты паўтараюць",
      fallbackSummary: "Тры пытанні: як вы спіце, колькі ходзіце і хто ваш тэрапеўт.",
    },
    dlouhovekost: {
      title: "Даўгалецце",
      intro: "Healthspan і біямаркеры — даныя, не хайп гаджэтаў.",
      fallbackTitle: "Healthspan павольней за стужку",
      fallbackSummary: "VO2, сіла, рэгулярнасць сну і ціск усё яшчэ мацнейшыя за большасць бранзалетаў.",
    },
  },
  "zh-CN": {
    "zivotni-styl": {
      title: "生活方式",
      intro: "睡眠、运动与饮食 — 四十岁之后仍能坚持的习惯。",
      fallbackTitle: "更安静的一周从可重复的习惯开始",
      fallbackSummary: "选一件坚持五天的事：早点关灯、午饭后短走，或一顿有蛋白质的早餐。",
    },
    nemoci: {
      title: "常见疾病",
      intro: "把常见病说清楚 — 不制造恐慌。",
      fallbackTitle: "症状在试图说明什么",
      fallbackSummary: "日常不适：休息、补水、记下变化。新出现的疼痛、发热或气促，请就医。",
    },
    prevence: {
      title: "预防",
      intro: "筛查与日常习惯，真正推动健康寿命。",
      fallbackTitle: "能放进工作周的预防",
      fallbackSummary: "有用的筛查是你真正预约的那一次。把它和睡眠、运动连在一起。",
    },
    rozhovory: {
      title: "对话",
      intro: "诊室笔记与问答 — 没有肖像。",
      fallbackTitle: "临床医生反复说的话",
      fallbackSummary: "三个问题：睡得怎样、走多少、谁是你的家庭医生。",
    },
    dlouhovekost: {
      title: "长寿",
      intro: "健康寿命与生物标志物 — 证据，不是设备炒作。",
      fallbackTitle: "健康寿命比信息流更慢",
      fallbackSummary: "VO2、力量、睡眠规律和血压，仍然强过大多数手环。",
    },
  },
  ja: {
    "zivotni-styl": {
      title: "ライフスタイル",
      intro: "睡眠・運動・食事。40代以降も続く習慣。",
      fallbackTitle: "静かな一週間は、繰り返せる習慣から",
      fallbackSummary: "五日続ける変化を一つ：早め消灯、食後の短い散歩、たんぱく質のある朝食。",
    },
    nemoci: {
      title: "病気",
      intro: "よくある病気を平易に。脅しはしない。",
      fallbackTitle: "症状が伝えようとしていること",
      fallbackSummary: "日常の不調は休息・水分・変化の記録から。新しい痛み、発熱、息切れは受診を。",
    },
    prevence: {
      title: "予防",
      intro: "健診と日常がヘルススパンを動かす。",
      fallbackTitle: "勤務週に収まる予防",
      fallbackSummary: "役に立つ健診は、実際に予約したもの。睡眠と運動につなげる。",
    },
    rozhovory: {
      title: "対話",
      intro: "現場メモと質疑。肖像は使わない。",
      fallbackTitle: "臨床家が繰り返すこと",
      fallbackSummary: "三つの問い：眠り、歩く量、かかりつけ医は誰か。",
    },
    dlouhovekost: {
      title: "長寿",
      intro: "ヘルススパンとバイオマーカー。根拠であり、機器の誇張ではない。",
      fallbackTitle: "ヘルススパンはフィードより遅い",
      fallbackSummary: "VO2、筋力、睡眠の規則性、血圧は、多くのウェアラブルより強い。",
    },
  },
  ko: {
    "zivotni-styl": {
      title: "생활습관",
      intro: "수면, 움직임, 식사 — 40대 이후에도 유지할 습관.",
      fallbackTitle: "더 고요한 한 주는 반복 가능한 습관에서 시작됩니다",
      fallbackSummary: "닷새 동안 하나만 바꾸세요. 일찍 불 끄기, 점심 후 짧은 걷기, 단백질 있는 아침.",
    },
    nemoci: {
      title: "질환",
      intro: "흔한 병을 쉽게 — 겁주지 않습니다.",
      fallbackTitle: "증상이 말하려는 것",
      fallbackSummary: "일상 불편은 휴식, 수분, 변화 기록부터. 새 통증, 열, 숨참은 진료를.",
    },
    prevence: {
      title: "예방",
      intro: "검진과 습관이 헬스스팬을 움직입니다.",
      fallbackTitle: "근무 주에 들어가는 예방",
      fallbackSummary: "유용한 검진은 실제로 예약한 것입니다. 수면과 움직임에 연결하세요.",
    },
    rozhovory: {
      title: "대화",
      intro: "현장 메모와 질문 — 초상 없음.",
      fallbackTitle: "임상의가 반복하는 말",
      fallbackSummary: "세 가지: 잠은 어떤지, 얼마나 걷는지, 주치의는 누구인지.",
    },
    dlouhovekost: {
      title: "장수",
      intro: "헬스스팬과 바이오마커 — 근거이지 기기 과장이 아닙니다.",
      fallbackTitle: "헬스스팬은 피드보다 느립니다",
      fallbackSummary: "VO2, 근력, 수면 규칙, 혈압은 여전히 대부분의 웨어러블보다 강합니다.",
    },
  },
  vi: {
    "zivotni-styl": {
      title: "Lối sống",
      intro: "Ngủ, vận động và ăn — thói quen giữ được sau tuổi 40.",
      fallbackTitle: "Một tuần yên hơn bắt đầu từ một thói quen lặp lại",
      fallbackSummary: "Chọn một thay đổi trong năm ngày: tắt đèn sớm, đi bộ sau bữa, hoặc bữa sáng có đạm.",
    },
    nemoci: {
      title: "Bệnh",
      intro: "Bệnh thường gặp nói rõ — không dọa.",
      fallbackTitle: "Triệu chứng đang cố nói gì",
      fallbackSummary: "Khó chịu hàng ngày: nghỉ, uống nước, ghi lại thay đổi. Đến bác sĩ nếu đau, sốt hoặc khó thở là mới.",
    },
    prevence: {
      title: "Dự phòng",
      intro: "Sàng lọc và thói quen làm dịch chuyển healthspan.",
      fallbackTitle: "Dự phòng vừa một tuần làm việc",
      fallbackSummary: "Sàng lọc hữu ích là cái bạn thật sự đặt lịch. Gắn với ngủ và vận động.",
    },
    rozhovory: {
      title: "Trò chuyện",
      intro: "Ghi chép phòng khám và hỏi đáp — không chân dung.",
      fallbackTitle: "Điều nhà lâm sàng nhắc lại",
      fallbackSummary: "Ba câu: ngủ thế nào, đi bao nhiêu, bác sĩ gia đình là ai.",
    },
    dlouhovekost: {
      title: "Trường thọ",
      intro: "Healthspan và dấu ấn sinh học — bằng chứng, không phải hype thiết bị.",
      fallbackTitle: "Healthspan chậm hơn bảng tin",
      fallbackSummary: "VO2, sức mạnh, nhịp ngủ và huyết áp vẫn mạnh hơn hầu hết vòng đeo.",
    },
  },
  id: {
    "zivotni-styl": {
      title: "Gaya hidup",
      intro: "Tidur, gerak, dan makanan — kebiasaan yang bertahan setelah 40.",
      fallbackTitle: "Pekan yang lebih tenang dimulai dari satu kebiasaan yang diulang",
      fallbackSummary: "Pilih satu perubahan selama lima hari: lampu padam lebih awal, jalan singkat setelah makan, atau sarapan berprotein.",
    },
    nemoci: {
      title: "Penyakit",
      intro: "Penyakit umum dengan bahasa jelas — tanpa menakut-nakuti.",
      fallbackTitle: "Apa yang gejala coba katakan",
      fallbackSummary: "Keluhan sehari-hari: istirahat, cairan, catat yang berubah. Ke dokter jika nyeri, demam, atau sesak baru muncul.",
    },
    prevence: {
      title: "Pencegahan",
      intro: "Skrining dan kebiasaan yang menggerakkan healthspan.",
      fallbackTitle: "Pencegahan yang muat di minggu kerja",
      fallbackSummary: "Skrining berguna adalah yang benar-benar Anda jadwalkan. Satukan dengan tidur dan gerak.",
    },
    rozhovory: {
      title: "Percakapan",
      intro: "Catatan praktik dan tanya jawab — tanpa potret.",
      fallbackTitle: "Yang diulang klinisi",
      fallbackSummary: "Tiga pertanyaan: bagaimana tidur, berapa banyak jalan, siapa dokter keluarga Anda.",
    },
    dlouhovekost: {
      title: "Umur panjang",
      intro: "Healthspan dan biomarker — bukti, bukan hype gawai.",
      fallbackTitle: "Healthspan lebih lambat dari umpan",
      fallbackSummary: "VO2, kekuatan, keteraturan tidur, dan tekanan darah masih mengalahkan kebanyakan gelang.",
    },
  },
};

PACKS["en-US"] = {
  ...EN,
  prevence: {
    ...EN.prevence,
    fallbackSummary:
      "The useful screenings are the ones you actually book with your PCP. Pair them with sleep, movement, and a grocery list you can repeat in winter.",
  },
};

function packKey(locale: string): string {
  const resolved = resolveGlobalLocale(locale);
  if (PACKS[resolved]) return resolved;
  if (resolved.startsWith("en")) return "en";
  if (resolved.startsWith("pt")) return resolved === "pt-BR" ? "pt-BR" : "pt";
  if (resolved.startsWith("zh")) return "zh-CN";
  return "en";
}

export function magazineCategoryPack(locale: string): Pack {
  return PACKS[packKey(locale)] ?? EN;
}

export function magazineCategoriesForLocale(locale: string): MagazineCategoryCopy[] {
  const pack = magazineCategoryPack(locale);
  const surface = getSurfaceCopy(locale);
  return WRITER_DESKS.map((desk) => {
    const id = desk.topic as MagazineCategoryId;
    const row = pack[id] ?? EN[id];
    const surfaceRow = surface.writers[desk.deskId];
    return {
      id,
      deskId: desk.deskId,
      title: surfaceRow?.topicLabel && packKey(locale) === "cs" ? surfaceRow.topicLabel : row.title,
      intro: row.intro,
      fallbackTitle: row.fallbackTitle,
      fallbackSummary: row.fallbackSummary,
    };
  });
}
