/**
 * Native magazine desk pieces for each language edition.
 * Written in the edition language — not Czech translations.
 * Topics: slim/metabolic health, longevity, healthy lifestyle, biohacking,
 * plus a local public-health note. Shared foreign-desk rows stay attributed.
 */

import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { resolveArticleCoverUrl } from "@/lib/ecosystem/editorial/images/cover";
import { assignEditorialUnits, publicEditorialByline } from "@/lib/editorial/units";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale, type LocaleCode } from "@/lib/i18n/config";
import type { ArticleWithRelations } from "@/types/database";

type NativeTopic = "dlouhovekost" | "zivotni-styl" | "prevence" | "novinky";

type NativeSeed = {
  slugTail: string;
  title: string;
  excerpt: string;
  topic: NativeTopic;
  keywords: string[];
  sections: { h2: string; paras: string[]; list?: string[] }[];
};

function htmlFromSections(intro: string, sections: NativeSeed["sections"], closer: string): string {
  const body = sections
    .map((section) => {
      const paras = section.paras.map((p) => `<p>${p}</p>`).join("");
      const list = section.list?.length
        ? `<ul>${section.list.map((item) => `<li>${item}</li>`).join("")}</ul>`
        : "";
      return `<h2>${section.h2}</h2>${paras}${list}`;
    })
    .join("");
  return `<p>${intro}</p>${body}<p><em>${closer}</em></p>`;
}

/** Rolling UTC calendar day so native pins never freeze on a ship date. Slugs stay stable. */
export function nativeDeskPinDate(index: number, now = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - index, 8, 0, 0)
  );
}

function publishedMs(article: { published_at?: string | null }): number {
  const value = article.published_at ? Date.parse(article.published_at) : 0;
  return Number.isFinite(value) ? value : 0;
}

function buildRow(locale: string, seed: NativeSeed, index: number): ArticleWithRelations {
  const published = nativeDeskPinDate(index).toISOString();
  const slug = `verejnost-${seed.topic}-2026-09-03-${locale.toLowerCase()}-${seed.slugTail}`;
  const content = htmlFromSections(seed.excerpt, seed.sections, seed.excerpt);
  const id = `native-desk-${locale}-${seed.slugTail}`;
  const metadata: Record<string, unknown> = {
    native_desk: true,
    editorial_version: "27",
    section: seed.topic === "novinky" ? "novinky" : "verejnost",
    keywords: seed.keywords,
    content_pillar: seed.topic === "dlouhovekost" ? "dlouhovekost" : seed.topic,
    fully_open: true,
    editors_pick: true,
    read_time_minutes: 6,
  };
  return {
    id,
    title: seed.title,
    slug,
    excerpt: seed.excerpt,
    content,
    cover_image_url: resolveArticleCoverUrl({
      title: seed.title,
      slug,
      excerpt: seed.excerpt,
      publicTopic: seed.topic === "novinky" ? "prevence" : seed.topic === "dlouhovekost" ? "zivotni-styl" : seed.topic,
      preferCurated: true,
    }),
    category_id: "native-desk",
    author_id: "native-desk",
    published: true,
    published_at: published,
    vip_only: false,
    rubric_slug: seed.topic === "novinky" ? "aktualni-zpravy" : "verejnost",
    min_access_level: "public",
    audience: "public",
    public_topic: seed.topic === "novinky" || seed.topic === "dlouhovekost" ? "prevence" : seed.topic,
    locale,
    source_name: "ViaLongeVita · Native desk",
    meta_description: seed.excerpt.slice(0, 160),
    ai_generated: false,
    metadata,
    created_at: published,
    updated_at: published,
    categories: {
      id: "native-desk",
      name:
        seed.topic === "dlouhovekost"
          ? "Longevity"
          : seed.topic === "novinky"
            ? "News"
            : "Public health",
      slug: seed.topic,
      description: null,
      created_at: published,
    },
    users: { id: "native-desk", full_name: null, avatar_url: null },
  };
}

function toDisplay(row: ArticleWithRelations, locale: string): DisplayArticle {
  const assignment = assignEditorialUnits(row);
  return {
    ...row,
    displayLocale: locale,
    deskOrigin: "native",
    syndicatedFromLocale: null,
    editorialAssignment: assignment,
    editorialPrimaryLabel: publicEditorialByline(locale),
  };
}

