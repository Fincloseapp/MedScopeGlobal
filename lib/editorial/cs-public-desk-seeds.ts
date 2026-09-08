import type { NativeDeskSeed } from "@/lib/editorial/native-desk-seed-types";
import { CS_YOGA_POHYB_SPANEK } from "@/lib/editorial/cs-desk-yoga-pohyb-spanek";

/** Czech public magazine floor — every Veřejnost hub has longform desk copy today. */
export const CS_PUBLIC_DESK: NativeDeskSeed[] = [
  ...CS_YOGA_POHYB_SPANEK,
  {
    slugTail: "vyziva-stredomorsky-talir",
    title: "Výživa bez extrémů: středomořský talíř v české kuchyni",
    excerpt:
      "Bílkovina, zelenina sezóny a celozrnná příloha — ne zázračná dieta. Redakce ukazuje, jak vypadá talíř v úterý, ne na dovolené.",
    topic: "zivotni-styl",
    keywords: ["výživa", "strava", "středomořská dieta", "bílkoviny", "kalor"],
    sections: [
      {
        h2: "Proč extrémy padají v českém týdnu",
        paras: [
          "Detox, zázračný prášek a „jen zelenina do pátku“ selhávají, protože ignorují směny, děti, jídelnu a únavu. Výživa, která drží, je talíř, který uvaříte dvakrát týdně a sníte i ve středu.",
          "Středomořský vzor není dovolená v Řecku. Je to hodně zeleniny, luštěniny, ryba nebo vejce, olej místo přepalovaného tuku a sladkost jako tečka, ne jako hlavní jídlo. Česká kuchyně to unese: čočka, kapusta, brambora, tvaroh, sleď, jablko.",
        ],
        list: [
          "Polovina talíře: zelenina nebo salát.",
          "Čtvrtina: bílkovina, kterou poznáte (maso, luštěnina, vejce, tvaroh).",
          "Čtvrtina: příloha, kterou snesete — ideálně celozrnná.",
        ],
      },
      {
        h2: "Bílkovina ke každému jídlu",
        paras: [
          "Sytost a svalová hmota — tedy healthspan — stojí na bílkovině víc než na zázračném suplementu. Senioři i lidé po dietách často jedí málo masa, vajec a luštěnin a pak „nemají sílu“.",
          "Není potřeba gramová tabulka z posilovny. Stačí se zeptat: byla v tomto jídle ruka velká porce bílkoviny? Pokud ne, doplňte tvaroh, vejce, čočku nebo rybu, ne další pečivo.",
        ],
      },
      {
        h2: "Kdy patří výživa k lékaři",
        paras: [
          "Neplánovaný úbytek hmotnosti, zvracení, krev ve stolici, žloutenka nebo neschopnost jíst patří k praktickému lékaři, ne na diskuzní vlákno. Cukrovka, ledviny a poruchy příjmu potravy mají vlastní plán — redakce ho nepíše za ambulance.",
          "Text slouží ke vzdělávání. Nenahrazuje dietologa ani recept. ViaLongeVita nepíše nákupní seznam zázraků.",
        ],
      },
    ],
  },
  {
    slugTail: "kosmetika-plet-spf",
    title: "Kosmetika na úrovni důkazů: SPF, bariéra kůže a retinoid jen s plánem",
    excerpt:
      "Dermokosmetika začíná fotoprotekcí a ceramidy, ne zázračným sérem. Retinol a lékařské retinoidy nejsou totéž.",
    topic: "zivotni-styl",
    keywords: ["kosmetika", "pleť", "spf", "sunscreen", "retinoid", "niacinamid", "ceramid", "fotoprotekce"],
    sections: [
      {
        h2: "Bariéra dřív než anti-age",
        paras: [
          "Pleť, která štípe, není připravená na agresivní kyseliny. Nejdřív čistění bez strhávání, hydratace s ceramidy a krém s SPF každý den, kdy jste venku — i v říjnu.",
          "Vrásky ze slunce opravuje stín a filtr, ne další ampule. Minerální i chemické filtry fungují, když je vrstva dostatečná a obnovujete ji.",
        ],
        list: [
          "SPF na obličej a uši, nejen na dovolené.",
          "Niacinamid a ceramidy snáší většina pletí.",
          "Retinoid na předpis patří k dermatologovi; volně prodejný retinol začíná pomalu.",
        ],
      },
      {
        h2: "Kdy k dermatologovi, ne do e-shopu",
        paras: [
          "Měnící se znaménko, nehojící se rána, náhlý otok nebo hnisavá akné u dospělého patří k lékaři. Těhotenství mění, co smíte na obličej — zeptejte se, než koupíte kyselinu.",
          "Redakce neprodává krémy. Píše, že fotoprotekce a klidná bariéra jsou základ, který přežije i další sezónu zázraků.",
        ],
      },
    ],
  },
  {
    slugTail: "stres-odolnost-spanek",
    title: "Stres a odolnost: spánek, chůze a hranice, kdy už k odborníkovi",
    excerpt:
      "Psychická pohoda není motivace z reels. Burnout, úzkost a nespavost mají praktické první kroky — a jasnou linku na pomoc.",
    topic: "zivotni-styl",
    keywords: ["stres", "úzkost", "burnout", "odolnost", "resilien", "psychická pohoda"],
    sections: [
      {
        h2: "Tělo drží stres, i když „to zvládáte“",
        paras: [
          "Tlak, tep, spánek a chuť k jídlu se mění dřív, než si přiznáte vyhoření. První pomoc je regenerace, kterou umíte: stejný čas vstávání, denní světlo, chůze, alkohol dolů.",
          "Není slabost říct, že práce, péče o blízké a noční scrolování se sečetly. Je to zdravotní zátěž.",
        ],
      },
      {
        h2: "Kdy to není „jen stres“",
        paras: [
          "Myšlenky na ublížení sobě, neschopnost vstát, záchvaty paniky, týdny nespavosti nebo alkohol jako jediný spínač — praktický lékař, psychiatr, linka 116 123, v ohrožení 155.",
          "ViaLongeVita neučí dýchání místo léčby deprese. Učí, že odolnost má hygienu stejně jako zuby — a že diagnóza patří k člověku s razítkem, ne k aplikaci.",
        ],
      },
    ],
  },
  {
    slugTail: "ergonomie-sedava-prace",
    title: "Ergonomie u stolu: držení těla, obrazovka a bolest, která není „věk“",
    excerpt:
      "Sedavá kancelář kazí záda, krk i cukr v krvi. Nastavení židle je začátek, ne celá prevence.",
    topic: "zivotni-styl",
    keywords: ["ergonomie", "držení těla", "kancelář", "obrazovka", "sedav", "bederní"],
    sections: [
      {
        h2: "Obrazovka ve výšce očí, nohy na zemi",
        paras: [
          "Bederní opora, předloktí rovně, monitor tak, abyste nelámali krk. Notebook na klíně je nejrychlejší cesta k bolesti mezi lopatkami.",
          "Každých 30–40 minut vstaňte. Mini pauza má větší efekt než dokonalá židle, na které sedíte osm hodin.",
        ],
      },
      {
        h2: "Bolest, která nepatří k „kanceláři“",
        paras: [
          "Bolest vystřelující do nohy, slabost, brnění obou rukou v noci, horečka nebo úraz — lékař, ne další polštářek. Noční brnění prstů může být tunel, ne „špatná myš“.",
          "Ergonomie snižuje zátěž. Nediagnostikuje. Redakce nepíše pracovní lékařství za vaši firmu.",
        ],
      },
    ],
  },
  {
    slugTail: "dlouhovekost-healthspan",
    title: "Dlouhověkost bez hype: healthspan, spánek, pohyb a krevní tlak",
    excerpt:
      "Roky ve zdraví stojí na režimu a kontrole rizik, ne na zázračném stacku. Co má důkaz a co je reklama.",
    topic: "dlouhovekost",
    keywords: ["dlouhověkost", "healthspan", "longevity", "biomarkery", "stárnutí"],
    sections: [
      {
        h2: "Healthspan není věk na účtu",
        paras: [
          "Dlouhověkost v magazínu ViaLongeVita znamená roky, kdy vyjdete schody, spíte a držíte vztahy. Ne číslo z aplikace a ne suplement z reklamy.",
          "Nejsilnější páky zůstávají nudné: krevní tlak, kouření, cukr, spánek, síla, chůze, alkohol, který si umíte spočítat. Biomarker bez lékaře je pohlednice, ne diagnóza.",
        ],
        list: [
          "Tlak a lipidy: praktický lékař, ne marketplace.",
          "Sval a rovnováha: prevence pádů.",
          "Spánek: stejný čas vstávání víc než melatonin z e-shopu.",
        ],
      },
      {
        h2: "Co redakce odmítá slíbit",
        paras: [
          "Žádný článek tady nenařídí rapamycin, NAD ani „biologický věk“ z reklamního testu. Když studie existuje, napíšeme omezení. Když neexistuje, nenahradíme ji nadšením.",
          "Text je vzdělávání. Individuální plán patří k lékaři, který vás zná.",
        ],
      },
    ],
  },
  {
    slugTail: "prevence-screening-ockovani",
    title: "Prevence v Česku: prohlídky, screening a očkování bez strašení",
    excerpt:
      "Praktický lékař, mamograf, stolice na krev a sezónní vakcíny — co je program a co je volba. Bez nákupního seznamu.",
    topic: "prevence",
    keywords: ["prevence", "screening", "očkování", "prohlídka", "mamograf"],
    sections: [
      {
        h2: "Prohlídka není formalita",
        paras: [
          "Preventivní prohlídka u praktického lékaře má kalendář podle věku. Tlak, krev, kůže, očkování a otázky, které se v běžné chřipkové sezóně nevejdou.",
          "Screening nádorů prsu, děložního hrdla a tlustého střeva má v Česku program. Účast není panika. Je to statistika, která zachytí změnu dřív, než bolí.",
        ],
      },
      {
        h2: "Očkování jako hygiena, ne jako identita",
        paras: [
          "Sezónní chřipka, covid u rizikových skupin, klíště, pneumokok u seniorů — indikace říká lékař, ne vlákno. Redakce nepíše, že vakcína je zbytečná, a nepíše, že nahradí mytí rukou.",
          "Po očkování běžná únava a lokální bolest nejsou důvod k pohotovosti. Dušnost, vyrážka po celém těle, kolaps — 155.",
        ],
      },
    ],
  },
  {
    slugTail: "nemoci-kdy-k-lekari",
    title: "Symptomy: kdy k lékaři hned a kdy stačí ordinace",
    excerpt:
      "Bolest na hrudi, náhlá řeč, krvácení — 155. Přetrvávající horečka a nová bulka — praktik. Jak nerozmazat hranici.",
    topic: "nemoci",
    keywords: ["symptomy", "nemoci", "bolest na hrudi", "dušnost", "praktický lékař"],
    sections: [
      {
        h2: "Teď, ne zítra",
        paras: [
          "Bolest na hrudi, dušnost v klidu, náhlá slabost poloviny těla, porucha řeči, nejhorší bolest hlavy života, silné krvácení, ztráta vědomí, zmatenost, horečka s vyrážkou u dítěte — tísňová linka 155.",
          "Internetový seznam příznaků není triage. Když máte pochybnost u těchto značek, volejte. Lepší falešný poplach než čekání na článek.",
        ],
      },
      {
        h2: "Praktický lékař, ne pohotovost",
        paras: [
          "Kašel třetí týden, únava, která neustupuje, nová bulka, krev ve stolici, žloutenka, hubnutí bez diety, noční pocení — objednejte se. To nejsou „banality“, ale také to není důvod blokovat záchranku.",
          "ViaLongeVita nestanoví diagnózu z titulku. Učí hranici mezi vzděláváním a urgentní medicínou.",
        ],
      },
    ],
  },
  {
    slugTail: "rozhovor-praktik-prevence",
    title: "Rozhovor s praktickým lékařem: co skutečně změní riziko infarktu",
    excerpt:
      "Tlak, kouření, chůze a prohlídka — bez strašení. Lékař vysvětluje, co má důkaz v české ambulanci.",
    topic: "rozhovory",
    keywords: ["rozhovor", "praktický lékař", "prevence", "srdce", "tlak"],
    sections: [
      {
        h2: "Co by si měl čtenář odnést",
        paras: [
          "„Nejčastěji vidím lidi, kteří znají rizika a stejně odkládají tlakoměr. Infarkt nezačíná v nemocnici. Začíná roky, kdy nikdo neměřil tlak a cigareta byla ‚pár denně‘.“",
          "„Chůze většinu dnů, sůl dolů, kontrola cholesterolu. Není to Instagram. Je to práce, která v Česku furt platí.“",
        ],
      },
      {
        h2: "Otázka redakce: doplňky a zázraky",
        paras: [
          "„Když se mě ptají na zázračný prášek, ptám se nejdřív na spánek, alkohol a jestli vůbec byli na prevenci. Doplněk bez toho je drahý placebo obal.“",
          "Rozhovor je vzdělávání, ne ordinace. Individuální léčba patří k vašemu lékaři. V akutních stavech 155.",
        ],
      },
    ],
  },
];
