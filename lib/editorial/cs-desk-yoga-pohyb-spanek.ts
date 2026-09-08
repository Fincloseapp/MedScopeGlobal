import type { NativeDeskSeed } from "@/lib/editorial/native-desk-seed-types";

/** Education closer — legal publishing, not a prescription. */
export const CS_HUB_EDU_CLOSER =
  "Text slouží ke vzdělávání čtenářů ViaLongeVita na medscopeglobal.com. Nenahrazuje vyšetření, diagnózu ani individuální plán. V ohrožení života volejte 155.";

const LEGAL_NOTE =
  "Redakce cituje veřejná doporučení (WHO, NZIP, NIH/NCCIH, AASM) a parafrázuje jejich závěry. Nepřebíráme cizí novinové texty ani chráněné magazínové pasáže. Čísla níže jsou fakta z oficiálních dokumentů, ne kopie licencovaných článků.";

/**
 * Longform Czech desk for yoga, movement and sleep hubs.
 * Sources are official / public-health texts we may legally paraphrase and name.
 */
export const CS_YOGA_POHYB_SPANEK: NativeDeskSeed[] = [
  {
    slugTail: "spanek-rezim-hygiena",
    title: "Spánek jako healthspan: sedm hodin, tma a kdy už k lékaři",
    excerpt:
      "Americká spánková akademie drží sedm a více hodin noci. Český NZIP mluví o sedmi až osmi. ViaLongeVita drží režim, tmu a praktického lékaře — ne melatonin z reklamy.",
    topic: "zivotni-styl",
    keywords: ["spánek", "nespavost", "cirkadiánní", "melatonin", "hygiena spánku", "AASM"],
    closer: CS_HUB_EDU_CLOSER,
    sections: [
      {
        h2: "Proč spánek patří do dlouhověkosti, ne do lifestyle doplňků",
        paras: [
          "ViaLongeVita měří healthspan podle toho, jestli ráno vstanete, udržíte pozornost, krevní tlak a náladu — ne podle gadgetu na zápěstí. Spánek je v tomto pořadí první páka. Když ho osekáte na pět hodin „protože to tak zvládám“, tělo to zapíše do metabolismu, imunity a chyb za volantem. Magazín to neříká proto, aby strašil. Říká to proto, že konsenzus spánkové medicíny je v tomto bodě neobvykle přímý.",
          "Joint consensus American Academy of Sleep Medicine a Sleep Research Society z roku 2015 doporučuje dospělým ve věku 18 až 60 let pravidelně spát sedm a více hodin za noc. Pravidelné spaní pod šest hodin panel označil za nevhodné pro zdraví. NZIP v článku Spánek a zdraví uvádí, že dospělý organismus potřebuje k obnově sil zhruba sedm až osm hodin. Rozdíl mezi „sedm a víc“ a „sedm až osm“ není spor redakcí. Je to dvě instituce, které se shodují na spodní hranici a nechávají individuální potřebu lékaři, ne influencerovi.",
          "Dlouhověkost bez spánku je reklama. Člověk, který v noci opravuje e-maily a ráno si kupuje nootropic, neprodlužuje healthspan. Zkracuje regeneraci. To je diplomatická věta: nespíme proto, abychom byli produktivnější. Spíme proto, abychom zůstali schopní chodit, myslet a žít s lidmi, které máme rádi.",
        ],
      },
      {
        h2: "Co konsenzus skutečně říká — a co z něj neděláme dogma",
        paras: [
          "AASM a SRS výslovně píší, že zdravý spánek není jen délka. Potřebuje kvalitu, správné načasování, pravidelnost a nepřítomnost poruchy. Délka je nejčastěji zkoumaný parametr, proto se z ní stalo číslo v titulku. Individuální potřebu ovlivňuje genetika, chování, nemoci a prostředí. Kdo má pocit, že spí příliš málo nebo příliš moc, má podle stejného konsenzu mluvit se zdravotníkem — ne s diskuzním vláknem.",
          "Spaní nad devět hodin může být přiměřené u mladých dospělých, při splácení spánkového dluhu a při nemoci. U ostatních panel neuzavřel, že dlouhý spánek škodí. Proto AASM neklade horní strop jako zákaz. ViaLongeVita z toho nedělá „spi dvanáct hodin a omládneš“. Dělá z toho: nejdřív pravidelnost, pak délka, pak až doplněk.",
          "NZIP připomíná, že denní aktivita spánek zlepšuje, ale cvičení těsně před ulehnutím může nabuzením usínání zhoršit. To zapadá do našeho pořadí: pohyb patří do dne, ložnice patří noci. Není to ezoterika. Je to oddělení světla, tepla a vzrušení od tmy, ve které se má mozek uklidnit.",
        ],
        list: [
          "Cíl dospělého: pravidelně alespoň sedm hodin, v české praxi často sedm až osm.",
          "Stejný čas vstávání — i o víkendu přibližně — drží rytmus víc než drahý polštář.",
          "Kdo usíná za volantem, chrápe s pauzami dechu nebo nespí týdny, patří k lékaři.",
        ],
      },
      {
        h2: "Hygiena, která v českém bytě opravdu jde",
        paras: [
          "Ložnice má být tmavší, chladnější a tišší, než si myslíte, že „stačí“. Telefon v dosahu ruky je nejčastější domácí sabotáže. Kofein po obědě u citlivých lidí drží nabuzení do noci. Alkohol uspí rychleji a rozbije druhou polovinu noci — to není morální kázání, je to farmakologie. ViaLongeVita nepíše zákaz sklenky. Píše, že sklenka není lék na nespavost.",
          "Ranní světlo venku, i deset minut, je silnější signál než aplikace „circadian“. Směnný provoz a malé děti rytmus rozbíjejí; tam není vina čtenáře. Tam je úkol: chránit alespoň kotvu vstávání ve dnech, kdy to jde, a nehonit zázrak v noci, kdy dítě zvrací.",
          "Melatonin není bonbon. U přetrvávající nespavosti patří k lékaři, který vyloučí apnoe, depresi, bolest, štítnou žlázu a vedlejší účinky léků. Wearable, který hlásí „špatné skóre“, není diagnóza. Je to podnět, ne rozsudek.",
        ],
      },
      {
        h2: "Kdy nespavost není špatný týden",
        paras: [
          "Když nespíte týdny, chrápete a budíte se dušní, usínáte za volantem, máte noční bolest nebo myšlenky, že by bylo lépe nebýt, text končí a začíná medicína. Praktický lékař je v Česku správné první dveře. Apnoe se neřeší bylinou. Deprese se neřeší vypnutím Wi-Fi. Směny mají jiný plán než kancelář s pevným začátkem.",
          "Redakce nestraší diagnostikou z titulku. Říká, že spánek je zdravotní znak healthspanu stejně jako krevní tlak. Kdo ho ztratil na měsíce, nemá číst další seznam tipů. Má si říct o termín.",
        ],
      },
      {
        h2: "Zdroje a právní rámec uveřejnění",
        paras: [
          LEGAL_NOTE,
          "Níže uvedené instituce zveřejňují doporučení pro veřejnost nebo odborný konsenzus. Používáme je jako oporu, ne jako copy-paste cizího článku.",
        ],
        list: [
          "AASM a Sleep Research Society (2015): Recommended Amount of Sleep for a Healthy Adult — sedm a více hodin noci u dospělých 18–60 let.",
          "NZIP: Spánek a zdraví — regenerace dospělých zhruba 7–8 hodin, denní aktivita ano, cvičení těsně před spaním spíš ne.",
          "ViaLongeVita / MedScopeGlobal: healthspan, ne zázračný stack. Individuální léčba patří k vašemu lékaři.",
        ],
      },
    ],
  },
  {
    slugTail: "spanek-chrapani-smeny",
    title: "Chrápání, směny a spánková apnoe: co je hygiena a co už ambulance",
    excerpt:
      "Hlasité chrápání s pauzami dechu není vtip z dovolené. Směny rozbíjejí rytmus. ViaLongeVita odděluje režim od diagnózy — diplomaticky, bez paniky z internetu.",
    topic: "zivotni-styl",
    keywords: ["spánek", "chrápání", "apnoe", "nespavost", "směny", "hygiena spánku"],
    closer: CS_HUB_EDU_CLOSER,
    sections: [
      {
        h2: "Proč o chrápání píšeme bez posměchu",
        paras: [
          "V české domácnosti se chrápání často svádí na polohu, alkohol a „takhle spí táta odjakživa“. Část případů je opravdu mechanický chrapot měkkého patra. Část je obstrukční spánková apnoe: opakované pauzy dechu, pokles kyslíku, mikroprobuzení, denní spavost. To druhé není karakterová vada. Je to medicína, která zvedá riziko tlaku, nehod a únavy, kterou člověk svádí na věk.",
          "ViaLongeVita neposílá každého chrápajícího na laboratoř. Posílá signály, které partner nebo spolubydlící vidí dřív než pacient: pauzy dechu, dušení, ranní bolest hlavy, usínání u televize, usínání za volantem. Konsenzus AASM o délce spánku výslovně říká, že zdravý spánek vyžaduje i nepřítomnost poruchy. Hygiena ložnice apnoe nevyléčí.",
          "Diplomaticky: nestrkáme lidem diagnózu z článku. Nestrkáme jim ani stud, že „chrápou jako stroj“. Stud oddaluje termín. Termín je levnější než nehoda.",
        ],
      },
      {
        h2: "Směny, noci a senioři — tři různé plány",
        paras: [
          "Směnný provoz není selhání vůle. Je to střet s cirkadiánní biologií. Kdo střídá noci, nemá číst rady psané pro kancelář od devíti do pěti a citit se vinný. Platí kotvy, které jdou: tma na denní spánek po noční, slunce po probuzení, kofein cíleně, ne pořád, a alkohol jako usínací vynechat. Individuální plán směn patří k pracovním lékařům a praktikovi, ne k magazínu.",
          "NZIP popisuje u seniorů častou spánkovou inverzi: posilování ve dne, bdění v noci. Doporučení je denní aktivita a méně příležitosti spát odpoledne do hloubky, s výjimkou krátkého zdřímnutí. To není trest. Je to ochrana nočního spánku, který u starších lidí drží rovnováhu, náladu a riziko pádů.",
          "Malé děti, péče o nemocného a bolest rozbíjejí spánek stejně jako směny. Redakce tam nepíše „prostě choďte spát v deset“. Píše: chraňte alespoň jeden blok, kdy může spát pečovatel, a nenechte nespavost měsíců bez lékaře. Partner, který hlídá pauzy dechu, není donašeč. Je to první diagnostický svědek, kterého praktik uslyší dřív než laboratoř.",
        ],
        list: [
          "Partner slyší pauzy dechu nebo dušení: řekněte to praktickému lékaři, ne jen na rodinné oslavě. Zapište si, jak často to vidíte.",
          "Usínání za volantem je urgentní bezpečnost, ne vtip o únavě.",
          "Směny: tma na spánek ve dne, světlo po vstávání, bez alkoholu jako spínače.",
        ],
      },
      {
        h2: "Co zkoušet doma, než přijde termín — a co ne",
        paras: [
          "Poloha na boku, méně alkoholu večer, léčba rýmy, kontrola hmotnosti v rámci rozumného talíře a vynechání sedativ „od známého“ jsou opatření, která praktik obvykle podporuje. Nosní pásky a polštáře jsou experiment, ne důkaz. Nejsou škodlivé jako náhrada vyšetření, pokud z nich neděláte terapii apnoe.",
          "Nepokoušejte se o noční záznam mobilním mikrofonem jako o diagnózu. Může to být užitečný popud k lékaři. Nemůže to nahradit spánkovou laboratoř nebo domácí monitoring, který indikuje specialista. Melatonin, alkohol a antihistaminikum z kuchyňské skříňky nejsou CPAP.",
          "Když denní spavost ohrožuje práci s technikou nebo řízení, odložte rizikovou činnost a hledejte termín dřív, než „až po dovolené“. Healthspan zahrnuje, že se vrátíte večer živí. Stejně slušné je říct zaměstnavateli, že potřebujete vyšetření — spánková porucha není omluvenka z internetu, ale lékařská zpráva ano. Hmotnost, alkohol a kouření apnoe zhoršují u části lidí; redakce z toho nedělá posměch a nenasazuje CPAP z článku.",
        ],
      },
      {
        h2: "Hranice, kde článek končí",
        paras: [
          "Náhlá dušnost, bolest na hrudi, zmatenost, nejhorší bolest hlavy života nebo ztráta vědomí patří na 155. To není spánková hygiena. Přetrvávající nespavost, chrápání s pauzami a deprese patří do ambulance. ViaLongeVita zůstává vzdělávací vrstvou mezi NZIP a vaším lékařem. Není třetí diagnózou z vyhledávače.",
          "Děti s chrápáním, nočním pomočováním a neklidným spánkem nepatří do rady psané pro dospělé. Pediatra a ORL nechte rozhodnout, jestli jde o zvětšené mandle, alergii nebo něco jiného. Stejně tak těhotenství mění dýchání a chrápání; plán patří gynekologovi a praktikovi, ne výměně polštáře z e-shopu.",
          "Kdo už má CPAP nebo jinou předepsanou léčbu, článek ji nezruší. Hygiena ložnice ji doplňuje. Vynechat přístroj protože „dneska jsem nesnědl salám“ je experiment, který redakce nedoporučuje. Healthspan je, že ráno řídíte auto bdělí.",
        ],
      },
      {
        h2: "Zdroje a právní rámec uveřejnění",
        paras: [
          LEGAL_NOTE,
          "AASM výslovně odkazuje lidi, kteří spí příliš málo nebo příliš moc, na zdravotníka. Chrápání s pauzami dechu do této věty patří: není to „moc spánku“, je to porucha kvality spánku, kterou hygiena ložnice sama nevyřeší. NZIP k tomu přidává denní aktivitu seniorů, aby se noční spánek nerozpadl do inverze. Magazín ty dva veřejné hlasy skládá, nepřebírá cizí reportáže.",
        ],
        list: [
          "AASM/SRS (2015): zdravý spánek = délka, kvalita, načasování, pravidelnost a absence poruchy.",
          "NZIP: Spánek a zdraví — inverze u seniorů, denní aktivita, krátké zdřímnutí versus dlouhé posilování ve dne.",
          "Vzdělávací text MedScopeGlobal; léčba apnoe a směn patří k ošetřujícímu lékaři.",
        ],
      },
    ],
  },
  {
    slugTail: "pohyb-chuze-sila",
    title: "Pohyb podle WHO: 150 až 300 minut, síla dvakrát týdně, žádná posilovna povinně",
    excerpt:
      "Světová zdravotnická organizace drží 150–300 minut střední zátěže a posilování hlavních svalů dva dny v týdnu. NZIP totéž pro české dospělé. ViaLongeVita to překládá do chůze, schodů a nákupní tašky.",
    topic: "zivotni-styl",
    keywords: ["pohyb", "chůze", "síla sval", "sarkopenie", "exercise", "fitness", "WHO"],
    closer: CS_HUB_EDU_CLOSER,
    sections: [
      {
        h2: "Čísla, která nejsou fitness móda",
        paras: [
          "Doporučení WHO z roku 2020 k pohybové aktivitě a sedavému chování říká jasně: všichni dospělí by se měli hýbat pravidelně. Pro podstatný zdravotní přínos mají dospělí 18–64 let zvládnout 150 až 300 minut středně intenzivní aerobní aktivity týdně, nebo 75 až 150 minut intenzivní, nebo rovnocennou kombinaci. K tomu posilování hlavních svalových skupin alespoň dva dny v týdnu. Sedavý čas je třeba omezovat a nahrazovat pohybem jakékoli intenzity. Silné doporučení, střední jistota důkazů.",
          "NZIP v Doporučení pro pohybovou aktivitu dospělých totéž přenáší do češtiny: 150 až 300 minut střední vytrvalosti, nebo 75 až 150 minut vyšší intenzity, plus dva a více dnů síly. Nejdůležitější první krok podle NZIP je vystoupit z kategorie „fyzicky neaktivní“ aspoň do „trochu aktivní“. WHO to říká větou, kterou redakce opakuje bez studu: nějaký pohyb je lepší než žádný. Víc pohybu je lepší pro další přínos — nad 300 minut střední zátěže, pokud to tělo unese.",
          "ViaLongeVita z toho nedělá deset tisíc kroků jako náboženství. Dělá z toho týden, který unesete ve směně, s dětmi a s kolenem, které není z reklamy. Healthspan je schody bez dušnosti a jistota, že vstanete z podlahy. Není to heroická sobota a pět dní sezení.",
        ],
        list: [
          "Střední intenzita: zrychlená chůze, při které ještě mluvíte ve větách.",
          "Síla: dřep k židli, nošení nákupu, guma, schody — dva dny, ne jednou za čtvrt roku.",
          "Sedavost přerušujte; mini pauza má týdenní součet větší, než vypadá.",
        ],
      },
      {
        h2: "Český týden místo fitness studia",
        paras: [
          "Deset tisíc kroků jako dogma padá, protože ignoruje směny a bolest. Platí: většina dnů se hýbete a dvakrát týdně zvednete něco těžšího než nákupní tašku. Sedavé zaměstnání se neopraví jednou hodinou v posilovně. Schody, zastávka dřív, stání u telefonu — NEAT — mají větší týdenní součet, než vypadá na náramku.",
          "Sval je zásobárna bílkovin a jistota, že vstanete z podlahy. Sarkopenie začíná dřív, než si lidé připustí vanity. Je to pád, zlomenina a ztráta samostatnosti. WHO i NZIP proto sílu neuvádějí jako volitelný bonus pro „cvikaře“. Uvádějí ji vedle chůze jako základní dávku pro zdraví.",
          "Tréninkový plán na míru nepíšeme. Píšeme, že týden bez chůze a bez síly je rizikový faktor pomalejší než cigareta, ale stejně skutečný. Kdo má diabetické nohy, nestabilní anginu, čerstvou operaci nebo nevysvětlené pády, nezačíná podle článku. Začíná podle lékaře.",
          "Minuty se sčítají. Třikrát deset minut zrychlené chůze je pořád střední aktivita. WHO 2020 výslovně počítá aktivitu v průběhu týdne, ne jako jeden blok, který musíte vyblokovat v neděli. Česká pauza na zastávku dřív, schody místo výtahu a nákup pěšky je legitimní dávka, pokud zvedne dech a tep. Není to útěk před „pořádným cvičením“. Je to vstupenka k 150 minutám.",
          "Kolo, plavání a práce na zahradě sem patří, pokud je umíte opakovat. Běh není povinný. Intenzivní intervaly nejsou povinné. Povinné je nepřestat úplně, když bolí koleno — najít náhradu, kterou schválí lékař nebo fyzioterapeut. Healthspan je týdenní součet, který přežije chřipku, služební cestu a prázdniny.",
        ],
      },
      {
        h2: "Co slibovat nesmíme",
        paras: [
          "Pohyb snižuje riziko kardiovaskulárních chorob, cukrovky druhého typu a některých nádorů — to je jazyk WHO a NZIP, ne slib, že cvičením vyléčíte konkrétní diagnózu. Pohyb zlepšuje spánek, náladu a kognici v populačních datech. Není to antidepresivum na předpis a není to náhrada chemoterapie.",
          "Redakce neponižuje člověka, který začíná pěti minutami. WHO výslovně drží, že nějaká aktivita je lepší než nula. Ponižování v posilovně do ViaLongeVita nepatří. Diplomaticky platí i opačně: sedavost omluvená „nemám genetiku na sport“ není vědecký závěr. Je to rozhodnutí, které lze změnit po malých krocích.",
        ],
      },
      {
        h2: "Kdy pohyb odložit a volat pomoc",
        paras: [
          "Bolest na hrudi, náhlá dušnost, slabost poloviny těla, porucha řeči nebo kolaps — 155, ne další série cviků. Nová bolest kloubu s otokem, horečka nebo pád s úderem hlavy patří k lékaři. ViaLongeVita překládá veřejné doporučení do týdne, který jde uvařit. Nediagnostikuje vás z krokoměru.",
          "Po covidu, infarktu, náhradě kloubu nebo chemoterapii je návrat k pohybu medicína, ne výzva z aplikace. Kardiolog, onkolog a fyzioterapeut umí dávku, kterou článek nesmí hádat. Stejně diplomaticky: kdo se hýbe a má trvalou léčbu tlaku nebo cukrovky, pohyb obvykle patří do plánu — ale úpravu léků a zátěže říká ošetřující lékař, ne nadpis.",
        ],
      },
      {
        h2: "Zdroje a právní rámec uveřejnění",
        paras: [
          LEGAL_NOTE,
          "WHO Guidelines on Physical Activity and Sedentary Behaviour (2020) jsou dostupné pod licencí CC BY-NC-SA 3.0 IGO. Používáme parafrázi doporučení, ne grafiku ani logo WHO.",
        ],
        list: [
          "WHO 2020: 150–300 min střední nebo 75–150 min intenzivní aerobní aktivity týdně; síla ≥2 dny; omezit sezení.",
          "NZIP: Doporučení pro pohybovou aktivitu dospělých — stejná čísla, první krok ven z neaktivity.",
          "Vzdělávání MedScopeGlobal; individuální zátěž po nemoci patří k lékaři nebo fyzioterapeutovi.",
        ],
      },
    ],
  },
  {
    slugTail: "pohyb-sila-rovnovaha-seniori",
    title: "Po pětašedesátce: síla, rovnováha a pád, který healthspan zkrátí naráz",
    excerpt:
      "NZIP i WHO drží u seniorů stejných 150–300 minut a přidávají sílu, pohyblivost a rovnováhu. ViaLongeVita to čte jako prevenci pádu a samostatnost doma, ne jako senior aerobics z reklamy.",
    topic: "zivotni-styl",
    keywords: ["pohyb", "síla sval", "sarkopenie", "rovnováha", "senioři", "exercise", "chůze"],
    closer: CS_HUB_EDU_CLOSER,
    sections: [
      {
        h2: "Čísla se s věkem nemění, obsah ano",
        paras: [
          "NZIP v Doporučení pro pohybovou aktivitu seniorů opakuje stejný objem jako u mladších dospělých: 150 až 300 minut střední vytrvalosti, nebo 75 až 150 minut vyšší intenzity, plus dva a více dnů síly. Součástí týdne má být různorodý trénink — síla, vytrvalost, pohyblivost a rovnováha. Starší lidé s omezením mají zátěž individualizovat podle mobility a rizik. Nejdůležitější první krok je opět vystoupit z úplné neaktivity.",
          "WHO 2020 u starších dospělých drží totéž aerobní minimum a výslovně doporučuje víceprvkovou aktivitu, která zahrnuje rovnováhu, aby se snižovalo riziko pádů. Sedavý čas se má omezovat. To není „sportovní důchod“. To je samostatnost: vstanete z WC, dojdete na nákup, nezlomíte krček po koberečku.",
          "ViaLongeVita měří dlouhověkost podle let, kdy člověk žije doma v Česku, ne podle maratonu v sedmdesáti. Pád s frakturou je jeden z nejrychlejších způsobů, jak healthspan zkrátit naráz. Síla nohou a nácvik rovnováhy jsou proto skutečná prevence, ne vanity.",
        ],
        list: [
          "Chůze většinu dnů, i krátká smyčka kolem domu, počítá se do 150 až 300 minut střední zátěže.",
          "Síla: vstávání ze židle, nošení tašky, zábradlí jako pomůcka, ne jako hanba. Dva dny v týdnu stačí začít.",
          "Rovnováha: stoj u kuchyňské linky se držením dřezu, ne cvičení na nestabilní podložce z videa, když už padáte.",
        ],
      },
      {
        h2: "Jak začít, aniž byste si ublížili",
        paras: [
          "Kdo roky skoro neseděl jen u stolu, ale skoro jen seděl, nezačíná intervaly. Začíná minutami. NZIP i WHO to podporují větou o přestupu z nuly. Praktický lékař má vědět o nové dušnosti, angině, závrati, osteoporóze a lécích, které hrozí pádem. Fyzioterapeut umí sestavu lépe než článek.",
          "Jóga, tai-chi a pomalá chůze mohou být součástí týdne, pokud učitel ptá na bolest a pádovost. Nejsou povinné. Povinná je opakovatelnost. Tři sta minut týdně u člověka s artrózou může znamenat kolo, bazén a chůzi, ne běh. Redakce nehierarchizuje sporty. Hierarchizuje bezpečnost a součet minut.",
          "Diplomaticky k rodině: nenuťte rodiče do skupiny, kde se stydí. Stydlivost končí na gauči. Doprovod na smyčku parkem je často silnější intervence než dárek v podobě hodinek. Kdo bydlí sám, ať řekne sousedovi nebo terénní službě, že začíná chodit — pád bez svědka je horší než pád s telefonem v kapse.",
          "Rovnováha se cvičí u kuchyňské linky, ne na nestabilní podložce z infomercialu, když už jste dvakrát padli. WHO mluví o víceprvkové aktivitě: síla plus rovnováha plus vytrvalost. To může být vstávání ze židle, stoj na jedné noze se držením dřezu a chůze na nákup. Nemusí to být skupinové aerobic v neonu. Musí to jít třikrát týdně, i když prší.",
          "Vitamin D, vápník a léky na kosti sem patří jen jako téma k praktikovi, ne jako nákupní seznam z článku. Pohyb kosti zatěžuje užitečně, když je dávka odstupňovaná. Nárazový výlet na hory po roce sezení je rizikový faktor, ne healthspan.",
        ],
      },
      {
        h2: "Co pohyb u seniorů neslibuje",
        paras: [
          "Pohyb nesmaže demenci zítra a nahradí antihypertenzivum jen v reklamě. Snižuje riziko pádů a drží funkci, když je součástí týdne. U Parkinsonovy nemoci, po mrtvici nebo při těžké osteoporóze rozhoduje specialista. Článek je mapa, ne recept.",
          "Bolest na hrudi, náhlá slabost, porucha řeči, pád s úderem hlavy, neschopnost vstát — 155. Nová nestabilita a opakované zakopávání — praktik, ne další video „pro seniory“ s rychlými obraty hlavy.",
          "Osteoporóza, antikoagulace a porucha zraku mění, co je rozumné cvičit o samotě. Partner nebo terénní služba u prvních týdnů není ponížení. Je to prevence zranění, které by healthspan zkrátilo víc než týden bez cvičení. Obecní cvičení a kluby seniorů sem patří, pokud lektor umí říct stop.",
          "NZIP zdůrazňuje, že senioři jsou nejméně aktivní věková skupina, a proto má smysl podporovat i malý začátek. ViaLongeVita to překládá bez sentimentu: pět minut chůze na chodbě je začátek. Nula minut proto, že „už na to nejsem“, je rozhodnutí, které lze zítra změnit. Lékař má vědět, že začínáte — kvůli lékům na tlak, cukrovku a závrať, ne kvůli povolení žít.",
        ],
      },
      {
        h2: "Zdroje a právní rámec uveřejnění",
        paras: [
          LEGAL_NOTE,
          "WHO i NZIP píší pro celou populaci seniorů, ne pro jednoho čtenáře s konkrétní diagnózou. Proto redakce opakuje individualizaci: artróza, Parkinson, osteoporóza a antikoagulace mění dávku. Veřejné číslo 150–300 minut zůstává kompasem, ne rozkazem. Pád s úderem hlavy zůstává 155.",
        ],
        list: [
          "WHO 2020: starší dospělí — aerobní minimum jako u dospělých plus víceprvková aktivita s rovnováhou kvůli pádům.",
          "NZIP: Doporučení pro pohybovou aktivitu seniorů — síla, vytrvalost, pohyblivost, rovnováha; individualizace při omezení.",
          "Vzdělávací text ViaLongeVita; rehabilitace po pádu patří k lékaři a fyzioterapeutovi.",
        ],
      },
    ],
  },
  {
    slugTail: "joga-mobilita-dech",
    title: "Jóga bez ezoteriky: co říká NIH a co ViaLongeVita slibovat nesmí",
    excerpt:
      "Americký NCCIH vidí u jógy přínos pro stres, spánek a rovnováhu a malý efekt u bolesti zad — podobný jinému cvičení. Redakce drží mobilitu a dech, ne auru a ne odklad lékaře.",
    topic: "zivotni-styl",
    keywords: ["jóga", "joga", "pilates", "mobilita", "asana", "vinyasa", "dech", "NCCIH"],
    closer: CS_HUB_EDU_CLOSER,
    sections: [
      {
        h2: "Proč o józe píšeme diplomaticky",
        paras: [
          "Jóga má kořeny v indické filosofii. Na veřejných stránkách MedScopeGlobal ji bereme jako pohybovou a dechovou praxi, která má výzkum — ne jako náboženský spor a ne jako zázračný lék. Čtenář, který hledá spiritualitu, ji najde jinde. Čtenář, který hledá healthspan, potřebuje vědět, co studie opravdu ukázaly a kde končí slušnost slibu.",
          "Národní centrum pro komplementární a integrativní zdraví (NCCIH) při NIH, veřejný zdroj vlády USA, shrnuje, že jóga může pomáhat celkové pohodě: stres, zdravé návyky, duševní zdraví, spánek a rovnováha. U bolesti zad je přínos spíš malý. U krku, hlavy a osteoartrózy kolene je výzkum nadějný, ale menší. Jóga může být doplněk léčby, ne její náhrada. NCCIH výslovně varuje, abyste kvůli józe neodkládali lékaře.",
          "To je přesně tón ViaLongeVita: vstřícný k praxi, která lidem uvolní hrudník po osmi hodinách u monitoru, a odmítavý k titulku, že asana léčí rakovinu. Diplomaticky respektujeme, že pro někoho je jóga i smysl. Magazín z toho nedělá podmínku zdraví. Dělá z toho jednu z legálních, opakovatelných forem pohybu vedle chůze a síly.",
        ],
      },
      {
        h2: "Co říká výzkum o zádech, stresu a spánku",
        paras: [
          "Cochrane review jógy u chronické nespecifické bolesti dolních zad ukazuje oproti žádnému cvičení malé zlepšení bolesti a funkce, často pod prahem, který by pacient označil za klinicky důležitý. Riziko nežádoucích příhod — hlavně zhoršení bolesti zad — je vyšší než u pasivní kontroly. Ve srovnání s fyzioterapií nebo jiným cvičením bývá rozdíl malý nebo žádný. American College of Physicians v doporučení z roku 2017 řadí jógu mezi nefarmakologické volby u chronické bolesti zad, vedle cvičení a dalších přístupů, na základě omezené jistoty důkazů.",
          "NCCIH cituje přehledy, kde jóga snižovala vnímaný stres u zdravých dospělých. U deprese může být užitečný doplněk. U diagnostikovaných úzkostných poruch je důkazů málo; v jedné studii NCCIH byla kundaliní jóga slabší než kognitivně-behaviorální terapie, která zůstává první volbou. To redakce překládá bez kontroverze: dýchání na podložce může ztlumit stresovou kaskádu. Není to psychiatr.",
          "Spánek: studie u onkologických pacientů, žen s nespavostí a starších dospělých hlásí zlepšení. To zapadá do našeho pořadí healthspanu — spánek, pohyb, jídlo. Jóga sem patří jako večerní zklidnění, ne jako náhrada vyšetření apnoe.",
        ],
        list: [
          "Jóga je o něco lepší než ležet. Není magicky lepší než jiný rozumný pohyb.",
          "Stres a spánek: nadějné signály, žádný slib vyléčení úzkostné poruchy.",
          "Bolest vystřelující do nohy, slabost, únik moči, horečka s křížem — lékař, ne další vinyasa.",
        ],
      },
      {
        h2: "Bezpečnost: jak začít, aniž byste si ublížili",
        paras: [
          "NCCIH považuje jógu u zdravých lidí za obecně bezpečnou pod vedením kvalifikovaného učitele. Nejčastější úrazy jsou podvrtnutí a natažení, často koleno a bérec. Těžké úrazy jsou vzácné, riziko je nižší než u vysoce nárazových sportů. U lidí nad 65 let je ošetření úrazu z jógy na pohotovosti častější — proto pomaleji, s oporou, bez honění rozsahu z videa.",
          "Začátečník ať vynechá stojky na hlavě, lotus násilím a násilný dech. Hot jóga nese přehřátí a dehydrataci; v těhotenství se jí NCCIH vyhýbá, stejně jako dlouhému lehu na zádech. Glaukom, těžká hypertenze, nestabilita, čerstvé zranění kyčle nebo bederní páteře patří k úpravě pozic s lékařem a učitelem. Samostudium bez dozoru zvedá riziko.",
          "Deset minut na podložce, kolena měkká, žádný rekord v ohybu. Yin nebo pomalé vinyasa u člověka, který se ptá na bolest, je slušnější než algoritmus na maximální rozsah. Pilates sem patří jako příbuzná mobilita, ne jako konkurenční náboženství.",
        ],
      },
      {
        h2: "Co ViaLongeVita u jógy nikdy nenapíše",
        paras: [
          "Nenapíšeme, že jóga léčí onkologické onemocnění. NCCIH mluví o zvládání symptomů a kvalitě života jako o doplňku léčby. Nenapíšeme, že nahradí operaci ploténky. Nenapíšeme, že kdo necvičí slunce pozdrav, kazí si karmu ani zdraví. Nenapíšeme, že Západ jógu „ukradl“ ani že Východ nemá nárok na tradici — to není medicínská otázka tohoto magazínu.",
          "Napíšeme, že pravidelná mobilita páteře, kyčlí a ramen snižuje tuhost ze sedu a že dechové tempo umí ztlumit stres. To je fyziologie. Napíšeme, kdy cvičení odložit: horečka, čerstvá operace, akutní břicho, závrať, radikulární bolest se slabostí. Healthspan je, že se z podložky zvednete zdravější, ne zraněnější.",
        ],
      },
      {
        h2: "Zdroje a právní rámec uveřejnění",
        paras: [
          LEGAL_NOTE,
          "Stránky NCCIH jsou dílem vlády USA a lze je veřejně citovat. Cochrane a ACP citujeme jako odborné závěry, ne jako přepis celých recenzí.",
        ],
        list: [
          "NCCIH/NIH: Yoga: Effectiveness and Safety — stres, spánek, rovnováha; malý přínos u zad; neodkládat lékaře; rizika úrazu a hot jógy.",
          "Cochrane: Yoga for chronic non-specific low back pain — malý efekt proti nečinnosti, podobný jinému cvičení.",
          "ACP 2017: jóga mezi nefarmakologickými volbami u chronické bolesti zad (omezená jistota).",
          "Vzdělávací text ViaLongeVita na medscopeglobal.com; sestava po úrazu patří fyzioterapeutovi.",
        ],
      },
    ],
  },
  {
    slugTail: "joga-zada-klid",
    title: "Jóga, záda a klid po práci: jak cvičit, aby to zapadlo do týdne, ne do kultu",
    excerpt:
      "Po osmi hodinách u stolu potřebujete mobilitu, ne výkon v ohybu. Redakce skládá jógu vedle chůze WHO a spánku AASM — jako hygienu kloubů v duchu ViaLongeVita.",
    topic: "zivotni-styl",
    keywords: ["jóga", "joga", "pilates", "mobilita páteře", "asana", "stres", "záda"],
    closer: CS_HUB_EDU_CLOSER,
    sections: [
      {
        h2: "Proč záda bolí z kanceláře častěji než z podložky",
        paras: [
          "Sedavá práce zkracuje kyčle, kulatí hrudník a učí krk hledat monitor. Jóga ani pilates to „vyléčí“ jednou lekcí. Mohou ale vrátit rozsah, který den ukrojil. NCCIH řadí jógu k přístupům, které mírně ulevují bolesti zad a funkci; Cochrane upozorňuje, že úleva bývá malá a že cvičení samo o sobě umí záda dráždit, když se honí rozsah.",
          "ViaLongeVita proto skládá týden jinak než studio. Nejdřív chůze a síla podle WHO. Pak krátká mobilita. Pak spánek podle AASM. Jóga je v tomhle pořadí nástroj, ne identita. Kdo chce jen chůzi a gumu, má platný healthspan. Kdo chce podložku, ať na ni jde bez pocitu, že musí věřit čakrám.",
          "Diplomaticky k lekcím: slušný učitel se ptá na ploténku, krevní tlak, těhotenství a závrať. Slušný článek nepřikazuje konkrétní sestavu místo rehabilitace. Slušný čtenář neodkládá praktického lékaře, protože „teď cvičím holisticky“.",
        ],
      },
      {
        h2: "Jak může vypadat čtvrthodina, která se vejde do večera",
        paras: [
          "Deset až dvacet minut: měkká kolena, dech nosem, pozice, ze kterých umíte odejít. Žádný rekord v předklonu. Páteř se ohýbá v úsecích, ne jako páka na hamstringy. Pokud bolest vystřeluje, brní noha nebo slabne chodidlo, podložka končí. To je medicína, ne slabost vůle.",
          "Večerní pomalé tempo dává smysl u lidí, kterým intenzivní trénink kazí usínání — NZIP varuje před cvičením těsně před spaním, když nabuzení brání spánku. Jemná mobilita a dech jsou jiná kategorie než intervaly. I tak platí tma, chlad a telefon mimo polštář. Jóga nespánek z apnoe nevyléčí.",
          "Pilates, tai-chi a fyzioterapeutické cvičení sem patří jako příbuzné. Redakce je nehraje proti sobě. Hraje je proti nečinnosti a proti extrému. WHO chce minuty pohybu. NCCIH říká, že jóga je jednou z forem, která může stres a tuhost snížit. Vyberte tu, u které zítra přijdete znovu.",
          "Síla dvakrát týdně podle WHO zůstává. Jóga ji nenahrazuje, pokud v pozicích jen visíte bez odporu. Může ji doplnit, když vstáváte z podložky, držíte prkno přiměřeně a nosíte nákup. ViaLongeVita skládá týden: chůze většinu dnů, síla dvakrát, mobilita krátce, spánek sedm a více hodin. Kdo z toho vynechá podložku a nechá chůzi a spánek, pořád drží jádro healthspanu.",
          "Kancelářská pauza o poledni: tři minuty ramen a kyčlí u stolu nejsou lekce. Jsou přerušení sedavosti, které WHO u všech dospělých žádá. Večerní delší praxe ať nepřepálí usínání. NZIP varuje před nabuzením těsně před spaním; jemný dech je jiná kategorie než power vinyasa s hudbou.",
        ],
        list: [
          "Krátce, často, bez bolesti, která jde do končetiny.",
          "Učitel, který zná vaše omezení, je bezpečnější než video na maximum.",
          "Síla dvakrát týdně podle WHO zůstává; jóga ji nenahrazuje.",
        ],
      },
      {
        h2: "Těhotenství, věk a chronické nemoci — bez kontroverze",
        paras: [
          "NCCIH uvádí, že pohyb včetně jógy je pro většinu těhotných bezpečný po posouzení lékařem, s úpravou pozic, bez hot jógy a bez dlouhého lehu na zádech. To není ideologický zákaz. Je to termoregulace a žilní návrat. Po porodu platí stejná slušnost: nejdřív lékař, pak podložka.",
          "U seniorů je přínos rovnováhy nadějný a riziko úrazu vyšší, proto opora a pomalost. U onkologických pacientů NCCIH mluví o kvalitě života a únavě jako o doplňku léčby, ne o alternativě onkologie. U astmatu a některých chronických stavů může dechová praxe ulevit symptomům; plán drží ošetřující lékař.",
          "Kontroverzi do tohoto textu nevnášíme. Neválčíme s tradicí jógy a neválčíme s evidencí. Evidenci bereme jako strop slibu. Tradici necháme těm, kdo ji chtějí. Čtenář medscopeglobal.com dostane zdravotní rámec, který unese i skeptik.",
          "Chronická bolest zad, která trvá měsíce, patří k praktikovi dřív než k dalšímu stylu jógy. Fyzioterapie, analgetika na doporučení a cvičení — včetně jógy — se v doporučeních ACP objevují vedle sebe, ne jako válka táborů. Redakce drží stejnou slušnost. Kdo má zelený zákal, těžký tlak nebo čerstvou operaci, úpravu pozic nechá na klinice. Kdo je zdravý a tuhý ze sedu, může začít zítra deseti minutami, bez aury a bez hanby, že „to neumí“.",
        ],
      },
      {
        h2: "Zdroje a právní rámec uveřejnění",
        paras: [
          LEGAL_NOTE,
          "NCCIH je veřejný text vlády USA, WHO má licenci CC BY-NC-SA 3.0 IGO na guideline 2020, NZIP je český státní zdravotní portál. Z těch tří skládáme týden: minuty pohybu, malý slib u zad, večer bez přepálení. Cizí magazíny a videa učitelů necitujeme ani nekopírujeme.",
        ],
        list: [
          "NCCIH: Yoga Effectiveness and Safety — těhotenství, úrazy, neodkladání péče, stres a záda.",
          "WHO 2020: pohybový objem týdne, do kterého jóga může počítat jako střední aktivita, pokud zvedá tep a dech.",
          "NZIP: spánek a pohyb — večerní zátěž nepřehánět, pokud kazí usínání.",
          "ViaLongeVita: mobilita jako hygiena healthspanu, ne jako kult.",
        ],
      },
    ],
  },
];