const EN_US: NativeSeed[] = [
  {
    slugTail: "glp1-weight-pcp",
    title: "Sustainable weight in the US: food environment, walking, and GLP-1 with a clinician",
    excerpt:
      "Slim-metabolic health for US readers — repeatable meals, daily walking, and GLP-1 only with a PCP. No crash diets, no Czech insurance rules.",
    topic: "zivotni-styl",
    keywords: ["weight", "GLP-1", "PCP", "metabolic health", "slim"],
    sections: [
      {
        h2: "The US food environment is the context",
        paras: [
          "A US reader does not need advice written for Czech reimbursement. The useful question is how to eat in a landscape of ultra-processed defaults, large portions, and irregular shifts — and when a medicine conversation belongs with a primary-care clinician, not a comment thread.",
          "Sustainable weight is metabolic health: sleep, protein, walking, and a plate you can repeat on a Tuesday. Crash diets and unlabelled “stacks” fail because they ignore the week you actually live.",
        ],
        list: [
          "Build one repeatable plate: protein, vegetables, a starch you tolerate.",
          "Walk most days. Stairs and a short loop beat a heroic Saturday.",
          "If you are considering GLP-1 medicines, ask your PCP about indications, side effects, and follow-up — FDA labelling is the frame, not social media.",
        ],
      },
      {
        h2: "GLP-1 is a medical conversation",
        paras: [
          "Public curiosity about semaglutide-class medicines is high. That does not make them a lifestyle product. Indications, contraindications, and monitoring sit with a licensed clinician. Shortages, compounding, and imported pens are a safety topic — not a shopping tip.",
          "The ViaLongeVita US desk writes for readers who want to stay slim-healthy without turning the kitchen into a clinic. If weight change is rapid, unexplained, or paired with chest pain, dizziness, or fainting, use 911 or urgent care. Educational copy is not a diagnosis.",
        ],
      },
    ],
  },
  {
    slugTail: "healthspan-sleep-us",
    title: "Healthspan in American English: sleep first, supplements last",
    excerpt:
      "Longevity for US readers starts with a wake time you can keep, darkness at night, and blood-pressure context with your PCP — not a miracle stack.",
    topic: "dlouhovekost",
    keywords: ["longevity", "healthspan", "sleep", "PCP", "911"],
    sections: [
      {
        h2: "Healthspan is years you can use",
        paras: [
          "Lifespan is how long you live. Healthspan is how long you stay capable — walking, sleeping, thinking, and recovering. US coverage of longevity often jumps to gadgets. The US desk keeps the order: sleep, movement, food, then a clinician for biomarkers.",
          "A stable wake time, a darker bedroom, and less late caffeine are boring on purpose. They are also the habits that still show up in sleep-medicine reviews. Blue-light glasses and magnesium are optional. A phone in the pillow is not.",
        ],
        list: [
          "Same wake time, including weekends when you can.",
          "Keep the bedroom cooler and darker; park the phone outside arm’s reach.",
          "Ask your PCP which numbers matter for you — blood pressure, lipids, glucose — instead of ordering a mystery panel online.",
        ],
      },
      {
        h2: "When to stop reading and call",
        paras: [
          "Loud snoring with witnessed pauses, chest pain, sudden weakness, or a new severe headache is not a longevity protocol. Call 911 or your local emergency number. The magazine explains evidence. It does not triage you.",
        ],
      },
    ],
  },
  {
    slugTail: "wearables-biohacking-us",
    title: "Biohacking without the hype: what a US wearable can and cannot tell you",
    excerpt:
      "Rings and watches can nudge sleep and steps. They cannot replace a clinician, and they are not a diagnosis. Evidence first.",
    topic: "prevence",
    keywords: ["biohacking", "wearables", "FDA", "prevention"],
    sections: [
      {
        h2: "A sensor is a nudge, not a verdict",
        paras: [
          "US readers live with rings, watches, and continuous glucose sensors bought without a clinic visit. Some of that is useful: a step goal, a bedtime reminder, a resting-heart-rate trend you can show a PCP. Some of it is theatre — readiness scores that move with last night’s wine and yesterday’s argument.",
          "The US desk treats biohacking as optional instrumentation around habits you already understand. If a device flags atrial fibrillation or a dangerous glucose reading, that is a medical event: contact care, do not “optimize.” Consumer devices are not FDA-cleared for every claim on the box.",
        ],
        list: [
          "Use wearables for sleep timing and walking — the two signals with the least drama.",
          "Do not change prescription medicines because an app said so.",
          "Bring a week of data to your PCP if a pattern worries you; do not self-diagnose from a score.",
        ],
      },
      {
        h2: "Legal and diplomatic note",
        paras: [
          "This piece is educational. It does not sell a device and it does not replace US emergency or primary care. Other MedScopeGlobal desks may cover the same science for their countries; this edition keeps FDA, PCP, and 911 in the frame.",
        ],
      },
    ],
  },
  {
    slugTail: "cdc-fall-prevention",
    title: "Fall health notes for the US: vaccines, air, and a calm news read",
    excerpt:
      "A US-desk briefing — CDC-style prevention, not Czech ministry circulars. Respiratory season, smoke, and when 911 beats a search tab.",
    topic: "novinky",
    keywords: ["CDC", "prevention", "news", "FDA", "911"],
    sections: [
      {
        h2: "What is actually local",
        paras: [
          "Autumn in the United States mixes respiratory viruses, wildfire smoke in some regions, and a new school-year rhythm. The useful briefing is local: who in the household is at higher risk, whether your clinician has recommended a seasonal vaccine, and how to keep indoor air reasonable without panic shopping.",
          "The Czech edition writes for VZP and 155. This edition does not. If you need a medicine or a vaccine, the path is your PCP, a pharmacy clinic where that is lawful, or urgent care — and FDA-regulated products, not a grey-market import.",
        ],
        list: [
          "Check seasonal vaccine advice with your clinician if you are older, pregnant, or immunocompromised.",
          "On smoke days, shorter outdoor workouts and a cleaner indoor room beat heroic mileage.",
          "Chest pain, severe shortness of breath, or blue lips: 911.",
        ],
      },
      {
        h2: "How this desk shares foreign reporting",
        paras: [
          "When we reprint a longevity study first covered by the French or German desk, we say so. Science crosses borders. Practical paperwork does not. You will not find Czech admissions or SÚKL reimbursement as local advice here.",
        ],
      },
    ],
  },
];

