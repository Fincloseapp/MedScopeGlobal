import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type PhysicianRoomId =
  | "guidelines"
  | "prehledy"
  | "studie"
  | "research-hub"
  | "ai-asistent";

type RoomPack = {
  back: string;
  kicker: string;
  trial: string;
  destKicker: string;
  destTitle: string;
  adsNote: string;
  rooms: Record<PhysicianRoomId, { lead: string; method: [string, string][]; source: string }>;
};

const PACK: Record<ChromePack, RoomPack> = {
  cs: {
    back: "Zpět na lékařský desk",
    kicker: "Lékařská zóna · bez reklam",
    trial: "14 dní zdarma — OrdiZapis",
    destKicker: "Kam dál",
    destTitle: "Stejný desk, ověřitelný zdroj.",
    adsNote: "Reklama zdravotnických firem patří na ViaLongeVita, ne sem.",
    rooms: {
      guidelines: {
        lead: "Klinická doporučení s odkazem na primární zdroj. Není to náhrada guidelines odborné společnosti.",
        method: [
          ["Primární zdroj", "Každé doporučení má jít k DOI, PMID nebo stránce odborné společnosti."],
          ["Ne náhrada", "Není to substitut guidelines ČLS JEP ani zahraniční společnosti."],
          ["Vedle zápisu", "OrdiZapis zůstává dokumentací z ambulance — ne článkem a ne guideline."],
        ],
        source: "Odkazy vedou na interní desk a veřejné zdroje. Nevymýšlíme doporučení ani dávkování.",
      },
      prehledy: {
        lead: "Strukturované briefy pro rychlé čtení mezi ambulancemi. Každý brief má jít k DOI nebo PMID.",
        method: [
          ["Krátký brief", "Struktura pro pauzu mezi pacienty — ne souhrn bez identifikátoru."],
          ["DOI nebo PMID", "Když identifikátor chybí, brief sem nepatří."],
          ["České prostředí", "Přehledy jsou vázané na českou odbornou sekci, ne na vymyšlený zahraniční produkt."],
        ],
        source: "Brief není recenze ani doporučení léčby. Primární článek zůstává nad ním.",
      },
      studie: {
        lead: "RCT a meta-analýzy s ověřitelným identifikátorem. Bez vymyšlených výsledků a bez slibu praxe.",
        method: [
          ["Identifikátor", "RCT a meta-analýza jen s DOI nebo PMID. Bez něj řádek neukazujeme."],
          ["Žádný slib praxe", "Shrnutí není návod k léčbě a nenahrazuje čtení primárního článku."],
          ["Research Hub", "AI analýza je vedle — identifikátor studie zůstává vidět."],
        ],
        source: "Nevymýšlíme p-hodnoty, N ani závěr. Když řádek nemá zdroj, neprojde.",
      },
      "research-hub": {
        lead: "PubMed a AI analýza jako pracovní stůl — identifikátor studie zůstává vidět. Nediagnostikuje.",
        method: [
          ["PubMed na stole", "Vyhledávání a AI rozbor vedle sebe. PMID nebo DOI zůstává v záhlaví."],
          ["Ne diagnóza", "Nástroj neslibuje diferenciální diagnózu ani změnu terapie."],
          ["Kontrola zdroje", "Když model něco tvrdí, ověřte to na primárním záznamu — ne v chatu."],
        ],
        source: "AI je kontext k evidenci, ne recenzent a ne kolega ve službě.",
      },
      "ai-asistent": {
        lead: "Klinický kontext k guidelines a studiím. Není to diagnóza, předpis ani náhrada kolegy.",
        method: [
          ["Kontext, ne verdikt", "Asistent čte guidelines a studie. Nerozhoduje o pacientovi."],
          ["Bez předpisu", "Nevypisuje recept, dávku ani neschopenku."],
          ["Stejný účet", "14denní trial OrdiZapisu je dokumentace. Tohle je jen kontext k evidenci."],
        ],
        source: "Není to zdravotnický prostředek a nenahrazuje klinický úsudek.",
      },
    },
  },
  en: {
    back: "Back to the physician desk",
    kicker: "Physician zone · no ads",
    trial: "14 days free — OrdiZapis",
    destKicker: "Next",
    destTitle: "The same desk, a verifiable source.",
    adsNote: "Health-company ads sit on ViaLongeVita, not here.",
    rooms: {
      guidelines: {
        lead: "Practice pathways with a primary-source link. This is not a substitute for a society guideline.",
        method: [
          ["Primary source", "Each pathway should reach a DOI, PMID, or the society page."],
          ["Not a substitute", "This does not replace a ČLS JEP or international society guideline."],
          ["Beside the note", "OrdiZapis stays the clinic note — not an article and not a guideline."],
        ],
        source: "Links go to the internal desk and public sources. We do not invent recommendations or doses.",
      },
      prehledy: {
        lead: "Structured briefs for a short read between clinics. Each brief should reach a DOI or PMID.",
        method: [
          ["Short brief", "A structure for a gap between patients — not a summary without an identifier."],
          ["DOI or PMID", "If the identifier is missing, the brief does not belong here."],
          ["Czech desk", "Briefs stay tied to the Czech professional desk, not an invented foreign product."],
        ],
        source: "A brief is not a review or a treatment recommendation. The primary paper stays above it.",
      },
      studie: {
        lead: "RCTs and meta-analyses with a verifiable identifier. No invented results and no practice promise.",
        method: [
          ["Identifier", "RCTs and meta-analyses only with a DOI or PMID. No identifier, no row."],
          ["No practice promise", "A summary is not a treatment guide and does not replace the primary paper."],
          ["Research Hub", "AI analysis sits beside it — the study identifier stays visible."],
        ],
        source: "We do not invent p-values, N, or conclusions. A row without a source does not ship.",
      },
      "research-hub": {
        lead: "PubMed and AI analysis as a workbench — the study identifier stays visible. It does not diagnose.",
        method: [
          ["PubMed on the desk", "Search and AI reading sit together. PMID or DOI stays in the header."],
          ["Not a diagnosis", "The tool does not promise a differential or a therapy change."],
          ["Check the source", "If the model claims a finding, verify it on the primary record — not in chat."],
        ],
        source: "AI is context for evidence, not a reviewer and not a colleague on call.",
      },
      "ai-asistent": {
        lead: "Clinical context for guidelines and studies. Not a diagnosis, a prescription, or a colleague.",
        method: [
          ["Context, not a verdict", "The assistant reads guidelines and studies. It does not decide for a patient."],
          ["No prescription", "It does not write a script, a dose, or a sick note."],
          ["Same account", "The 14-day OrdiZapis trial is documentation. This is only context for evidence."],
        ],
        source: "This is not a medical device and does not replace clinical judgement.",
      },
    },
  },
  de: {
    back: "Zurück zum Arzt-Desk",
    kicker: "Arztzone · keine Werbung",
    trial: "14 Tage kostenlos — OrdiZapis",
    destKicker: "Weiter",
    destTitle: "Derselbe Desk, prüfbare Quelle.",
    adsNote: "Werbung von Gesundheitsfirmen steht auf ViaLongeVita, nicht hier.",
    rooms: {
      guidelines: {
        lead: "Praxiswege mit Primärquelle. Kein Ersatz für Leitlinien der Fachgesellschaft.",
        method: [
          ["Primärquelle", "Jeder Weg soll zu DOI, PMID oder zur Seite der Fachgesellschaft führen."],
          ["Kein Ersatz", "Kein Ersatz für Leitlinien der ČLS JEP oder einer internationalen Gesellschaft."],
          ["Neben der Notiz", "OrdiZapis bleibt die Praxisnotiz — kein Artikel und keine Leitlinie."],
        ],
        source: "Links führen zum internen Desk und zu öffentlichen Quellen. Keine erfundenen Empfehlungen.",
      },
      prehledy: {
        lead: "Strukturierte Briefs zwischen Sprechstunden. Jeder Brief soll zu DOI oder PMID führen.",
        method: [
          ["Kurzer Brief", "Struktur für die Pause zwischen Patienten — keine Zusammenfassung ohne ID."],
          ["DOI oder PMID", "Fehlt der Identifikator, gehört der Brief nicht hierher."],
          ["Tschechischer Desk", "Briefs bleiben an den tschechischen Fachdesk gebunden."],
        ],
        source: "Ein Brief ist keine Review und keine Therapieempfehlung. Der Primärartikel bleibt oben.",
      },
      studie: {
        lead: "RCTs und Metaanalysen mit prüfbarem Identifikator. Keine erfundenen Ergebnisse.",
        method: [
          ["Identifikator", "RCTs und Metaanalysen nur mit DOI oder PMID. Ohne ID keine Zeile."],
          ["Kein Praxisversprechen", "Die Kurzfassung ist kein Therapiepfad."],
          ["Research Hub", "KI-Analyse daneben — die Studien-ID bleibt sichtbar."],
        ],
        source: "Keine erfundenen p-Werte, N oder Schlüsse. Ohne Quelle keine Zeile.",
      },
      "research-hub": {
        lead: "PubMed und KI-Analyse als Werkbank — die Studien-ID bleibt sichtbar. Keine Diagnose.",
        method: [
          ["PubMed auf dem Tisch", "Suche und KI-Lektüre nebeneinander. PMID oder DOI bleibt im Kopf."],
          ["Keine Diagnose", "Kein Versprechen einer Differenzialdiagnose oder Therapieänderung."],
          ["Quelle prüfen", "Behauptet das Modell einen Befund, prüfen Sie den Primärdatensatz — nicht den Chat."],
        ],
        source: "KI ist Kontext zur Evidenz, kein Gutachter und kein Kollege im Dienst.",
      },
      "ai-asistent": {
        lead: "Klinischer Kontext zu Leitlinien und Studien. Keine Diagnose, kein Rezept, kein Kollege.",
        method: [
          ["Kontext, kein Urteil", "Der Assistent liest Leitlinien und Studien. Er entscheidet nicht am Patienten."],
          ["Kein Rezept", "Kein Rezept, keine Dosis, keine Arbeitsunfähigkeit."],
          ["Dasselbe Konto", "Der 14-Tage-OrdiZapis-Trial ist Dokumentation. Das hier ist nur Evidenzkontext."],
        ],
        source: "Kein Medizinprodukt und kein Ersatz für klinisches Urteil.",
      },
    },
  },
  fr: {
    back: "Retour au bureau médecin",
    kicker: "Espace médecins · sans pub",
    trial: "14 jours gratuits — OrdiZapis",
    destKicker: "Ensuite",
    destTitle: "Le même bureau, une source vérifiable.",
    adsNote: "La publicité des entreprises de santé est sur ViaLongeVita, pas ici.",
    rooms: {
      guidelines: {
        lead: "Chemins de pratique avec source primaire. Ce n’est pas un substitut aux guidelines de société.",
        method: [
          ["Source primaire", "Chaque chemin doit mener à un DOI, un PMID ou la page de la société."],
          ["Pas un substitut", "Cela ne remplace pas une guideline ČLS JEP ou internationale."],
          ["À côté de la note", "OrdiZapis reste la note de cabinet — pas un article ni une guideline."],
        ],
        source: "Les liens vont au bureau interne et aux sources publiques. Pas de recommandations inventées.",
      },
      prehledy: {
        lead: "Briefs structurés entre consultations. Chaque brief doit mener à un DOI ou PMID.",
        method: [
          ["Brief court", "Une structure entre deux patients — pas un résumé sans identifiant."],
          ["DOI ou PMID", "Sans identifiant, le brief n’a pas sa place ici."],
          ["Bureau tchèque", "Les briefs restent liés au bureau professionnel tchèque."],
        ],
        source: "Un brief n’est pas une revue ni une recommandation de traitement.",
      },
      studie: {
        lead: "ECR et méta-analyses avec identifiant vérifiable. Pas de résultats inventés.",
        method: [
          ["Identifiant", "ECR et méta-analyses seulement avec DOI ou PMID."],
          ["Pas de promesse clinique", "Le résumé n’est pas un guide de traitement."],
          ["Research Hub", "L’analyse IA est à côté — l’identifiant reste visible."],
        ],
        source: "Pas de p-values, de N ou de conclusions inventés.",
      },
      "research-hub": {
        lead: "PubMed et analyse IA comme établi — l’identifiant reste visible. Pas de diagnostic.",
        method: [
          ["PubMed sur le bureau", "Recherche et lecture IA côte à côte. PMID ou DOI reste en-tête."],
          ["Pas un diagnostic", "L’outil ne promet ni différentiel ni changement de thérapie."],
          ["Vérifier la source", "Si le modèle affirme un résultat, vérifiez l’enregistrement primaire."],
        ],
        source: "L’IA est un contexte pour l’évidence, pas un relecteur ni un collègue de garde.",
      },
      "ai-asistent": {
        lead: "Contexte clinique pour guidelines et études. Ni diagnostic, ni ordonnance, ni collègue.",
        method: [
          ["Contexte, pas un verdict", "L’assistant lit guidelines et études. Il ne décide pas pour un patient."],
          ["Pas d’ordonnance", "Ni ordonnance, ni dose, ni arrêt de travail."],
          ["Même compte", "L’essai OrdiZapis de 14 jours est de la documentation. Ici, seulement le contexte."],
        ],
        source: "Ce n’est pas un dispositif médical et ne remplace pas le jugement clinique.",
      },
    },
  },
  it: {
    back: "Torna al desk medico",
    kicker: "Zona medici · senza pubblicità",
    trial: "14 giorni gratis — OrdiZapis",
    destKicker: "Dopo",
    destTitle: "Lo stesso desk, una fonte verificabile.",
    adsNote: "La pubblicità delle aziende sanitarie sta su ViaLongeVita, non qui.",
    rooms: {
      guidelines: {
        lead: "Percorsi di pratica con fonte primaria. Non sostituisce le linee guida della società.",
        method: [
          ["Fonte primaria", "Ogni percorso deve arrivare a DOI, PMID o alla pagina della società."],
          ["Non un sostituto", "Non sostituisce una linea guida ČLS JEP o internazionale."],
          ["Accanto alla nota", "OrdiZapis resta la nota ambulatoriale — non un articolo né una linea guida."],
        ],
        source: "I link vanno al desk interno e a fonti pubbliche. Niente raccomandazioni inventate.",
      },
      prehledy: {
        lead: "Brief strutturati tra visite. Ogni brief deve arrivare a un DOI o PMID.",
        method: [
          ["Brief breve", "Una struttura tra un paziente e l’altro — non un riassunto senza identificatore."],
          ["DOI o PMID", "Senza identificatore il brief non sta qui."],
          ["Desk ceco", "I brief restano legati al desk professionale ceco."],
        ],
        source: "Un brief non è una review né una raccomandazione di terapia.",
      },
      studie: {
        lead: "RCT e meta-analisi con identificatore verificabile. Niente risultati inventati.",
        method: [
          ["Identificatore", "RCT e meta-analisi solo con DOI o PMID."],
          ["Nessuna promessa clinica", "Il riassunto non è una guida al trattamento."],
          ["Research Hub", "L’analisi IA sta accanto — l’identificatore resta visibile."],
        ],
        source: "Niente p-value, N o conclusioni inventati.",
      },
      "research-hub": {
        lead: "PubMed e analisi IA come banco — l’identificatore resta visibile. Non diagnostica.",
        method: [
          ["PubMed sul tavolo", "Ricerca e lettura IA insieme. PMID o DOI resta in intestazione."],
          ["Non una diagnosi", "Lo strumento non promette un differenziale né un cambio di terapia."],
          ["Controlla la fonte", "Se il modello afferma un risultato, verifica il record primario."],
        ],
        source: "L’IA è contesto per l’evidenza, non un revisore né un collega di guardia.",
      },
      "ai-asistent": {
        lead: "Contesto clinico per linee guida e studi. Non è una diagnosi, una ricetta o un collega.",
        method: [
          ["Contesto, non un verdetto", "L’assistente legge linee guida e studi. Non decide sul paziente."],
          ["Niente ricetta", "Non scrive ricetta, dose o certificato di malattia."],
          ["Stesso account", "Il trial OrdiZapis di 14 giorni è documentazione. Qui c’è solo il contesto."],
        ],
        source: "Non è un dispositivo medico e non sostituisce il giudizio clinico.",
      },
    },
  },
  es: {
    back: "Volver al escritorio médico",
    kicker: "Zona médica · sin anuncios",
    trial: "14 días gratis — OrdiZapis",
    destKicker: "Siguiente",
    destTitle: "El mismo escritorio, una fuente verificable.",
    adsNote: "La publicidad de empresas sanitarias está en ViaLongeVita, no aquí.",
    rooms: {
      guidelines: {
        lead: "Vías de práctica con fuente primaria. No sustituye una guía de sociedad.",
        method: [
          ["Fuente primaria", "Cada vía debe llegar a un DOI, PMID o a la página de la sociedad."],
          ["No sustituye", "No reemplaza una guía de ČLS JEP ni internacional."],
          ["Junto a la nota", "OrdiZapis sigue siendo la nota de consulta — no un artículo ni una guía."],
        ],
        source: "Los enlaces van al escritorio interno y a fuentes públicas. Sin recomendaciones inventadas.",
      },
      prehledy: {
        lead: "Briefs estructurados entre consultas. Cada brief debe llegar a un DOI o PMID.",
        method: [
          ["Brief breve", "Una estructura entre pacientes — no un resumen sin identificador."],
          ["DOI o PMID", "Sin identificador, el brief no pertenece aquí."],
          ["Escritorio checo", "Los briefs siguen ligados al escritorio profesional checo."],
        ],
        source: "Un brief no es una revisión ni una recomendación de tratamiento.",
      },
      studie: {
        lead: "ECA y metaanálisis con identificador verificable. Sin resultados inventados.",
        method: [
          ["Identificador", "ECA y metaanálisis solo con DOI o PMID."],
          ["Sin promesa clínica", "El resumen no es una guía de tratamiento."],
          ["Research Hub", "El análisis IA está al lado — el identificador sigue visible."],
        ],
        source: "No inventamos p-valores, N ni conclusiones.",
      },
      "research-hub": {
        lead: "PubMed y análisis IA como mesa de trabajo — el identificador sigue visible. No diagnostica.",
        method: [
          ["PubMed en la mesa", "Búsqueda y lectura IA juntas. PMID o DOI sigue en el encabezado."],
          ["No es un diagnóstico", "La herramienta no promete un diferencial ni un cambio de terapia."],
          ["Compruebe la fuente", "Si el modelo afirma un hallazgo, verifique el registro primario."],
        ],
        source: "La IA es contexto para la evidencia, no un revisor ni un colega de guardia.",
      },
      "ai-asistent": {
        lead: "Contexto clínico para guías y estudios. No es un diagnóstico, una receta ni un colega.",
        method: [
          ["Contexto, no un veredicto", "El asistente lee guías y estudios. No decide sobre un paciente."],
          ["Sin receta", "No escribe receta, dosis ni baja laboral."],
          ["Misma cuenta", "La prueba de 14 días de OrdiZapis es documentación. Aquí solo hay contexto."],
        ],
        source: "No es un producto sanitario y no sustituye el juicio clínico.",
      },
    },
  },
  "pt-BR": {
    back: "Voltar ao desk médico",
    kicker: "Zona médica · sem anúncios",
    trial: "14 dias grátis — OrdiZapis",
    destKicker: "Em seguida",
    destTitle: "O mesmo desk, uma fonte verificável.",
    adsNote: "A publicidade de empresas de saúde fica na ViaLongeVita, não aqui.",
    rooms: {
      guidelines: {
        lead: "Caminhos de prática com fonte primária. Não substitui guideline de sociedade.",
        method: [
          ["Fonte primária", "Cada caminho deve chegar a DOI, PMID ou à página da sociedade."],
          ["Não substitui", "Não substitui uma guideline da ČLS JEP nem internacional."],
          ["Ao lado da nota", "OrdiZapis continua a nota do consultório — não artigo nem guideline."],
        ],
        source: "Os links vão ao desk interno e a fontes públicas. Sem recomendações inventadas.",
      },
      prehledy: {
        lead: "Briefs estruturados entre consultas. Cada brief deve chegar a um DOI ou PMID.",
        method: [
          ["Brief curto", "Estrutura entre pacientes — não um resumo sem identificador."],
          ["DOI ou PMID", "Sem identificador, o brief não fica aqui."],
          ["Desk tcheco", "Os briefs continuam ligados ao desk profissional tcheco."],
        ],
        source: "Um brief não é revisão nem recomendação de tratamento.",
      },
      studie: {
        lead: "ECR e metanálises com identificador verificável. Sem resultados inventados.",
        method: [
          ["Identificador", "ECR e metanálises só com DOI ou PMID."],
          ["Sem promessa clínica", "O resumo não é um guia de tratamento."],
          ["Research Hub", "A análise de IA fica ao lado — o identificador permanece visível."],
        ],
        source: "Não inventamos p-valores, N nem conclusões.",
      },
      "research-hub": {
        lead: "PubMed e análise de IA como bancada — o identificador permanece visível. Não diagnostica.",
        method: [
          ["PubMed na mesa", "Busca e leitura de IA juntas. PMID ou DOI permanece no cabeçalho."],
          ["Não é diagnóstico", "A ferramenta não promete diferencial nem mudança de terapia."],
          ["Confira a fonte", "Se o modelo afirmar um achado, verifique o registro primário."],
        ],
        source: "A IA é contexto para a evidência, não revisor nem colega de plantão.",
      },
      "ai-asistent": {
        lead: "Contexto clínico para guidelines e estudos. Não é diagnóstico, receita nem colega.",
        method: [
          ["Contexto, não veredito", "O assistente lê guidelines e estudos. Não decide pelo paciente."],
          ["Sem receita", "Não escreve receita, dose nem atestado."],
          ["Mesma conta", "O trial de 14 dias do OrdiZapis é documentação. Aqui só há contexto."],
        ],
        source: "Não é dispositivo médico e não substitui o julgamento clínico.",
      },
    },
  },
};

export function getPhysicianRoomCopy(locale?: string | null): RoomPack {
  return PACK[chromePack(locale)];
}
