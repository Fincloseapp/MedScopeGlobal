#!/usr/bin/env node
/**
 * One-shot: replace thin v26 template stubs for 2026-06-19 lifestyle batch.
 * Usage: node scripts/fix-june19-lifestyle-batch.mjs [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";
import { countPublicArticleWords } from "../lib/v25/writers/writer-base.mjs";
import { classifyCoverTopic } from "../lib/ecosystem/editorial/images/cover.ts";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const dryRun = process.argv.includes("--dry-run");

for (const [key, val] of Object.entries(loadProjectEnv(ROOT))) {
  process.env[key] = val;
}

const ARTICLES = [
  {
    slug: "verejnost-zivotni-styl-2026-06-19-digitalni-detox-a-dusevni-pohoda-co-stoji-za-to-vedet-jeste-dnes",
    title:
      "Co byste měli vědět o digitální detox a duševní pohoda: co stojí za to vědět ještě dnes",
    excerpt:
      "Jak zdravě snížit čas u obrazovky, zklidnit nervy a zlepšit spánek — praktický průvodce digitálním detoxem bez extrémů a výčitek.",
    cover: "/assets/covers/calm.webp",
    content: `<p><strong>Telefon u snídaně, e-maily večer v posteli a neustálé notifikace — většina z nás to zná. Digitální detox neznamená vypnout svět, ale vrátit si kontrolu nad tím, kdy a jak technologie slouží vám, ne naopak.</strong></p>

<h2>Proč na tom záleží právě teď</h2>
<p>Český průzkumy i data o používání chytrých telefonů ukazují, že dospělí tráví u obrazovek často víc než sedm hodin denně — a značná část jde na sociální sítě, zprávy a „rychlé kontroly“, které trvají jen pár vteřin, ale opakují se desítkykrát. Takové mikro-dávky stimulace udržují nervový systém v mírném poplachu: hůř usínáme, hůře se soustředíme a snáze podléháme únavě i podrážděnosti.</p>
<p>Duševní pohoda není luxus — je to základ, na kterém stojí spánek, vztahy i práce. Když si obrazovka ukrojí čas ze večera nebo ze snídaně s rodinou, platíme za to pozorností, kterou už nevrátíme. Dobrá zpráva: nemusíte žít bez internetu. Stačí několik jasných pravidel, která v běžném týdnu v Česku opravdu vydrží.</p>

<h2>Co digitální detox ve skutečnosti je — a co není</h2>
<p>Digitální detox není týdenní hladovka bez telefonu ani moralizování. Je to vědomé snížení času u obrazovek tam, kde vám nepřináší hodnotu — a nahrazení toho něčím, co tělo i hlava potřebují: pohybem, spánkem, rozhovorem tváří v tvář. Cílem není dokonalost, ale <em>udržitelná</em> rovnováha.</p>
<p>Typické signály, že je na místě zpomalit:</p>
<ul>
<li>scrollujete „jen chvilku“ a po půl hodině zvedáte hlavu s pocitem prázdnoty,</li>
<li>bez telefonu u sebe cítíte neklid nebo FOMO (strach, že vám něco unikne),</li>
<li>večer usínáte pozdě, protože „ještě dočtu zprávy“,</li>
<li>ráno první, co uděláte, je kontrola notifikací — ještě před sklenicí vody.</li>
</ul>
<p>Žádný z těchto signálů není diagnóza. Jsou to upozornění, že váš režim by mohl být šetrnější k nervům i spánku.</p>

<h2>Jak obrazovky ovlivňují duševní pohodu</h2>
<p>Modré světlo večer narušuje přípravu těla na spánek — melatonin se uvolňuje hůř, usínání trvá déle a spánek bývá mělčí. Notifikace navíc udržují mozek v režimu „něco se děje“; i když zprávu neotevřete, samotné zablikání zvýší bdělost.</p>
<p>Sociální sítě často ukazují zkrácenou verzi cizích životů. Porovnávání s idealizovanými příspěvky zhoršuje náladu u části uživatelů — zejména u teenagerů, ale i u dospělých po náročném dni. Práce na dálku navíc rozmazala hranici mezi „jsem v práci“ a „jsem doma“; bez pravidel se laptop otvírá i ve chvíli, kdy by měl být čas na odpočinek.</p>
<p>Na druhou stranu technologie umí pomoct: meditační aplikace, připomínky pitného režimu nebo videohovor s blízkým na druhém konci republiky. Digitální detox tedy neodstraňuje nástroje — učí vás vybírat, které v danou chvíli <strong>opravdu</strong> potřebujete.</p>

<h2>Praktické kroky, které fungují v běžném týdnu</h2>
<p>Začněte u největší brzdy. U většiny lidí to bývá večerní telefon v posteli nebo nekonečné scrollování u oběda. Vyberte <em>jednu</em> změnu na týden:</p>
<ul>
<li><strong>Večerní okno bez obrazovky</strong> — 60 minut před spaním telefon do jiné místnosti, nabíjení mimo ložnici. Místo scrollu kniha, lehké protažení nebo krátký rozhovor.</li>
<li><strong>Notifikace na minimum</strong> — vypněte push u aplikací, které nejsou urgentní. Nechte zapnuté jen volání, zprávy od blízkých nebo pracovní chat ve směnách.</li>
<li><strong>Domácí pravidlo „telefon u dveří“</strong> — při příchodu domů nebo do kuchyně nechte zařízení u vstupu. Snižuje to impulzivní kontroly u jídla i s dětmi.</li>
<li><strong>Šedá nebo noční režim</strong> — od 20:00 teplejší tóny displeje; u některých telefonů pomáhá i černobílý režim, který snižuje chuť scrollovat.</li>
<li><strong>Plánované „online bloky“</strong> — místo neustálého připojení si vyhraďte dvě až tři okna denně (např. 9:00, 13:00, 17:00) na e-mail a zprávy. Mimo ně telefon v tichém režimu.</li>
</ul>
<p>Malé kroky vydrží déle než radikální zákaz. Po třech týdnech většina lidí popíše lepší usínání, méně napětí v šíji a víc pocitu, že den „patří jim“, ne aplikacím.</p>

<h2>Týdenní plán digitálního detoxu v české praxi</h2>
<p><strong>Pondělí–úterý:</strong> Zmapujte reálný čas u obrazovky (většina telefonů ukáže statistiky v nastavení). Bez hodnocení — jen čísla. Zapište si jednu změnu na zbytek týdne.</p>
<p><strong>Středa–čtvrtek:</strong> Zaveďte ji. Večer krátká poznámka: co bylo snadné, co těžké. Pokud selžete, zmenšete cíl (např. místo hodiny bez telefonu jen 30 minut).</p>
<p><strong>Pátek:</strong> Zhodnoťte spánek a náladu. Pokud se zlepšily, přidejte další drobnost o víkendu — třeba procházku bez sluchátek.</p>
<p><strong>Víkend:</strong> Domluvte s partnerem nebo rodinou společné pravidlo (např. telefony mimo stůl u oběda). U dětí platí stejná logika: děti se učí návykům od dospělých, ne od prohlášení.</p>

<h2>Časté mýty a realistické odpovědi</h2>
<p><strong>Mýtus:</strong> „Bez telefonu v kapse se nic nedozvím důležitého.“ <strong>Realita:</strong> urgentní věci většinou přijdou hovorem. Zbytek počká hodinu — svět se nezhroutí.</p>
<p><strong>Mýtus:</strong> „Digitální detox musí trvat celý víkend offline.“ <strong>Realita:</strong> i konzistentní večerní hodina bez obrazovky má měřitelný vliv na spánek a ranní soustředění.</p>
<p><strong>Mýtus:</strong> „Když jsem online hodně, jsem produktivní.“ <strong>Realita:</strong> multitasking mezi záložkami a chaty snižuje kvalitu práce; hluboké soustředění potřebuje delší bloky bez rušení.</p>

<h2>Kdy má smysl řešit to s odborníkem</h2>
<p>Text pro veřejnost nenahrazuje psychoterapii ani psychiatrické vyšetření. Obraťte se na praktického lékaře nebo psychologa, pokud:</p>
<ul>
<li>úzkost nebo podrážděnost bez telefonu výrazně narušují běžný den,</li>
<li>spánek je chronicky špatný i po změně návyků,</li>
<li>používání sítí nebo her přerůstá v nutkání, které nezvládáte omezit sami,</li>
<li>se objeví depresivní nálada, panické ataky nebo myšlenky na sebepoškození.</li>
</ul>
<p>V akutní krizi volejte linku důvěry 116 123 nebo v případě ohrožení života 155. Digitální detox je doplněk péče o sebe — ne náhrada odborné pomoci tam, kde je potřeba.</p>

<h2>Jak téma uchopit bez zbytečného tlaku</h2>
<p>U digitálního detoxu platí stejně jako u jídelníčku nebo pohybu: <strong>nejmenší udržitelné zlepšení</strong> porazí pondělní předsevzetí, které v pátek skončí. Sdílejte plán s někým blízkým — společná pravidla v domácnosti se drží snáze než tiché rozhodnutí „od zítra jinak“, které nikdo nevidí.</p>
<p>MedScopeGlobal píše pro laickou veřejnost: srozumitelně, bez strašení a bez diagnóz přes obrazovku. Berte tento článek jako mapu pro každodenní rozhodování — a rozhodnutí o léčbě nechte na zdravotnících, kteří znají váš kontext.</p>

<h2>Zdroje</h2>
<ul>
<li>MZČR — doporučení k duševnímu zdraví a prevenci.</li>
<li>Národní ústav duševního zdraví — informace pro veřejnost.</li>
<li>ÚZIS ČR — data o životním stylu a prevenci.</li>
</ul>
<p>Původní redakční text desk MedScopeGlobal. Nejde o přepis cizího časopisu ani o citaci konkrétní studie.</p>`,
  },
  {
    slug: "verejnost-zivotni-styl-2026-06-19-hydratace-a-energie-v-chladnem-pocasi-co-stoji-za-to-vedet-jeste-dnes",
    title: "Hydratace a energie v chladném počasí: co stojí za to vědět ještě dnes",
    excerpt:
      "Proč v zimě pijeme méně, i když tělo potřebuje tekutiny stejně — a jak si udržet energii bez litrů slazených nápojů.",
    cover: "/assets/covers/food.webp",
    content: `<p><strong>V chladu méně pocítíme žízeň, ale organismus tekutiny stále potřebuje — pro soustředění, imunitu i teplotu těla. Správná hydratace v zimním období není o extrémech, ale o jednoduchých návycích, které vydrží i v hektickém týdnu.</strong></p>

<h2>Proč na pitný režimu záleží i v mrazu</h2>
<p>Centralizované vytápění bytů v Česku vysušuje vzduch. Kombinace suchého tepla uvnitř a chladu venku zvyšuje ztráty vody dýcháním — i když se nepotíte tolik jako v létě. Únava, bolesti hlavy nebo „těžká hlava“ odpoledne často souvisí spíš s nedostatkem tekutin než s leností.</p>
<p>V chladu mozek signál žízně spouští později. Lidé v teplých bundách v tramvaji nebo na zastřešeném pracovišti navíc méně vnímají, že potřebují pít — a sáhnou spíš po kávě než po sklenici vody. Děti a senioři mají vypnuté signály žízně dříve než dospělí; u nich je pravidelná hydratace obzvlášť důležitá.</p>
<p>Tělo potřebuje tekutiny pro transport živin, regulaci teploty i odvod metabolických produktů. I mírná dehydratace (ztráta zhruba 1–2 % tělesné hmotnosti v tekutinách) může snížit soustředění a zhoršit náladu — v zimě to snadno připíšeme „seasonal blues“, i když část problému může být jednoduše v pitném režimu.</p>

<h2>Chlad, energie a pitný režim v praxi</h2>
<p>V outdoorových aktivitách v zimě platí: pocit žízně přichází později, ale ztráty tekutin při dýchání studeného vzduchu pokračují. Běžci, chodci i zahradníci by měli pít pravidelně i když „nemají hlad“. Stačí malá láhev v batohu nebo termoska s teplým čajem — horké nápoje v rozumné míře tělo neodvodňují, pokud neobsahují nadbytek cukru nebo alkohol.</p>
<p>V kanceláři nebo na home office mějte láhev na stole — viditelná připomínka funguje lépe než předsevzetí „budu pít víc“. Cílem není vypít litr za hodinu, ale rozložit pití po celý den: malé doušky každých 30–45 minut. Polévka k obědu v české kuchyni je tichý spojenec hydratace — zeleninové nebo kuřecí vývary dodají tekutiny i minerály.</p>
<p>Ovoce (pomeranče, jablka, kiwi) a zelenina s vysokým obsahem vody (okurka, rajčata, meloun) přispívají k celkovému příjmu. Nemusí to být „superpotravina“ — běžný talíř z české jídelny nebo domácí kuchyně stačí.</p>

<h2>Co pít — a co nechat na výjimečný den</h2>
<p>Základ je voda, slabý čaj nebo bylinné nálevy bez cukru. Káva v běžných množstvích (dvě až tři šálky denně) mírně zvyšuje diurézu, ale u většiny lidí nepřeváží přínos — pokud k ní nepřidáváte litry slazených sirupů.</p>
<p>Slazené limonády, energetické nápoje a alkohol dehydrataci zhoršují. Alkohol v zimním období navíc snižuje vnímání chladu — riziko přehřátí v sauně nebo při venkovní práci roste.</p>
<ul>
<li>Ráno sklenice vody hned po probuzení — doplníte noční ztráty.</li>
<li>K obědu a svačině voda místo sladkého nápoje — stabilnější energie odpoledne.</li>
<li>Večer spíš neperlivá voda nebo bylinný čaj — méně narušení spánku než kofein po 15. hodině.</li>
</ul>

<h2>Hydratace a energie v pracovním týdnu</h2>
<p>Ranní rutina: sklenice vody hned po probuzení doplní noční ztráty dřív, než sáhnete po kávě. Kofein sám o sobě není nepřítel — problém bývá v tom, že káva <em>nahradí</em> vodu, ne že by ji v běžném množství vymývala z těla nadměrně.</p>
<p>Odpolední pokles energie často souvisí s obědem bohatým na sůl a s málem tekutin od dopoledne. Sklenice vody půl hodiny před obědem a k jídlu místo sladkého nápoje stabilizuje pozornost — bez nutnosti další kávy.</p>
<p>Večer volte spíš neperlivou vodu nebo bylinný čaj. Těžké slazené nápoje nebo alkohol před spaním zhoršují kvalitu spánku; unavený člověk pak druhý den sahá po stimulantech místo po vodě — začarovaný kruh, který lze přerušit jednoduchým návykem.</p>

<h2>Týdenní plán v české praxi</h2>
<p><strong>Pondělí–úterý:</strong> Zapište si, kolik sklenic vody skutečně vypijete — bez ideálu. Přidejte jednu sklenici denně oproti minulému týdnu.</p>
<p><strong>Středa–čtvrtek:</strong> Nastavte si tiché připomínky v telefonu (nebo papírovou tečku na láhev). Večer krátká kontrola: měl jsem odpoledne víc energie?</p>
<p><strong>Pátek–víkend:</strong> Při venkovní aktivitě (běh, chůze, zahrada) vezměte láhev i v chladu — pocit žízně přichází později než v létě.</p>

<h2>Časté mýty a realistické odpovědi</h2>
<p><strong>Mýtus:</strong> „V zimě nemusím pít tolik.“ <strong>Realita:</strong> potřeba tekutin klesá jen mírně; vytápění a suchý vzduch ji často vyrovnají. Pravidlo osmi sklenic platí spíš jako orientace — důležitější je barva moči (světle žlutá) a celkový pocit.</p>
<p><strong>Mýtus:</strong> „Když piju kávu, nemusím pít vodu.“ <strong>Realita:</strong> káva doplňuje tekutiny, ale neměla by být jediným zdrojem — voda a čaje bez cukru jsou základ.</p>
<p><strong>Mýtus:</strong> „Slazená limonáda hydratuje stejně jako voda.“ <strong>Realita:</strong> cukr v nadbytku zatěžuje organismus; voda nebo neslazený čaj jsou pro každodenní pitný režim vhodnější.</p>

<h2>Jak téma uchopit bez zbytečného tlaku</h2>
<p>Hydratace není soutěž v litrech. Začněte jednou sklenicí navíc denně a držte to týden — teprve pak přidávejte. Sdílejte láhev s dětmi nebo kolegou; společný návyk vydrží déle než tiché předsevzetí.</p>
<p>MedScopeGlobal píše pro laickou veřejnost: srozumitelně, bez strašení a bez diagnóz přes obrazovku. Berte tento článek jako mapu pro každodenní rozhodování — a rozhodnutí o léčbě nechte na zdravotnících, kteří znají váš kontext.</p>

<h2>Kdy k lékaři</h2>
<p>Navštivte praktického lékaře při dlouhodobé únavě, opakovaných bolestech hlavy, otocích nebo neobvyklém pocitu žízně — může jít o jiný problém než jen o pitný režim. V akutním stavu s dehydratací (mdloby, zmatenost) volejte 155.</p>

<h2>Zdroje</h2>
<ul>
<li>MZČR — doporučení k životnímu stylu a pitnému režimu.</li>
<li>ÚZIS ČR — prevence a veřejné zdraví.</li>
</ul>
<p>Původní redakční text desk MedScopeGlobal.</p>`,
  },
  {
    slug: "verejnost-zivotni-styl-2026-06-19-stres-z-prace-a-jeho-vliv-na-imunitu-co-stoji-za-to-vedet-jeste-dnes",
    title: "Stres z práce a jeho vliv na imunitu: co stojí za to vědět ještě dnes",
    excerpt:
      "Jak dlouhodobý pracovní stres oslabuje obranyschopnost — a co zvládnete sami, než se tělo ozve nachlazením nebo vyhořením.",
    cover: "/assets/covers/calm.webp",
    content: `<p><strong>Termín „stres v práci“ slyšíme často — méně už to, jak chronické napětí ovlivňuje imunitu. Tělo v režimu neustálého poplachu méně efektivně bojuje s viry, hůře regeneruje a spánek trpí jako první. Naštěstí jde vliv zmírnit kroky, které nevyžadují okamžitou změnu zaměstnání.</strong></p>

<h2>Proč pracovní stres sahá na imunitu</h2>
<p>Krátkodobý stres (deadline, prezentace) tělo zvládne — hormony stresu na chvíli zvýší bdělost. Problém začíná trváním: měsíce přesčasů, nejasných priorit, toxického prostředí nebo neustálé dostupnosti po pracovní době udržují organismus v režimu „boj nebo útěk“. Imunitní systém dostává méně prostředků na běžnou obranu — nachlazení, opakované angíny nebo pomalejší hojení drobných ran bývají varovné signály.</p>
<p>Výzkumy ukazují, že chronický stres ovlivňuje tvorbu protilátek po očkování i průběh běžných infekcí. Neznamená to, že každý stresovaný člověk onemocní — ale statisticky roste riziko, že se tělo hůře vyrovná s virem, který by dřív proběhl mírněji.</p>
<p>Spánek je první oběť: ležíte v posteli, ale hlava projíždí e-maily. Bez hlubokého spánku klesá počet buněk, které efektivně reagují na hrozby. Stres a málo spánku se navzájem zhoršují — spirála, kterou bez zásahu nevyřešíte víkendovým spáním do oběda.</p>
<p>Trávení také reaguje: někdo ztrácí chuť k jídlu, jiný sahá po sladkém a rychlých svačinách. Obojí může narušit příjem vitamínů a minerálů, které imunita potřebuje — další důvod řešit stres komplexně, ne jen „posílením“ jedním doplňkem.</p>

<h2>Signály, že stres přerůstá v zdravotní téma</h2>
<ul>
<li>Častější infekce horních cest dýchacích než dříve.</li>
<li>Trvalá únava i po dovolené.</li>
<li>Podrážděnost, neschopnost „vypnout“ večer.</li>
<li>Bolesti hlavy, napětí v šíji, trávicí potíže bez jasné příčiny.</li>
<li>Úbytek radosti z věcí, které dřív bavily — varovný signál vyhoření.</li>
</ul>
<p>Žádný z těchto bodů sám o sobě neznamená diagnózu, ale dohromady ukazují, že režim je dlouhodobě neudržitelný.</p>

<h2>Co zvládnete sami — realisticky</h2>
<p><strong>Hranice dostupnosti.</strong> Po dohodě s týmem nastavte, kdy jste offline. V Česku je běžná kultura odpovídat večer — změna začíná u vás: auto-odpověď nebo zpráva „odpovím zítra dopoledne“ snižuje očekávání okamžité reakce.</p>
<p><strong>Mikropauzy.</strong> Pět minut chůze mezi schůzkami, dechové cvičení před náročným hovorem — klidový nervový systém potřebuje krátké signály, že nehrozí nebezpečí. Stačí pomalu nabrat dech na čtyři doby, krátce zadržet a pomalu vydechnout — opakovat pětkrát.</p>
<p><strong>Spánek jako priorita.</strong> Stejná hodina ulehnutí, telefon mimo ložnici, lehká večeře — ne luxus, ale investice do imunity. I 30 minut dřívějšího ulehnutí po týdnu může změnit pocit z pondělního rána.</p>
<p><strong>Pohyb bez výkonu.</strong> Nemusíte běhat maraton. Chůze 30 minut denně nebo protažení stačí ke snížení hladiny stresových hormonů. Venkovní chůze v denním světle navíc podporuje cirkadiánní rytmus.</p>
<p><strong>Strava bez extrémů.</strong> Pravidelné jídlo s dostatkem zeleniny a bílkovin stabilizuje energii lépe než přeskakování obědů „protože nestíhám“. Kofein po 15. hodině u citlivých lidí zhoršuje večerní usínání.</p>
<p><strong>Sociální opora.</strong> Rozhovor s partnerem, kolegou nebo přítelem — izolace stres prohlubuje. Nemusí jít o „terapii“ — stačí sdílení, že je toho moc.</p>

<h2>Týdenní plán v české praxi</h2>
<p><strong>Pondělí:</strong> Sepište tři hlavní zdroje pracovního stresu — ne deset, jen tři. U jednoho zvolte nejmenší možnou změnu (např. méně schůzek bez agendy).</p>
<p><strong>Úterý–středa:</strong> Zaveďte jednu hranici (např. žádné e-maily po 20:00). Sledujte spánek — stačí subjektivní pocit. Pokud usínáte déle než 30 minut, zkuste večer bez obrazovky a lehčí večeři.</p>
<p><strong>Čtvrtek–pátek:</strong> Přidejte denní mikropauzu venku — i 10 minut na chodbě nebo dvorku. Všimněte si, zda se liší odpolední únava oproti minulému týdnu.</p>
<p><strong>Víkend:</strong> Jedna aktivita bez obrazovky, která vás baví. Cílem není produktivita, ale regenerace. Domluvte si s blízkými, že nedělní večer je „klidová zóna“ — bez práce, pokud to povaha zaměstnání dovoluje.</p>
<p>Nečekejte na dokonalý pondělní restart. U stresu z práce funguje spíš opakovatelná rutina: stejná hodina konce práce, stejný večerní rituál, stejná krátká procházka. Malé kotvy v týdnu stabilizují nervový systém víc než jednorázová dovolená.</p>

<h2>Časté mýty a realistické odpovědi</h2>
<p><strong>Mýtus:</strong> „Imunitu posílím doplňky místo řešení stresu.“ <strong>Realita:</strong> bez spánku a zvládání zátěže doplňky samy problém nevyřeší — smysl dávají tam, kde je deficit potvrzený lékařem.</p>
<p><strong>Mýtus:</strong> „Až skončím projekt, odpočinu.“ <strong>Realita:</strong> tělo nepočítá deadline — kumulace stresu bez regenerace vede k vyhoření právě po dokončení velkého úkolu.</p>
<p><strong>Mýtus:</strong> „Kdo vydrží víc, je silnější.“ <strong>Realita:</strong> dlouhodobá odolnost stojí na regeneraci, ne na ignorování signálů únavy.</p>

<h2>Jak téma uchopit bez zbytečného tlaku</h2>
<p>Pracovní stres nevyřešíte jedním víkendem v horách — ale malé hranice a spánek jsou reálný začátek. Vyberte jednu změnu na týden; konzistence porazí heroické sprinty.</p>
<p>MedScopeGlobal píše pro laickou veřejnost: srozumitelně, bez strašení a bez diagnóz přes obrazovku. Berte tento článek jako mapu pro každodenní rozhodování — a rozhodnutí o léčbě nechte na zdravotnících, kteří znají váš kontext.</p>

<h2>Kdy k lékaři</h2>
<p>Praktický lékař nebo psycholog, pokud příznaky trvají déle než několik týdnů, opakované infekce narušují práci, nebo máte myšlenky na sebepoškození. Připravte si stručný popis spánku, pracovní zátěže a příznaků — ordinace pak snáze rozliší běžný stres od stavu, který potřebuje cílenější péči.</p>
<p>Linka důvěry 116 123, v akutní krizi 155. Zaměstnavatelé v Česku postupně nabízejí employee assistance programy — anonymní konzultace bývají součástí benefitů ve větších firmách.</p>

<h2>Zdroje</h2>
<ul>
<li>MZČR — duševní zdraví a prevence vyhoření.</li>
<li>Státní zdravotní ústav — doporučení k životnímu stylu.</li>
</ul>
<p>Původní redakční text desk MedScopeGlobal.</p>`,
  },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });
const results = [];

for (const article of ARTICLES) {
  const { data: row, error: fetchErr } = await admin
    .from("articles")
    .select("id, title, content, excerpt, cover_image_url, metadata")
    .eq("slug", article.slug)
    .maybeSingle();

  if (fetchErr || !row) {
    results.push({ slug: article.slug, ok: false, reason: fetchErr?.message ?? "not found" });
    continue;
  }

  const beforeWords = countPublicArticleWords(row.content);
  const afterWords = countPublicArticleWords(article.content);
  const topic = classifyCoverTopic({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    publicTopic: "zivotni-styl",
  });
  const cover = article.cover;
  const metadata = {
    ...(row.metadata ?? {}),
    editorial_version: "26.3.1-manual",
    editorial_image_visual_topic: topic,
    editorial_image_applied_at: new Date().toISOString(),
    manual_longform_fix_at: new Date().toISOString(),
    hero_alt_text_cs: `Ilustrační foto k článku „${article.title}" — ${topic === "calm" ? "klid, odpočinek a duševní pohoda" : topic === "sleep" ? "spánek a regenerace" : "zdravý životní styl"}`,
  };

  if (dryRun) {
    results.push({
      slug: article.slug,
      ok: true,
      dryRun: true,
      beforeWords,
      afterWords,
      coverBefore: row.cover_image_url,
      coverAfter: cover,
      topic,
    });
    continue;
  }

  const { error: updErr } = await admin
    .from("articles")
    .update({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      cover_image_url: cover,
      metadata,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  results.push({
    slug: article.slug,
    ok: !updErr,
    beforeWords,
    afterWords,
    coverBefore: row.cover_image_url,
    coverAfter: cover,
    topic,
    error: updErr?.message,
  });
}

console.log(JSON.stringify({ dryRun, results }, null, 2));
process.exit(results.every((r) => r.ok) ? 0 : 1);