const EN_UK: NativeSeed[] = [
  {
    slugTail: "nhs-weight-gp",
    title: "Sustainable weight on the NHS pathway: GP first, no crash diets",
    excerpt:
      "UK slim-metabolic health — a plate you can repeat, walking, and GLP-1 only through a clinician. GP and NHS 111, not VZP.",
    topic: "zivotni-styl",
    keywords: ["NHS", "GP", "weight", "GLP-1"],
    sections: [
      {
        h2: "The British week, not a Czech one",
        paras: [
          "A UK reader shops different aisles, uses a GP, and calls 111 or 999. Advice about Czech insurers is noise. Sustainable weight here is the same biology with a different front door: sleep, protein, walking, and a conversation with a GP if medicines enter the picture.",
          "NICE and MHRA frame what is commissioned and what is licensed. Social media does not. If you are considering a GLP-1 medicine, ask the GP practice — not a private advert in isolation — and understand follow-up, side effects, and that this magazine is not a clinic.",
        ],
        list: [
          "Repeatable meals beat a 5:2 performance you abandon in week two.",
          "Walking most days still earns its keep on UK pavements and canal paths.",
          "NHS 111 for urgent but non-emergency advice; 999 if you cannot breathe or have chest pain.",
        ],
      },
      {
        h2: "Slim health without the hard sell",
        paras: [
          "ViaLongeVita’s UK desk will not tell you to buy a stack. We will tell you that crash diets rebound, that alcohol is easy to under-count, and that rapid unexplained weight loss needs a GP, not a protocol.",
        ],
      },
    ],
  },
  {
    slugTail: "nhs-healthspan-sleep",
    title: "Healthspan in British English: sleep, walking, and the GP",
    excerpt:
      "Longevity for UK readers — a wake time you can keep, NHS screening in context, no miracle supplements.",
    topic: "dlouhovekost",
    keywords: ["longevity", "NHS", "sleep", "GP"],
    sections: [
      {
        h2: "Healthspan, not hype",
        paras: [
          "The UK desk writes longevity as healthspan: years you can walk, sleep, and think. Supplements marketed as “NAD miracles” stay in the maybe pile until your clinician says otherwise. Sleep timing and a weekly walk remain first.",
          "NHS screening invitations exist for a reason. They are not a ViaLongeVita product. If a letter arrives, read it; if you are unsure, ask the GP or the number on the letter.",
        ],
        list: [
          "Protect a dark, cooler bedroom; park the phone.",
          "Walk most days — the cheapest UK longevity habit.",
          "999 for stroke/heart-attack signs; 111 when you need urgent advice and it is not an emergency.",
        ],
      },
      {
        h2: "Foreign desks",
        paras: [
          "Pieces from the US or Czech desks may appear with a label. We adapt the science and drop the paperwork that does not apply on the NHS.",
        ],
      },
    ],
  },
  {
    slugTail: "uk-wearables",
    title: "Biohacking in the UK: wearables as a nudge, MHRA as the frame",
    excerpt:
      "A watch can count steps. It cannot replace a GP. Evidence-based biohacking for British readers.",
    topic: "prevence",
    keywords: ["biohacking", "MHRA", "wearables", "GP"],
    sections: [
      {
        h2: "What the gadget is for",
        paras: [
          "UK readers buy the same rings as everyone else. Use them for bedtime and steps. Do not let a readiness score cancel a walk you would have enjoyed, and do not stop a prescribed medicine because an app blinked.",
          "If a wearable flags an irregular pulse or a faint, that is a GP or 999 question. MHRA regulates devices and medicines; a magazine does not.",
        ],
      },
      {
        h2: "Calm prevention",
        paras: [
          "Prevention here is vaccination advice via the NHS, blood-pressure checks, and not smoking. Biohacking is optional instrumentation around that — never a substitute.",
        ],
      },
    ],
  },
  {
    slugTail: "uk-autumn-brief",
    title: "UK autumn brief: respiratory season without the scare",
    excerpt:
      "A calm news read from the UK desk — NHS pathways, not Czech circulars.",
    topic: "novinky",
    keywords: ["NHS", "news", "prevention", "111"],
    sections: [
      {
        h2: "What to watch",
        paras: [
          "Respiratory season is a household question: who is at risk, whether the GP or pharmacist has offered a vaccine you are eligible for, and how to rest without turning every cough into a forum diagnosis.",
          "This is not SÚKL news. Licensed medicines in the UK sit with MHRA. Care sits with the NHS. 111 and 999 exist so you do not have to guess.",
        ],
      },
      {
        h2: "Sharing",
        paras: [
          "When we borrow a study from another MedScopeGlobal desk, we name that desk. Local advice stays British.",
        ],
      },
    ],
  },
];

