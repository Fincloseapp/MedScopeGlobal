/**
 * Seznam-Plus-style health desk pieces: current metabolic medicine, local frame,
 * no miracle claims, no invented patients. Used by native desks (CS + foreign).
 */

export type PlusDeskSeed = {
  slugTail: string;
  title: string;
  excerpt: string;
  topic: "dlouhovekost" | "zivotni-styl" | "prevence" | "novinky";
  keywords: string[];
  sections: { h2: string; paras: string[]; list?: string[] }[];
};

export const PLUS_GLP1_REWARD: Record<string, PlusDeskSeed> = {
  cs: {
    slugTail: "glp1-odmena-alkohol",
    title: "GLP-1 léky a odměna v mozku: méně chuti na alkohol, někdy i plošší nálada",
    excerpt:
      "Semaglutid a příbuzné léky tlumí „šum“ kolem jídla. Čtenáři i studie popisují i slabší chuť na alkohol. Někteří lidé hlásí, že je méně baví věci, které dřív těšily. Redakce shrnuje, co je známo — bez zázraků a bez rady vysadit lék.",
    topic: "zivotni-styl",
    keywords: ["GLP-1", "semaglutid", "alkohol", "odměna", "SÚKL", "praktický lékař"],
    sections: [
      {
        h2: "Proč se o tom vůbec mluví",
        paras: [
          "Léky ze skupiny agonistů GLP-1 receptoru vznikly pro cukrovku 2. typu. Část z nich má později i indikaci k léčbě obezity. V redakci ViaLongeVita je neprodáváme a nepředepisujeme. Píšeme o nich, protože se z diabetologické ambulance dostaly do běžné debaty o váze, jídle a — nověji — o chuti na alkohol.",
          "Čtenáři popisují, že po nasazení „vypne“ neustálé myšlenky na jídlo. Angličtina tomu říká food noise. Stejná skupina lidí někdy říká, že si k večeři nedá víno, ačkoli dřív byla sklenice zvyk, ne závislost. To není důkaz, že lék léčí alkoholismus. Je to pozorování, které teď klinické týmy ověřují.",
          "Český rámec zůstává český: indikace, úhrada a výdej patří praktickému lékaři, diabetologovi nebo obezitologovi a registraci SÚKL. Lékárna bez receptu, šedý dovoz ani „pen z internetu“ sem nepatří. Při bolesti na hrudi, silném zvracení, zmatenosti nebo krvácení volejte 155.",
        ],
      },
      {
        h2: "Co se v mozku pravděpodobně děje",
        paras: [
          "Receptory GLP-1 nejsou jen ve střevě a slinivce. Jsou i v okruzích, které hodnotí odměnu — jídlo, alkohol, někdy i kouření nebo bezcílné scrollování. Lék proto může ztišit více signálů najednou. To vysvětluje, proč část lidí pije méně, aniž by si dali „abstinenční předsevzetí“.",
          "Stejná hypotéza má odvrácenou stranu. Když se ztlumí odměna, může se ztlumit i radost z chůze, hudby, setkání nebo práce. Říká se tomu anhedonie — ne deprese z titulku, ale plošší prožitek. Není jasné, jak často to je přímý účinek léku, jak často důsledek rychlého úbytku hmotnosti, nízkého příjmu energie, nevolnosti nebo už existující úzkosti.",
          "Redakce nevymýšlí pacientské příběhy. Nevíme, kolik čtenářů v Česku lék užívá, a nebudeme to hádat. Víme, že schválená indikace není „vypnout alkohol“ a není „vypnout radost“. Pokud se nálada, spánek nebo zájem o lidi zhorší, patří to k lékaři, který lék vede — ne na diskuzní vlákno.",
        ],
        list: [
          "Lék nemění to, že alkohol poškozuje játra, spánek a krevní tlak.",
          "Méně chuti na alkohol není totéž co léčba závislosti.",
          "Plošší nálada, myšlenky na ublížení sobě nebo zmatenost: kontaktujte lékaře, linku 116 123, nebo 155.",
        ],
      },
      {
        h2: "Co už umíme říct opatrně",
        paras: [
          "Pozorovací práce a první randomizované pokusy naznačují, že někteří lidé na semaglutidu nebo tirzepatidu snižují příjem alkoholu. Vzorky jsou zatím malé, sledování krátké a lidé s těžkou závislostí v nich často chybí. Z toho neplyne, že by si měl někdo lék říct „na pití“.",
          "Na štítku v Evropě i v Česku zůstávají známá rizika: nevolnost, zvracení, průjem, zácpa, žlučníkové potíže, vzácněji pankreatitida. Rychlý úbytek hmotnosti bez bílkovin a síly zhoršuje svalovou hmotu — tedy healthspan, o kterém magazín píše častěji než o kilogramu na váze.",
          "Kdo lék užívá, potřebuje plán na jídlo, které se dá sníst i při nevolnosti, a kontrolu u lékaře. Kdo ho neužívá, nepotřebuje „stack“ z reklamy. Chůze, bílkovina, spánek a alkohol, který si umíte spočítat, pořád drží víc než titulek o injekci.",
        ],
      },
      {
        h2: "Co s tím jako čtenář v Česku",
        paras: [
          "Pokud zvažujete lék kvůli cukrovce nebo obezitě, zeptejte se lékaře na indikaci, kontraindikace, sledování a na to, co dělat, když přestane chutnat jídlo i život. Pokud lék už berete a všimli jste si, že nepijete, zapište si to — je to údaj pro kontrolu, ne důkaz, že jste „vyléčení“.",
          "Pokud pijete tak, že to kazí práci, spánek nebo vztahy, cesta je adiktolog, praktický lékař a služby jako adiktologie.cz — ne objednávka pera. Redakce nepíše, že GLP-1 závislost vyléčí. Píše, že odměna v mozku je jeden mechanismus a že ho zatím umíme popsat jen hrubě.",
          "Text slouží ke vzdělávání. Nenahrazuje vyšetření, recept ani krizovou pomoc. ViaLongeVita drží českou redakci v češtině; zahraniční desky píší totéž téma pro svého lékaře, regulátora a tísňové číslo.",
        ],
      },
    ],
  },
  "en-US": {
    slugTail: "glp1-reward-alcohol",
    title: "GLP-1 shots and the reward system: less interest in alcohol, sometimes less joy",
    excerpt:
      "Semaglutide-class medicines can quiet food noise. Some people also drink less. A smaller group describes a flatter mood. The US desk explains what is known — FDA labels, a PCP, 911 — not a miracle, not a shopping tip.",
    topic: "zivotni-styl",
    keywords: ["GLP-1", "semaglutide", "alcohol", "reward", "FDA", "PCP"],
    sections: [
      {
        h2: "Why this is a US desk story",
        paras: [
          "GLP-1 receptor agonists started as type-2 diabetes drugs. Some later gained obesity indications. ViaLongeVita does not sell them and does not prescribe them. We write because the conversation has moved from the endocrinology clinic into ordinary talk about weight, food noise, and now alcohol.",
          "Readers describe fewer looping thoughts about food. Some add that wine with dinner lost its pull. That is not proof the drug treats alcohol-use disorder. It is a signal researchers are testing. The US frame is FDA labelling, a primary-care clinician or endocrinologist, and a licensed pharmacy — not a compounded pen from a comment thread.",
          "Chest pain, severe vomiting, confusion or fainting is 911. This page is not triage.",
        ],
      },
      {
        h2: "What the brain hypothesis actually says",
        paras: [
          "GLP-1 receptors sit in the gut and pancreas — and in circuits that score reward: food, alcohol, sometimes tobacco or aimless scrolling. A medicine that turns the volume down on one signal can turn it down on others. That is a plausible reason some people drink less without a New Year pledge.",
          "The same idea has a downside. If reward is quieter, walking, music, friends or work can feel flatter. Clinicians call that anhedonia. It is not a magazine diagnosis of depression. It may be the drug, a calorie deficit, rapid weight loss, nausea, or anxiety that was already there. We do not invent patient names or invent how common this is.",
          "The approved indication is not “switch off alcohol” and not “switch off joy.” If mood, sleep or interest in people drops, that belongs with the clinician who prescribed the pen.",
        ],
        list: [
          "Less craving is not treatment of addiction.",
          "Alcohol still harms sleep, blood pressure and the liver.",
          "Thoughts of self-harm, severe confusion or collapse: 911 or the 988 Suicide & Crisis Lifeline.",
        ],
      },
      {
        h2: "What we can say without overclaiming",
        paras: [
          "Observational work and early trials suggest some people on semaglutide or tirzepatide reduce alcohol intake. Samples are small, follow-up is short, and people with severe dependence are often missing. Nobody should ask for a GLP-1 “for drinking.”",
          "US labels still list nausea, vomiting, diarrhoea, constipation, gallbladder disease and, rarely, pancreatitis. Fast weight loss without protein and strength training costs muscle — the healthspan the magazine cares about more than a viral before-and-after.",
          "If you take the drug, you need a meal you can still eat and a follow-up plan. If you do not, you do not need a social-media stack. Walking, protein, sleep and a drink count you can state out loud still outlast a headline.",
        ],
      },
      {
        h2: "What to do in the United States",
        paras: [
          "Considering a GLP-1 for diabetes or obesity: ask your PCP about indications, contraindications, monitoring, and what to do if food and life both go quiet. Already on one, and you stopped drinking: write it down for the next visit. It is a data point, not a cure.",
          "If alcohol is damaging work, sleep or relationships, the path is a clinician and local addiction services — SAMHSA’s helpline is 1-800-662-4357 — not an online pen. This desk will not claim GLP-1 cures addiction. It will say the reward system is one mechanism, and we still describe it roughly.",
          "Educational copy only. Not a prescription. Other MedScopeGlobal desks cover the same science for their regulators and emergency numbers.",
        ],
      },
    ],
  },
  "en-UK": {
    slugTail: "glp1-reward-alcohol",
    title: "GLP-1 injections and reward: less pull toward alcohol, sometimes less pleasure",
    excerpt:
      "Some people on semaglutide-class medicines drink less. A few describe a flatter mood. The UK desk keeps MHRA, a GP, 111 and 999 in the frame — no miracle, no grey-market pen.",
    topic: "zivotni-styl",
    keywords: ["GLP-1", "semaglutide", "alcohol", "MHRA", "GP", "NHS"],
    sections: [
      {
        h2: "A UK story, not a Czech circular",
        paras: [
          "GLP-1 receptor agonists began as type-2 diabetes medicines. Some now have obesity licences. We do not sell them. We write because food noise, weight and alcohol have become one conversation in British clinics and kitchens.",
          "People report fewer circling thoughts about food, and sometimes less interest in wine. That is not an MHRA licence to treat alcohol dependence. It is a research signal. The path here is a GP, specialist weight or diabetes services, and an MHRA-regulated product — not an imported pen.",
          "Chest pain, collapse or severe vomiting: 999. Advice that is not urgent: 111.",
        ],
      },
      {
        h2: "Reward circuits, said carefully",
        paras: [
          "GLP-1 receptors sit in gut, pancreas and brain circuits that score reward. Turning one volume knob can turn others. That may be why some people drink less without deciding to “be good.”",
          "The same knob can flatten pleasure in walking, music or company. Anhedonia is a clinical word, not a headline. Causes may include the drug, a calorie gap, rapid weight loss or nausea. We do not invent how common this is in the UK.",
          "Licensed indications do not include “stop drinking” or “feel less.” If mood or sleep falls apart, contact the prescriber or the GP.",
        ],
        list: [
          "Less craving is not addiction treatment.",
          "Alcohol still harms sleep, blood pressure and the liver.",
          "Self-harm thoughts or collapse: 999, or Samaritans on 116 123.",
        ],
      },
      {
        h2: "Evidence without a sales pitch",
        paras: [
          "Early trials and clinic series suggest some people on semaglutide or tirzepatide drink less. Samples are small. Severe dependence is under-represented. Do not ask for a jab “for drinking.”",
          "Nausea, gallbladder trouble and rare pancreatitis remain on the label. Losing weight without protein and strength costs muscle — the healthspan this magazine actually defends.",
          "If you take the medicine, keep a meal you can tolerate and a follow-up. If you do not, walking, protein, sleep and an honest drink count still matter more than a headline.",
        ],
      },
      {
        h2: "What to do in the UK",
        paras: [
          "Ask the GP about indications, side effects and mood if you are considering or already using a GLP-1. Note any drop in alcohol — it is information, not a cure.",
          "If alcohol is damaging work or relationships, NHS addiction services and your GP are the route. This desk does not claim a cure.",
          "Educational only. Not a prescription. Not a substitute for 999.",
        ],
      },
    ],
  },
  en: {
    slugTail: "glp1-reward-alcohol",
    title: "GLP-1 medicines and reward: less interest in alcohol, sometimes less joy",
    excerpt:
      "Semaglutide-class drugs can quiet food noise. Some people also drink less. A smaller group describes a flatter mood. International desk: evidence, a family doctor, local emergency care — no miracle claim.",
    topic: "zivotni-styl",
    keywords: ["GLP-1", "semaglutide", "alcohol", "reward"],
    sections: [
      {
        h2: "Why magazines are writing this now",
        paras: [
          "GLP-1 receptor agonists started as type-2 diabetes medicines. Some later gained obesity indications. ViaLongeVita does not sell them. We write because food noise, weight and alcohol are now one public conversation.",
          "People describe fewer looping thoughts about food, and sometimes less pull toward a drink. That is not a licence to treat alcohol-use disorder. It is a research signal. Use a licensed clinician and a regulated pharmacy in your country.",
          "Chest pain, severe vomiting or collapse is local emergency care, not a search tab.",
        ],
      },
      {
        h2: "A brain hypothesis, not a slogan",
        paras: [
          "GLP-1 receptors sit in the gut, the pancreas and reward circuits. One volume knob can move several signals: food, alcohol, sometimes tobacco or scrolling.",
          "If reward is quieter, ordinary pleasure can flatten. Anhedonia is a clinical word. It may be the drug, a calorie deficit, rapid weight loss or nausea. We do not invent patient stories or subscriber counts.",
          "Approved labels do not say “switch off alcohol” or “switch off joy.” Mood changes belong with the prescriber.",
        ],
        list: [
          "Less craving is not addiction treatment.",
          "Alcohol still harms sleep, blood pressure and the liver.",
          "Self-harm thoughts or collapse: local emergency services.",
        ],
      },
      {
        h2: "What the early evidence can support",
        paras: [
          "Observational work and early trials suggest some people on semaglutide or tirzepatide drink less. Samples are small. Severe dependence is often missing. Do not request the drug “for drinking.”",
          "Nausea, gallbladder disease and rare pancreatitis remain relevant. Fast weight loss without protein and strength costs muscle.",
          "Walking, protein, sleep and an honest drink count still outlast a headline if you are not on the medicine.",
        ],
      },
      {
        h2: "What to do",
        paras: [
          "Ask a family doctor or specialist about indications, monitoring and mood. Write down any drop in alcohol for the next visit.",
          "If alcohol is damaging work or relationships, use local addiction services. This desk does not claim a cure.",
          "Educational copy. Not a prescription.",
        ],
      },
    ],
  },
  de: {
    slugTail: "glp1-belohnung-alkohol",
    title: "GLP-1-Arzneimittel und Belohnung: weniger Lust auf Alkohol, manchmal weniger Freude",
    excerpt:
      "Semaglutid und verwandte Stoffe können den „Lärm“ ums Essen dämpfen. Manche trinken weniger. Einige beschreiben eine flachere Stimmung. Deutsche Redaktion: Hausarzt, BfArM, 112 — kein Wundermittel.",
    topic: "zivotni-styl",
    keywords: ["GLP-1", "Semaglutid", "Alkohol", "Hausarzt", "BfArM"],
    sections: [
      {
        h2: "Warum das eine deutsche Desk-Geschichte ist",
        paras: [
          "GLP-1-Rezeptoragonisten kamen als Mittel gegen Typ-2-Diabetes. Einige haben später eine Adipositas-Zulassung erhalten. ViaLongeVita verkauft sie nicht. Wir schreiben, weil Essensgedanken, Gewicht und Alkohol in einer Unterhaltung gelandet sind.",
          "Leserinnen beschreiben weniger kreisende Gedanken ans Essen, manchmal weniger Interesse am Wein. Das ist keine Zulassung zur Behandlung einer Alkoholabhängigkeit. Es ist ein Forschungssignal. Rahmen hier: Hausarzt oder Facharzt, BfArM-zugelassenes Präparat, Apotheke — kein Importstift.",
          "Brustschmerz, starkes Erbrechen, Verwirrtheit: 112.",
        ],
      },
      {
        h2: "Was die Belohnungshypothese sagen kann",
        paras: [
          "GLP-1-Rezeptoren sitzen in Darm, Bauchspeicheldrüse und in Schaltkreisen, die Belohnung bewerten. Ein leiserer Regler kann mehrere Signale dämpfen.",
          "Dieselbe Idee hat eine Kehrseite: Spaziergang, Musik, Begegnung können flacher wirken. Anhedonie ist ein klinisches Wort, keine Magazin-Diagnose. Ursache kann das Mittel sein, ein Kaloriendefizit, rascher Gewichtsverlust oder Übelkeit. Wir erfinden keine Patientengeschichten.",
          "Die Zulassung lautet nicht „Alkohol aus“ und nicht „Freude aus“. Stimmungs- oder Schlafbruch gehört zur verordnenden Praxis.",
        ],
        list: [
          "Weniger Verlangen ist keine Suchttherapie.",
          "Alkohol schadet weiter Schlaf, Blutdruck und Leber.",
          "Suizidgedanken oder Kollaps: 112, Telefonseelsorge 0800 111 0 111.",
        ],
      },
      {
        h2: "Was sich vorsichtig sagen lässt",
        paras: [
          "Beobachtungen und frühe Studien deuten an, dass manche Menschen unter Semaglutid oder Tirzepatid weniger Alkohol trinken. Stichproben sind klein. Schwere Abhängigkeit fehlt oft. Niemand sollte das Mittel „gegen das Trinken“ verlangen.",
          "Übelkeit, Gallenbeschwerden, selten Pankreatitis stehen weiter auf der Information. Schneller Gewichtsverlust ohne Eiweiß und Kraft kostet Muskel — also Healthspan.",
          "Wer das Mittel nimmt, braucht eine essbare Mahlzeit und Kontrolle. Wer es nicht nimmt, braucht keinen Werbe-Stack. Gehen, Eiweiß, Schlaf und eine ehrliche Alkoholmenge bleiben die langweilige Mehrheit der Prävention.",
        ],
      },
      {
        h2: "Was Sie in Deutschland tun",
        paras: [
          "Sprechen Sie Indikation, Risiken und Stimmung mit dem Hausarzt oder der Diabetologie. Notieren Sie, wenn der Alkohol nachlässt — das ist ein Datum, keine Heilung.",
          "Schädigt Alkohol Arbeit oder Beziehungen, sind Suchtberatung und die Praxis der Weg. Diese Redaktion behauptet keine Heilung.",
          "Nur Bildung. Kein Rezept. Kein Ersatz für 112.",
        ],
      },
    ],
  },
  fr: {
    slugTail: "glp1-recompense-alcool",
    title: "Médicaments GLP-1 et récompense : moins d’envie d’alcool, parfois moins de plaisir",
    excerpt:
      "Le sémaglutide et ses proches peuvent calmer le bruit autour de la nourriture. Certains boivent moins. D’autres décrivent une humeur plus plate. Bureau français : médecin traitant, ANSM, 15/112 — pas de miracle.",
    topic: "zivotni-styl",
    keywords: ["GLP-1", "sémaglutide", "alcool", "médecin traitant", "ANSM"],
    sections: [
      {
        h2: "Pourquoi c’est un sujet de la rédaction française",
        paras: [
          "Les agonistes des récepteurs GLP-1 sont nés pour le diabète de type 2. Certains ont ensuite une indication dans l’obésité. ViaLongeVita ne les vend pas. Nous écrivons parce que le bruit alimentaire, le poids et l’alcool ne font plus qu’une conversation.",
          "Des lecteurs décrivent moins de pensées en boucle sur la nourriture, parfois moins d’intérêt pour le vin. Ce n’est pas une AMM pour traiter une dépendance à l’alcool. C’est un signal de recherche. Le cadre ici : médecin traitant ou spécialiste, produit dans le cadre ANSM, pharmacie — pas un stylo importé.",
          "Douleur thoracique, vomissements sévères, malaise : 15 ou 112.",
        ],
      },
      {
        h2: "Ce que l’hypothèse cérébrale permet de dire",
        paras: [
          "Les récepteurs GLP-1 sont dans l’intestin, le pancréas et des circuits qui notent la récompense. Baisser un volume peut en baisser d’autres.",
          "Le même mécanisme peut aplatir le plaisir d’une marche, d’une musique, d’un dîner. L’anhédonie est un mot clinique. La cause peut être le médicament, un déficit calorique, une perte de poids rapide ou des nausées. Nous n’inventons pas de témoignages.",
          "L’indication n’est pas « couper l’alcool » ni « couper la joie ». Un changement d’humeur appartient au prescripteur.",
        ],
        list: [
          "Moins d’envie n’est pas un traitement de l’addiction.",
          "L’alcool abîme encore le sommeil, la tension et le foie.",
          "Idées suicidaires ou malaise grave : 15, 112, ou 3114.",
        ],
      },
      {
        h2: "Ce que les premières données portent",
        paras: [
          "Des séries et des essais précoces suggèrent que certaines personnes sous sémaglutide ou tirzépatide boivent moins. Les échantillons sont petits. La dépendance sévère manque souvent. On ne demande pas un GLP-1 « pour boire moins ».",
          "Nausées, troubles biliaires, rarement pancréatite restent sur la notice. Maigrir vite sans protéines ni force coûte du muscle — le healthspan de ce magazine.",
          "Si vous prenez le médicament, gardez un repas tolérable et un suivi. Sinon, marche, protéines, sommeil et un compte d’alcool honnête restent la base.",
        ],
      },
      {
        h2: "Quoi faire en France",
        paras: [
          "Parlez indications, effets indésirables et humeur avec le médecin traitant. Notez une baisse d’alcool pour la prochaine consultation.",
          "Si l’alcool abîme le travail ou les liens, les CSAPA et le médecin sont le chemin. Cette rédaction ne promet pas une guérison.",
          "Texte éducatif. Pas une ordonnance. Pas un substitut au 15.",
        ],
      },
    ],
  },
  it: {
    slugTail: "glp1-ricompensa-alcol",
    title: "Farmaci GLP-1 e ricompensa: meno voglia di alcol, a volte meno piacere",
    excerpt:
      "Semaglutide e analoghi possono spegnere il rumore sul cibo. Alcuni bevono di meno. Qualcuno descrive un umore più piatto. Desk italiano: medico di base, AIFA, 118 — nessun miracolo.",
    topic: "zivotni-styl",
    keywords: ["GLP-1", "semaglutide", "alcol", "medico di base", "AIFA"],
    sections: [
      {
        h2: "Perché ne scrive la redazione italiana",
        paras: [
          "Gli agonisti del recettore GLP-1 nascono per il diabete di tipo 2. Alcuni hanno poi un’indicazione per l’obesità. ViaLongeVita non li vende. Scriviamo perché rumore alimentare, peso e alcol sono diventati un solo discorso.",
          "C’è chi descrive meno pensieri sul cibo e meno interesse per il vino. Non è un’autorizzazione AIFA a curare la dipendenza da alcol. È un segnale di ricerca. Il percorso è il medico di base o lo specialista e un farmaco in farmacia — non una penna importata.",
          "Dolore al petto, vomito grave, svenimento: 118.",
        ],
      },
      {
        h2: "Cosa può dire l’ipotesi sulla ricompensa",
        paras: [
          "I recettori GLP-1 stanno in intestino, pancreas e circuiti che valutano la ricompensa. Un volume più basso può muovere più segnali.",
          "Lo stesso meccanismo può appiattire il piacere di una camminata o di una cena. L’anedonia è una parola clinica. Può dipendere dal farmaco, da poche calorie, da un calo rapido o dalla nausea. Non inventiamo storie di pazienti.",
          "L’indicazione non è «spegnere l’alcol» né «spegnere la gioia». Un calo dell’umore va al prescrittore.",
        ],
        list: [
          "Meno craving non è una cura della dipendenza.",
          "L’alcol continua a danneggiare sonno, pressione e fegato.",
          "Idee di autolesionismo o collasso: 118.",
        ],
      },
      {
        h2: "Cosa dicono i primi dati",
        paras: [
          "Osservazioni e primi studi suggeriscono che alcune persone in semaglutide o tirzepatide bevono di meno. I campioni sono piccoli. La dipendenza grave manca spesso. Non si chiede un GLP-1 «per bere meno».",
          "Nausea, colecisti, raramente pancreatite restano in scheda. Perdere peso senza proteine e forza costa muscolo.",
          "Chi assume il farmaco serve un pasto tollerabile e un controllo. Chi non lo assume tiene camminata, proteine, sonno e un conto onesto dei drink.",
        ],
      },
      {
        h2: "Cosa fare in Italia",
        paras: [
          "Parlate di indicazioni, effetti e umore con il medico di base. Annotate un calo dell’alcol per la visita successiva.",
          "Se l’alcol rovina lavoro o relazioni, i servizi per le dipendenze sono la via. Questa redazione non promette una cura.",
          "Solo informazione. Non è una ricetta. Non sostituisce il 118.",
        ],
      },
    ],
  },
  es: {
    slugTail: "glp1-recompensa-alcohol",
    title: "Fármacos GLP-1 y recompensa: menos ganas de alcohol, a veces menos alegría",
    excerpt:
      "La semaglutida y sus parientes pueden callar el ruido en torno a la comida. Algunos beben menos. Otros describen un ánimo más plano. Mesa española: médico de cabecera, AEMPS, 112 — sin milagro.",
    topic: "zivotni-styl",
    keywords: ["GLP-1", "semaglutida", "alcohol", "médico de cabecera", "AEMPS"],
    sections: [
      {
        h2: "Por qué lo cuenta la redacción española",
        paras: [
          "Los agonistas del receptor GLP-1 nacieron para la diabetes tipo 2. Algunos tienen luego indicación en obesidad. ViaLongeVita no los vende. Escribimos porque el ruido alimentario, el peso y el alcohol ya son una sola conversación.",
          "Hay quien describe menos pensamientos sobre la comida y menos interés por el vino. Eso no es una autorización de la AEMPS para tratar una adicción. Es una señal de investigación. El marco es el médico de cabecera o el especialista y la farmacia — no un boli importado.",
          "Dolor torácico, vómitos intensos o desmayo: 112.",
        ],
      },
      {
        h2: "Qué permite decir la hipótesis de la recompensa",
        paras: [
          "Los receptores GLP-1 están en intestino, páncreas y circuitos que puntúan la recompensa. Bajar un volumen puede bajar otros.",
          "El mismo mecanismo puede aplanar el gusto por caminar o por una cena. La anhedonia es una palabra clínica. Puede ser el fármaco, un déficit de calorías, una pérdida rápida o las náuseas. No inventamos testimonios.",
          "La indicación no es «apagar el alcohol» ni «apagar la alegría». Un cambio de ánimo es cosa de quien prescribe.",
        ],
        list: [
          "Menos craving no es tratamiento de la adicción.",
          "El alcohol sigue dañando sueño, tensión e hígado.",
          "Ideas de autolesión o colapso: 112.",
        ],
      },
      {
        h2: "Qué sostienen los primeros datos",
        paras: [
          "Series y ensayos tempranos sugieren que algunas personas con semaglutida o tirzepatida beben menos. Las muestras son pequeñas. La dependencia grave suele faltar. Nadie pida un GLP-1 «para beber menos».",
          "Náuseas, vesícula y, rara vez, pancreatitis siguen en ficha. Adelgazar sin proteína ni fuerza cuesta músculo.",
          "Quien toma el fármaco necesita una comida tolerable y seguimiento. Quien no lo toma, camina, proteína, sueño y una cuenta honesta de copas.",
        ],
      },
      {
        h2: "Qué hacer en España",
        paras: [
          "Hable indicación, efectos e ánimo con el médico de cabecera. Anote si baja el alcohol: es un dato, no una cura.",
          "Si el alcohol daña el trabajo o los vínculos, los recursos de adicciones son el camino. Esta redacción no promete una curación.",
          "Texto educativo. No es una receta. No sustituye al 112.",
        ],
      },
    ],
  },
  "pt-BR": {
    slugTail: "glp1-recompensa-alcool",
    title: "Remédios GLP-1 e recompensa: menos vontade de álcool, às vezes menos alegria",
    excerpt:
      "Semaglutida e semelhantes podem reduzir o ruído em torno da comida. Alguns bebem menos. Outros descrevem um humor mais plano. Mesa brasileira: UBS, ANVISA, 192 — sem milagre.",
    topic: "zivotni-styl",
    keywords: ["GLP-1", "semaglutida", "álcool", "UBS", "ANVISA"],
    sections: [
      {
        h2: "Por que a redação brasileira escreve isto",
        paras: [
          "Os agonistas do receptor GLP-1 nasceram para o diabetes tipo 2. Alguns têm depois indicação em obesidade. A ViaLongeVita não os vende. Escrevemos porque ruído alimentar, peso e álcool viraram uma só conversa.",
          "Há quem descreva menos pensamentos sobre comida e menos interesse por vinho. Isso não é autorização da ANVISA para tratar dependência de álcool. É um sinal de pesquisa. O caminho é a UBS ou o especialista e a farmácia — não uma caneta importada.",
          "Dor no peito, vômito forte ou desmaio: 192.",
        ],
      },
      {
        h2: "O que a hipótese da recompensa permite dizer",
        paras: [
          "Receptores de GLP-1 estão no intestino, no pâncreas e em circuitos que pontuam recompensa. Baixar um volume pode baixar outros.",
          "O mesmo mecanismo pode achatar o gosto de caminhar ou de um jantar. Anedonia é palavra clínica. Pode ser o remédio, um déficit de calorias, perda rápida ou náusea. Não inventamos depoimentos.",
          "A indicação não é “desligar o álcool” nem “desligar a alegria”. Mudança de humor é com quem prescreveu.",
        ],
        list: [
          "Menos fissura não é tratamento de dependência.",
          "Álcool continua a prejudicar sono, pressão e fígado.",
          "Ideação suicida ou colapso: 192 ou o CVV 188.",
        ],
      },
      {
        h2: "O que os primeiros dados aguentam",
        paras: [
          "Séries e ensaios iniciais sugerem que algumas pessoas em semaglutida ou tirzepatida bebem menos. As amostras são pequenas. Dependência grave costuma faltar. Ninguém peça GLP-1 “para beber menos”.",
          "Náusea, vesícula e, raramente, pancreatite seguem na bula. Emagrecer sem proteína e força custa músculo.",
          "Quem usa o remédio precisa de uma refeição tolerável e retorno. Quem não usa mantém caminhada, proteína, sono e uma conta honesta de doses.",
        ],
      },
      {
        h2: "O que fazer no Brasil",
        paras: [
          "Fale de indicação, efeitos e humor na UBS ou com o especialista. Anote se o álcool caiu — é dado, não cura.",
          "Se o álcool estraga trabalho ou vínculos, os serviços de álcool e outras drogas são o caminho. Esta redação não promete cura.",
          "Texto educativo. Não é receita. Não substitui o 192.",
        ],
      },
    ],
  },
};