const FR: NativeSeed[] = [
  {
    slugTail: "poids-medecin-traitant",
    title: "Poids durable en France : assiette répétable, marche, GLP-1 avec le médecin traitant",
    excerpt:
      "Santé métabolique pour lecteurs français — pas de régime miracle, pas de SÚKL. Médecin traitant, Assurance maladie, 15/112.",
    topic: "zivotni-styl",
    keywords: ["poids", "GLP-1", "médecin traitant", "ANSM"],
    sections: [
      {
        h2: "Le contexte français",
        paras: [
          "Un lecteur à Lyon ou à Rennes n’a pas besoin des règles tchèques. La question utile : comment manger dans une semaine réelle, marcher, dormir — et quand un médicament de type GLP-1 se discute avec le médecin traitant, sous le cadre ANSM, pas sous une publicité.",
          "L’amaigrissement durable n’est pas une chasse au miracle. C’est un assiette que vous tenez le mardi, des protéines, des légumes, moins d’alcool compté « à la louche ».",
        ],
        list: [
          "Une assiette répétable plutôt qu’un régime de 14 jours.",
          "La marche presque tous les jours.",
          "GLP-1 : indication, effets indésirables et suivi — uniquement en cabinet.",
        ],
      },
      {
        h2: "Urgences",
        paras: [
          "Douleur thoracique, gêne respiratoire sévère, malaise : 15 ou 112. ViaLongeVita informe, ne diagnostique pas.",
        ],
      },
    ],
  },
  {
    slugTail: "longevite-sommeil-fr",
    title: "Longévité : le healthspan commence par le sommeil, pas par un complément",
    excerpt:
      "La rédaction française parle d’années en bonne capacité — sommeil, marche, médecin traitant.",
    topic: "dlouhovekost",
    keywords: ["longévité", "sommeil", "healthspan"],
    sections: [
      {
        h2: "Healthspan, pas le hype",
        paras: [
          "La durée de vie n’est pas la durée de vie en santé. Nous écrivons pour la seconde. L’heure de réveil stable, une chambre plus sombre, moins de café tardif : c’est moins glamour qu’un protocole, et plus proche des revues de médecine du sommeil.",
          "Les bilans « anti-âge » en ligne ne remplacent pas le médecin traitant. Demandez quels chiffres comptent pour vous : tension, lipides, glycémie.",
        ],
      },
      {
        h2: "Partage diplomatique",
        paras: [
          "Un texte de la rédaction américaine peut être repris avec mention. La paperasse tchèque, non.",
        ],
      },
    ],
  },
  {
    slugTail: "biohacking-fr",
    title: "Biohacking sobre : la montre compte les pas, elle ne vous soigne pas",
    excerpt:
      "Capteurs utiles pour le sommeil et la marche. Pas un diagnostic. Cadre ANSM, pas le marketing.",
    topic: "prevence",
    keywords: ["biohacking", "ANSM", "objets connectés"],
    sections: [
      {
        h2: "Un capteur, une pichenette",
        paras: [
          "Les bagues et montres peuvent rappeler l’heure du coucher. Elles ne doivent pas faire arrêter un traitement prescrit. Un score de « readiness » qui chute après un dîner n’est pas une maladie.",
          "Si l’appareil signale un trouble du rythme ou une hypoglycémie inquiétante : contactez un soignant, le 15 ou le 112.",
        ],
      },
    ],
  },
  {
    slugTail: "actu-prevention-fr",
    title: "Actualité prévention : la saison respiratoire sans sensationnalisme",
    excerpt:
      "Brief de la rédaction française — Assurance maladie et 15/112, pas les circulaires tchèques.",
    topic: "novinky",
    keywords: ["prévention", "ANSM", "actualités"],
    sections: [
      {
        h2: "Ce qui est local",
        paras: [
          "La rentrée et l’automne mélangent virus respiratoires et rythme scolaire. La question utile : qui est à risque dans le foyer, et ce que le médecin traitant a déjà recommandé.",
          "Les médicaments autorisés en France s’inscrivent dans le cadre ANSM. Ce n’est pas une revue SÚKL.",
        ],
      },
    ],
  },
];

const IT: NativeSeed[] = [
  {
    slugTail: "peso-medico-base",
    title: "Peso sostenibile in Italia: piatto ripetibile, camminata, GLP-1 con il medico di base",
    excerpt:
      "Salute metabolica per lettori italiani — niente diete lampo. Medico di base, SSN, 118/112. Non SÚKL.",
    topic: "zivotni-styl",
    keywords: ["peso", "GLP-1", "medico di base", "AIFA"],
    sections: [
      {
        h2: "Il contesto italiano",
        paras: [
          "Chi legge da Milano o da Bari non ha bisogno delle mutue ceche. Serve un piatto che regge il martedì, proteine, verdura, meno alcol contato a occhio — e una conversazione in ambulatorio se si parla di farmaci GLP-1, nel quadro AIFA, non in un reel.",
          "Dimagrire in modo duraturo è salute metabolica, non una caccia al miracolo. Le diete lampo tornano indietro perché ignorano la settimana vera.",
        ],
        list: [
          "Un piatto ripetibile, non un protocollo di 14 giorni.",
          "Camminare quasi tutti i giorni.",
          "GLP-1 solo con il medico: indicazioni, effetti, follow-up.",
        ],
      },
      {
        h2: "Urgenze",
        paras: [
          "Dolore al petto, dispnea grave, svenimento: 118 o 112. La rivista informa, non diagnostica.",
        ],
      },
    ],
  },
  {
    slugTail: "longevita-sonno-it",
    title: "Longevità: l’healthspan comincia dal sonno, non da un integratore",
    excerpt:
      "La redazione italiana scrive anni in salute — sonno, cammino, medico di base.",
    topic: "dlouhovekost",
    keywords: ["longevità", "sonno", "healthspan"],
    sections: [
      {
        h2: "Anni che puoi usare",
        paras: [
          "La durata della vita non è la durata della vita in salute. Orario di sveglia stabile, stanza più buia, meno caffè la sera: è meno scenografico di un protocollo e più vicino alle revisioni sul sonno.",
          "I pannelli «anti-age» online non sostituiscono il medico di base. Chiedete quali numeri contano per voi.",
        ],
      },
    ],
  },
  {
    slugTail: "biohacking-it",
    title: "Biohacking con evidenze: l’orologio conta i passi, non vi cura",
    excerpt:
      "Sensori utili per sonno e cammino. Non una diagnosi. Quadro AIFA, non il marketing.",
    topic: "prevence",
    keywords: ["biohacking", "AIFA", "wearable"],
    sections: [
      {
        h2: "Un sensore è un richiamo",
        paras: [
          "Anelli e orologi possono ricordare l’ora di dormire. Non devono far sospendere un farmaco prescritto. Un punteggio di «readiness» dopo una cena non è una malattia.",
          "Se il dispositivo segnala un’aritmia o un valore allarmante: rivolgetevi a un medico, al 118 o al 112.",
        ],
      },
    ],
  },
  {
    slugTail: "notizie-prevenzione-it",
    title: "Notizie di prevenzione: la stagione respiratoria senza allarmismo",
    excerpt:
      "Brief della redazione italiana — SSN e 118/112, non le circolari ceche.",
    topic: "novinky",
    keywords: ["prevenzione", "AIFA", "notizie"],
    sections: [
      {
        h2: "Cosa è locale",
        paras: [
          "Autunno e rientro mescolano virus respiratori e ritmi scolastici. La domanda utile: chi è a rischio in casa e cosa ha già detto il medico di base.",
          "I farmaci autorizzati in Italia stanno nel quadro AIFA. Questa non è una rassegna SÚKL.",
        ],
      },
    ],
  },
];

const DE: NativeSeed[] = [
  {
    slugTail: "gewicht-hausarzt",
    title: "Stabiles Gewicht in DACH: wiederholbarer Teller, Gehen, GLP-1 beim Hausarzt",
    excerpt:
      "Metabolische Gesundheit für DACH-Leser — keine Crash-Diät. Hausarzt, gesetzliche Kasse, 112. Nicht SÚKL.",
    topic: "zivotni-styl",
    keywords: ["Gewicht", "GLP-1", "Hausarzt", "BfArM"],
    sections: [
      {
        h2: "Der deutsche Alltag",
        paras: [
          "Wer in München oder Wien liest, braucht keine tschechischen Kassenregeln. Nützlich ist ein Teller, den Sie dienstags halten, Protein, Gemüse, weniger Alkohol aus dem Handgelenk — und ein Gespräch in der Praxis, wenn GLP-1-Arzneimittel ins Spiel kommen. Rahmen ist BfArM, nicht ein Reel.",
          "Dauerhaftes Gewicht ist Stoffwechselgesundheit, keine Wundersuche. Crash-Diäten kehren zurück, weil sie die echte Woche ignorieren.",
        ],
        list: [
          "Ein wiederholbarer Teller statt einer 14-Tage-Show.",
          "Die meisten Tage gehen.",
          "GLP-1 nur mit Ärztin oder Arzt: Indikation, Nebenwirkungen, Kontrolle.",
        ],
      },
      {
        h2: "Notfälle",
        paras: [
          "Brustschmerz, schwere Luftnot, Ohnmacht: 112. Das Magazin informiert, es diagnostiziert nicht.",
        ],
      },
    ],
  },
  {
    slugTail: "langlebigkeit-schlaf-de",
    title: "Langlebigkeit: Healthspan beginnt mit Schlaf, nicht mit einem Präparat",
    excerpt:
      "Die DACH-Redaktion schreibt nutzbare Jahre — Schlaf, Gehen, Hausarzt.",
    topic: "dlouhovekost",
    keywords: ["Langlebigkeit", "Schlaf", "Healthspan"],
    sections: [
      {
        h2: "Jahre, die Sie brauchen können",
        paras: [
          "Lebensspanne ist nicht Gesundheitsspanne. Stabile Aufstehzeit, dunkleres Schlafzimmer, weniger später Kaffee: weniger Bühne, näher an der Schlafmedizin.",
          "Online-«Anti-Aging»-Panels ersetzen den Hausarzt nicht. Fragen Sie, welche Zahlen für Sie zählen.",
          "Die DACH-Redaktion teilt Studien anderer MedScopeGlobal-Desks nur mit Kennzeichnung. Tschechische Kassenregeln bleiben außen vor.",
        ],
      },
    ],
  },
  {
    slugTail: "biohacking-de",
    title: "Biohacking mit Evidenz: die Uhr zählt Schritte, sie behandelt nicht",
    excerpt:
      "Sensoren für Schlaf und Gehen. Keine Diagnose. Rahmen BfArM, kein Marketing.",
    topic: "prevence",
    keywords: ["Biohacking", "BfArM", "Wearables"],
    sections: [
      {
        h2: "Ein Sensor ist ein Stups",
        paras: [
          "Ringe und Uhren können an die Schlafenszeit erinnern. Sie dürfen ein verordnetes Arzneimittel nicht absetzen. Ein Readiness-Wert nach dem Abendessen ist keine Krankheit.",
          "Meldet das Gerät eine Rhythmusstörung oder einen alarmierenden Wert: Praxis oder 112.",
        ],
      },
    ],
  },
  {
    slugTail: "news-praevention-de",
    title: "Präventionslage: Atemwegs-Saison ohne Sensationslust",
    excerpt:
      "Briefing der DACH-Redaktion — gesetzliche Versorgung und 112, keine tschechischen Rundschreiben.",
    topic: "novinky",
    keywords: ["Prävention", "BfArM", "Nachrichten"],
    sections: [
      {
        h2: "Was lokal ist",
        paras: [
          "Herbst und Schulstart mischen Atemwegsviren und Alltag. Die nützliche Frage: wer im Haushalt ein höheres Risiko hat und was die Praxis schon empfohlen hat.",
          "Zugelassene Arzneimittel in DACH stehen im Rahmen von BfArM/EMA. Das ist kein SÚKL-Ticker.",
        ],
      },
    ],
  },
];

const ES: NativeSeed[] = [
  {
    slugTail: "peso-medico-familia",
    title: "Peso sostenible en España: plato repetible, caminar, GLP-1 con el médico de familia",
    excerpt:
      "Salud metabólica para lectores en España — sin dietas milagro. Médico de familia, SNS, 112. No SÚKL.",
    topic: "zivotni-styl",
    keywords: ["peso", "GLP-1", "SNS", "AEMPS"],
    sections: [
      {
        h2: "El contexto español",
        paras: [
          "Quien lee en Madrid o Valencia no necesita las mutuas checas. Hace falta un plato que aguante el martes, proteína, verdura, menos alcohol a ojo — y una consulta si entran fármacos GLP-1, en el marco AEMPS, no en un reel.",
        ],
        list: [
          "Un plato repetible, no una dieta de 14 días.",
          "Caminar casi todos los días.",
          "GLP-1 solo con el médico: indicación, efectos, seguimiento.",
        ],
      },
      {
        h2: "Urgencias",
        paras: ["Dolor torácico, disnea grave, desmayo: 112. La revista informa, no diagnostica."],
      },
    ],
  },
  {
    slugTail: "longevidad-sueno-es",
    title: "Longevidad: el healthspan empieza en el sueño, no en un suplemento",
    excerpt: "La redacción española escribe años en forma — sueño, marcha, médico de familia.",
    topic: "dlouhovekost",
    keywords: ["longevidad", "sueño", "healthspan"],
    sections: [
      {
        h2: "Años que puedes usar",
        paras: [
          "La esperanza de vida no es la esperanza de vida en salud. Hora de despertar estable, habitación más oscura, menos café tarde: menos escenario, más cerca de la medicina del sueño.",
        ],
      },
    ],
  },
  {
    slugTail: "biohacking-es",
    title: "Biohacking con evidencia: el reloj cuenta pasos, no cura",
    excerpt: "Sensores para sueño y marcha. No un diagnóstico. Marco AEMPS.",
    topic: "prevence",
    keywords: ["biohacking", "AEMPS"],
    sections: [
      {
        h2: "Un sensor es un recordatorio",
        paras: [
          "Anillos y relojes pueden recordar la hora de dormir. No deben retirar un fármaco recetado. Si avisan de una arritmia o un valor alarmante: consulta o 112.",
          "La redacción española trata el biohacking como instrumentación opcional alrededor de hábitos claros: sueño, marcha, comida. No es un diagnóstico ni un anuncio.",
        ],
      },
    ],
  },
  {
    slugTail: "noticias-prevencion-es",
    title: "Noticias de prevención: temporada respiratoria sin alarma",
    excerpt: "Brief de la redacción española — SNS y 112, no circulares checas.",
    topic: "novinky",
    keywords: ["prevención", "AEMPS", "noticias"],
    sections: [
      {
        h2: "Qué es local",
        paras: [
          "El otoño mezcla virus y rutina escolar. La pregunta útil: quién tiene más riesgo en casa y qué ha dicho ya el médico de familia. Los medicamentos autorizados en España están en el marco AEMPS.",
        ],
      },
    ],
  },
];

const PT_BR: NativeSeed[] = [
  {
    slugTail: "peso-ubs",
    title: "Peso sustentável no Brasil: prato repetível, caminhada, GLP-1 com a UBS",
    excerpt:
      "Saúde metabólica para leitores no Brasil — sem dieta milagre. UBS/SUS, SAMU 192, ANVISA. Não SÚKL.",
    topic: "zivotni-styl",
    keywords: ["peso", "GLP-1", "SUS", "ANVISA"],
    sections: [
      {
        h2: "O contexto brasileiro",
        paras: [
          "Quem lê em São Paulo ou Recife não precisa de convênio tcheco. Precisa de um prato que segure a terça, proteína, verdura, menos álcool no olho — e conversa na UBS ou com o médico se entrar medicamento GLP-1, no marco da ANVISA, não num reel.",
        ],
        list: [
          "Um prato repetível, não uma dieta de 14 dias.",
          "Caminhar quase todos os dias.",
          "GLP-1 só com profissional: indicação, efeitos, acompanhamento.",
        ],
      },
      {
        h2: "Urgências",
        paras: ["Dor no peito, falta de ar grave, desmaio: SAMU 192. A revista informa, não diagnostica."],
      },
    ],
  },
  {
    slugTail: "longevidade-sono-br",
    title: "Longevidade: healthspan começa no sono, não no suplemento",
    excerpt: "A redação brasileira escreve anos em forma — sono, caminhada, UBS.",
    topic: "dlouhovekost",
    keywords: ["longevidade", "sono", "healthspan"],
    sections: [
      {
        h2: "Anos que você usa",
        paras: [
          "Tempo de vida não é tempo de vida com saúde. Horário de acordar estável, quarto mais escuro, menos café à noite: menos palco, mais perto da medicina do sono.",
          "A redação brasileira não traduz papelada tcheca. UBS, SUS e 192 são o caminho local. Estudos de outras mesas MedScopeGlobal vêm com crédito.",
        ],
      },
    ],
  },
  {
    slugTail: "biohacking-br",
    title: "Biohacking com evidência: o relógio conta passos, não trata",
    excerpt: "Sensores para sono e caminhada. Não é diagnóstico. Marco ANVISA.",
    topic: "prevence",
    keywords: ["biohacking", "ANVISA"],
    sections: [
      {
        h2: "Sensor é lembrete",
        paras: [
          "Anéis e relógios podem lembrar a hora de dormir. Não devem cortar remédio prescrito. Se apontarem arritmia ou valor alarmante: serviço de saúde ou 192.",
          "Biohacking aqui é instrumento opcional — sono e passos — não um diagnóstico e não um anúncio.",
        ],
      },
    ],
  },
  {
    slugTail: "noticias-prevencao-br",
    title: "Notícias de prevenção: estação respiratória sem alarde",
    excerpt: "Brief da redação brasileira — SUS e 192, não circulares tchecas.",
    topic: "novinky",
    keywords: ["prevenção", "ANVISA", "notícias"],
    sections: [
      {
        h2: "O que é local",
        paras: [
          "A virada de estação mistura vírus e rotina escolar. A pergunta útil: quem tem mais risco em casa e o que a UBS já orientou. Medicamentos no Brasil estão no marco da ANVISA.",
          "Quando republicamos um estudo da mesa francesa ou americana, dizemos de qual redação veio. Conselho prático local permanece brasileiro.",
        ],
      },
    ],
  },
];

const EN: NativeSeed[] = EN_US.map((seed) => ({
  ...seed,
  title: seed.title.replace("US ", "international ").replace(" in the US", "").replace("American English", "plain English"),
  excerpt: seed.excerpt
    .replace("US readers", "international readers")
    .replace("PCP", "GP / family doctor")
    .replace("911", "local emergency"),
}));

const PACKS: Record<string, NativeSeed[]> = {
  "en-US": EN_US,
  "en-UK": EN_UK,
  en: EN,
  fr: FR,
  it: IT,
  de: DE,
  es: ES,
  "pt-BR": PT_BR,
};

function seedsForLocale(locale: LocaleCode): { tag: string; seeds: NativeSeed[] } | null {
  if (primaryArticleLocale(locale) === "cs") return null;
  if (PACKS[locale]) return { tag: locale, seeds: PACKS[locale]! };
  const primary = primaryArticleLocale(locale);
  if (PACKS[primary]) return { tag: primary, seeds: PACKS[primary]! };
  return { tag: "en", seeds: EN };
}

export function nativeDeskArticlesForLocale(locale?: string | null): ArticleWithRelations[] {
  const ui = normalizeLocale(locale ?? "cs");
  const pack = seedsForLocale(ui);
  if (!pack) return [];
  return pack.seeds.map((seed, index) => buildRow(pack.tag === "en" ? "en" : pack.tag, seed, index));
}

export function getNativeDeskArticleBySlug(slug: string): ArticleWithRelations | null {
  const key = slug.trim().toLowerCase();
  for (const locale of Object.keys(PACKS)) {
    const rows = nativeDeskArticlesForLocale(locale as LocaleCode);
    const hit = rows.find((row) => row.slug.toLowerCase() === key);
    if (hit) return hit;
  }
  return null;
}

export function mergeNativeDeskFeed<T extends { id?: string; slug?: string | null; locale?: string | null; public_topic?: string | null; published_at?: string | null; metadata?: Record<string, unknown> | null }>(
  articles: T[],
  locale?: string | null,
  topic?: string | null
): T[] {
  let native = nativeDeskArticlesForLocale(locale) as unknown as T[];
  if (topic) {
    native = native.filter((article) => {
      if (article.public_topic === topic) return true;
      const pillar = String(article.metadata?.content_pillar ?? "");
      return topic === "dlouhovekost" && pillar === "dlouhovekost";
    });
  }
  if (native.length === 0) return articles;
  const seen = new Set(native.map((article) => String(article.slug ?? article.id)));
  const rest = articles.filter((article) => !seen.has(String(article.slug ?? article.id)));
  return [...native, ...rest].sort((a, b) => publishedMs(b) - publishedMs(a));
}

export function nativeDeskDisplayArticles(locale?: string | null): DisplayArticle[] {
  const ui = normalizeLocale(locale ?? "cs");
  return nativeDeskArticlesForLocale(ui).map((row) => toDisplay(row, ui));
}

/** Related / recs on a native article must stay in-language — never Czech demo cards. */
export function relatedNativeDeskArticles(
  locale?: string | null,
  exclude?: { id?: string | null; slug?: string | null },
  limit = 3
): DisplayArticle[] {
  const excludeId = exclude?.id?.trim() ?? "";
  const excludeSlug = exclude?.slug?.trim().toLowerCase() ?? "";
  return nativeDeskDisplayArticles(locale)
    .filter((article) => {
      if (excludeId && article.id === excludeId) return false;
      if (excludeSlug && article.slug.toLowerCase() === excludeSlug) return false;
      return true;
    })
    .slice(0, limit);
}
