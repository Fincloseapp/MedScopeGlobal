import { createServiceRoleClient } from "@/lib/supabase/service";
import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";

type DeskId = "student" | "physician" | "research";

type DeskSeed = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  desk: DeskId;
  cover_image_url: string;
  meta_description: string;
  med_track?: "priprava" | "studium";
  student_topic?: string;
  study_year?: number;
  rubric_slug: string;
  source_name: string;
  unit: string;
  section: string;
};

const LEGAL =
  "<p><em>MedScopeGlobal je vzdělávací redakce. Text nenahrazuje učebnici, doporučení odborné společnosti ani individuální lékařskou péči. Nejde o diagnózu ani o léčebný návod.</em></p>";

const SEEDS: DeskSeed[] = [
  {
    desk: "student",
    slug: "studium-anatomie-pohybovy-aparat-jak-se-ucit",
    title: "Anatomie pohybového aparátu: jak se učit kosti, svaly a inervaci",
    excerpt:
      "Pro studenty lékařské fakulty: systematický postup, jak skládat osteologii, myologii a inervaci do jednoho obrazu — bez biflování seznamů nazpaměť.",
    cover_image_url: V21_MEDICAL_IMAGES.anatomy,
    meta_description:
      "Jak se učit anatomii pohybového aparátu na lékařské fakultě: kosti, svaly, inervace a klinické kotvy.",
    med_track: "studium",
    student_topic: "anatomie",
    study_year: 1,
    rubric_slug: "studium",
    source_name: "Studentská redakce MedScopeGlobal",
    unit: "medscope_cz_student_desk",
    section: "studium",
    content: `<p>Pohybový aparát se na zkoušce neptá na izolovaný seznam. Zkoušející chce vidět, že student umí spojit kost, kloub, sval, nerv a funkci. Tento briefing je studijní metoda, ne náhrada atlasu.</p>
<h2>Nejdřív kostra, potom pohyb</h2>
<p>Osteologii učte jako mapu, ne jako slovník. U každé kosti si zapište tři věci: kde leží vůči sousedům, jaké má významné hrboly a otvory, a co se na ni upíná. Otvor bez obsahu je prázdné jméno. Obsah bez otvoru je spekulace.</p>
<p>U dlouhých kostí si nakreslete proximální a distální konec zepředu i zezadu. U pánve a lopatky si označte roviny: co směřuje laterálně, co k páteři, co k hrudníku. Chyba v orientaci se táhne celou myologií.</p>
<h2>Sval jako jednotka funkce</h2>
<p>U svalu se učte začátek, úpon, inervaci a hlavní pohyb. Čtvrtý údaj — antagonistu — oddělí studenta, který umí seznam, od studenta, který umí pohyb. Skupiny (flexory předloktí, adduktory stehna) si skládejte podle společného nervu, ne podle abecedy.</p>
<ul>
<li>Začátek a úpon si vždy ukažte na vlastní končetině.</li>
<li>Inervaci pište jako míšní segment plus periferní nerv, pokud to učebnice uvádí.</li>
<li>Jednu klinickou kotvu na skupinu: výpadek, úžinový syndrom, typická zlomenina.</li>
</ul>
<h2>Inervace je spojnice, ne příloha</h2>
<p>Plexus brachialis a lumbosacralis se učí jako strom: kořeny, kmeny, svazky, větve. Nakreslete si ho dvakrát týdně zpaměti. Až když strom drží, doplňujte svaly. Obráceně vzniká iluze znalosti, která na zkoušce spadne.</p>
<h2>Jak zkoušet sám sebe</h2>
<p>Aktivní recall: zavřete atlas a popište cestu od C5 k m. deltoideus. Spaced repetition: kartičky s otázkou „který nerv, který pohyb“, ne s otázkou „vypište vše“. Po týdnu si vezměte rentgen nebo schéma a pojmenujte struktury bez popisků.</p>
<p>MedScopeGlobal doporučuje kombinovat atlas, vlastní nákres a krátké ústní zkoušení s kolegou. Text je pedagogická pomůcka Studentské redakce, nikoli oficiální sylabus fakulty.</p>
${LEGAL}`,
  },
  {
    desk: "student",
    slug: "prijimacky-biologie-strategie-bez-biflovani",
    title: "Přijímačky na lékařskou fakultu: strategie biologie bez biflování",
    excerpt:
      "Jak skládat středoškolskou biologii do modelu, který obstojí u testu: buňka, genetika, fyziologie člověka a časté pasti zadání.",
    cover_image_url: V21_MEDICAL_IMAGES.university,
    meta_description:
      "Strategie biologie na přijímačky LF: buňka, genetika, fyziologie a jak se vyhnout biflování.",
    med_track: "priprava",
    student_topic: "prijimacky",
    rubric_slug: "studium",
    source_name: "Studentská redakce MedScopeGlobal",
    unit: "medscope_cz_student_desk",
    section: "studium",
    content: `<p>Přijímací test z biologie netrestá nedostatek stránek, ale chybějící strukturu. Uchazeč, který umí mechanismus, pozná i přeformulovanou otázku. Uchazeč, který umí jen větu z kvízu, padne na synonymu.</p>
<h2>Tři vrstvy, ne sto kapitol</h2>
<p>Rozdělte látku na buňku a molekulární biologii, genetiku a evoluci, a fyziologii člověka včetně imunity. Každý den jedna vrstva v krátkém bloku. Dlouhé noční čtení bez otázek vytváří pocit pokroku, který test neuzná.</p>
<h2>Buňka jako továrna</h2>
<p>U organel se ptejte: co vstupuje, co vystupuje, kde se stane chyba. Mitochondrie nejsou „energetická centra“ — jsou místem oxidativní fosforylace. Ribozom není „továrna na bílkoviny“ bez rozlišení volného a vázaného. Přesný slovník je levnější než memorování odstavců.</p>
<h2>Genetika bez magie</h2>
<p>Mendelovské poměry umí každý. Test často přidá vazbu genů, neúplnou dominanci nebo rodokmen. Kreslete Punnettovy čtverce i tam, kde se zdají zbytečné. U DNA si držte směr 5′–3′, komplementaritu a rozdíl transkripce a translace. Záměna těchto pojmů je nejčastější zbytečná ztráta bodu.</p>
<h2>Člověk: systémy, ne orgány</h2>
<p>Srdce, plíce, ledviny a hormonální osy učte jako smyčky. Krevní oběh bez tlaku a odporu je obrázek. Dýchání bez parciálních tlaků je slovník. Ledviny bez filtrace, resorpce a ADH jsou seznam.</p>
<ul>
<li>Po každé kapitole deset otázek vlastními slovy.</li>
<li>Jednou týdně smíšený test napříč vrstvami.</li>
<li>Chybu si zapište jako pravidlo, ne jako „příště si dám pozor“.</li>
</ul>
<p>Studentská redakce MedScopeGlobal připravuje uchazeče na způsob myšlení, ne na konkrétní znění jedné fakulty. Oficiální požadavky vždy ověřte u zvolené školy.</p>
${LEGAL}`,
  },
  {
    desk: "student",
    slug: "fyziologie-homeostaza-prvni-rocnik",
    title: "Fyziologie homeostázy pro první ročník: od principu ke zkoušce",
    excerpt:
      "Jak číst zpětnovazebné smyčky, tekutiny a acidobazickou rovnováhu tak, aby to obstálo u ústní i u testu z fyziologie.",
    cover_image_url: V21_MEDICAL_IMAGES.study,
    meta_description:
      "Homeostáza pro 1. ročník medicíny: zpětná vazba, tekutiny a acidobazická rovnováha ke zkoušce.",
    med_track: "studium",
    student_topic: "fyziologie",
    study_year: 1,
    rubric_slug: "studium",
    source_name: "Studentská redakce MedScopeGlobal",
    unit: "medscope_cz_student_desk",
    section: "studium",
    content: `<p>Homeostáza není heslo na začátek učebnice. Je to jazyk, kterým fyziologie popisuje téměř každý orgán. Kdo umí smyčku, umí i odchylku. Kdo umí jen definici, u zkoušky sklouzne k prázdným větám.</p>
<h2>Smyčka má pět částí</h2>
<p>Podnět, čidlo, integrační centrum, efektor a výsledek. U každého příkladu — glykemie, krevní tlak, osmolarita, teplota — si je vypište. Negativní zpětná vazba vrací hodnotu k nastavenému bodu. Pozitivní zpětná vazba je vzácná a musí mít jasný konec, jinak systém uteče.</p>
<h2>Tekutiny a kompartmenty</h2>
<p>Tělo není jeden vak vody. Intracelulární a extracelulární prostor se liší ionty. Sodík je hlavní extracelulární kationt, draslík intracelulární. Osmolarita spojuje ledviny, žízeň a ADH. Bez tohoto trojúhelníku jsou infuze a diuretika v pozdějších ročnících jen názvy.</p>
<h2>Acidobazická rovnováha bez strachu</h2>
<p>pH krve drží pufry, plíce a ledviny. Respirace mění PaCO<sub>2</sub> rychle. Ledviny mění hydrogenuhličitan pomaleji. Naučte se nejdřív směr: hypoventilace zadrží CO<sub>2</sub>, hyperventilace ho vyvětrá. Až potom doplňujte vzorce. Čísla bez směru jsou ozdoba.</p>
<ul>
<li>Nakreslete osu pH a přiřaďte respiraci a metabolismus.</li>
<li>U každé poruchy řekněte primární změnu a očekávanou kompenzaci.</li>
<li>Nezaměňujte kompenzaci s léčbou — to je klinický, ne studijní omyl, ale začíná už tady.</li>
</ul>
<h2>Jak to zkoušet</h2>
<p>Vysvětlete spolužákovi, proč žízeň není totéž co deficit objemu. Vysvětlete, proč tachypnoe může být kompenzace. Když to umíte říct bez slajdu, umíte to ke zkoušce.</p>
${LEGAL}`,
  },
  {
    desk: "student",
    slug: "studijni-metody-aktivni-recall-mediciny",
    title: "Aktivní recall a spaced repetition ve studiu medicíny",
    excerpt:
      "Proč zvýrazňovač na lékařské fakultě selhává a jak postavit opakování, kartičky a ústní zkoušení, aby znalost vydržela do státnic.",
    cover_image_url: V21_MEDICAL_IMAGES.university,
    meta_description:
      "Studijní metody pro medicínu: aktivní recall, spaced repetition a ústní zkoušení místo zvýrazňovače.",
    med_track: "studium",
    student_topic: "studijni-metody",
    rubric_slug: "studium",
    source_name: "Studentská redakce MedScopeGlobal",
    unit: "medscope_cz_student_desk",
    section: "studium",
    content: `<p>Medicína je objem plus vztahy. Pasivní čtení vytváří familiaritu: text vypadá známě, ale student ho neumí vybavit. Zkouška měří vybavení, ne pocit, že „to už jsem viděl“.</p>
<h2>Aktivní recall</h2>
<p>Po deseti minutách čtení zavřete knihu a napište, co zůstalo. Otázky pište dřív, než si čtete odpověď. Vysvětlení nahlas je levnější než další kapitola. Pokud nedokážete téma říct spolužákovi, ještě ho neovládáte.</p>
<h2>Rozložené opakování</h2>
<p>Stejná položka zítra, za tři dny, za týden a za měsíc vydrží déle než pět hodin v noci před termínem. Nástroj je vedlejší. Důležité je, že interval roste jen po správné odpovědi a zkracuje se po chybě.</p>
<ul>
<li>Kartička má jednu myšlenku, ne celý odstavec.</li>
<li>Na líci je otázka nebo schéma bez popisků.</li>
<li>Na rubu je mechanismus, ne citát z učebnice.</li>
</ul>
<h2>Ústní zkoušení jako trénink</h2>
<p>Lékařské zkoušky jsou často dialog. Trénujte dialog. Kolega se ptá „proč“, ne „vypište“. Když zadrhnete, neotvírejte hned knihu — zkuste cestu z jiné strany. Až potom si ověřte atlas nebo fyziologii.</p>
<h2>Co vynechat</h2>
<p>Celonoční zvýrazňování, přepisování skript bez otázek a sbírání PDF, která nikdo neotevře. Čas je na fakultě vzácnější než materiál. Studentská redakce doporučuje méně zdrojů a víc vybavení.</p>
${LEGAL}`,
  },
  {
    desk: "student",
    slug: "prijimacky-chemie-vypocty-a-pasti",
    title: "Chemie na přijímačky: stechiometrie a časté pasti ve výpočtech",
    excerpt:
      "Jak nepadat na jednotkách, zřeďování a pH. Přehled výpočtů, které se na přijímačkách lékařských fakult opakují.",
    cover_image_url: V21_MEDICAL_IMAGES.drug,
    meta_description:
      "Chemie na přijímačky LF: stechiometrie, ředění, pH a nejčastější početní pasti.",
    med_track: "priprava",
    student_topic: "prijimacky",
    rubric_slug: "studium",
    source_name: "Studentská redakce MedScopeGlobal",
    unit: "medscope_cz_student_desk",
    section: "studium",
    content: `<p>U přijímaček z chemie rozhoduje klidný výpočet víc než vzorec naučený nazpaměť. Většina ztrát bodů vzniká v jednotkách, v záměně látkového množství a hmotnosti a v nepozorném čtení zadání.</p>
<h2>Nejdřív veličina, potom číslo</h2>
<p>Napište, co je dáno a co hledáte. Převeďte vše na základní jednotky. Látkové množství, koncentrace, objem a hmotnost držte v jedné tabulce. Teprve pak sáhněte po kalkulačce.</p>
<h2>Stechiometrie</h2>
<p>Vyčíslená rovnice je mapa. Koeficienty jsou poměry molů, ne gramů. Pokud zadání dává gramy, převeďte na moly, dopočítejte poměr, a teprve zpět na gramy. U limitujícího reaktantu spočítejte obě cesty a vezměte menší výtěžek.</p>
<h2>Ředění a pH</h2>
<p>Při ředění se látkové množství nemění. Vzorec c<sub>1</sub>V<sub>1</sub> = c<sub>2</sub>V<sub>2</sub> platí jen tehdy, když nemícháte dvě různé látky. pH silné kyseliny není magie: nejdřív koncentrace H<sub>3</sub>O<sup>+</sup>, potom záporný logaritmus. U slabých kyselin bez disociační konstanty výsledek nehádáte.</p>
<ul>
<li>Počitejte na papír, i když umíte výsledek odhadnout.</li>
<li>Kontrolujte řád: millimol není mol.</li>
<li>U organické chemie se ptejte na funkční skupinu a typ reakce, ne na memorovaný název.</li>
</ul>
<p>Tento text je pedagogický přehled, nikoli oficiální sbírka konkrétní fakulty. Požadavky a povolené pomůcky ověřte u zvolené školy.</p>
${LEGAL}`,
  },
  {
    desk: "student",
    slug: "anatomie-srdce-prevodni-system-pro-studenty",
    title: "Anatomie srdce pro studenty: komory, chlopně a převodní systém",
    excerpt:
      "Jak si sestavit srdce jako tok krve a elektrický impulz — studijní mapa pro histologii, fyziologii i pozdější kliniku.",
    cover_image_url: V21_MEDICAL_IMAGES.hero,
    meta_description:
      "Anatomie srdce pro studenty medicíny: komory, chlopně, koronární tepny a převodní systém.",
    med_track: "studium",
    student_topic: "anatomie",
    study_year: 1,
    rubric_slug: "studium",
    source_name: "Studentská redakce MedScopeGlobal",
    unit: "medscope_cz_student_desk",
    section: "studium",
    content: `<p>Srdce se učí špatně, když začnete u názvů a skončíte u obrázku. Správné pořadí je tok krve, chlopně, stěna, koronární tepny a teprve potom převodní systém. Každá vrstva drží tu předchozí.</p>
<h2>Tok, ne seznam dutin</h2>
<p>Dutá žíla, pravá síň, trojcípá chlopeň, pravá komora, pulmonální chlopeň, plíce, levá síň, mitrální chlopeň, levá komora, aortální chlopeň, aorta. Řekněte to nahlas bez nákresu. Až to drží, doplňte papilární svaly a šlašinky — proto se cípy při systole neobracejí.</p>
<h2>Stěna a obaly</h2>
<p>Endokard, myokard, epikard, perikard. Levá komora má silnější myokard, protože tlačí do systémového odporu. To není „zajímavost“, to je důvod, proč infarkt levé komory má jiný dopad než obraz pravé strany. Zatím bez diagnózy — jen jako kotva k fyziologii.</p>
<h2>Koronární tepny</h2>
<p>Pravá a levá věnčitá tepna odstupují z aorty nad aortální chlopní. Naučte se hlavní větve a které stěny obvykle zásobují. Bez tohoto schématu je EKG v dalších ročnících jen čára.</p>
<h2>Převodní systém</h2>
<p>SA uzel, internodální dráhy, AV uzel, Hisův svazek, Tawarova raménka, Purkyňova vlákna. Pořadí je elektrický tok. Zpoždění v AV uzlu dává čas na plnění komor. Tohle je most do fyziologie, ne ozdoba anatomie.</p>
<p>Kreslete srdce zepředu, zezadu a v řezu. Pojmenujte struktury na prázdném schématu. Studentská redakce doporučuje atlas plus vlastní nákres, ne samotné video.</p>
${LEGAL}`,
  },
  {
    desk: "physician",
    slug: "farmakovigilance-hlaseni-sukl-v-ordinaci",
    title: "Farmakovigilance v ordinaci: jak hlásit nežádoucí účinky na SÚKL",
    excerpt:
      "Klinický briefing pro lékaře: kdy má hlášení smysl, co do něj patří a jak nesměšovat kauzalitu s povinností informovat.",
    cover_image_url: V21_MEDICAL_IMAGES.drug,
    meta_description:
      "Farmakovigilance pro lékaře: hlášení nežádoucích účinků na SÚKL, co uvést a proč to není přiznání chyby.",
    rubric_slug: "odborne",
    source_name: "Klinická obsahová redakce MedScopeGlobal",
    unit: "medscope_cz_klinicka",
    section: "pharmacovigilance",
    content: `<p>Hlášení podezření na nežádoucí účinek není přiznání pochybení. Je to příspěvek do systému, který umí zachytit signál dřív, než ho uvidí jedna ordinace. V Česku je kontaktním místem Státní ústav pro kontrolu léčiv.</p>
<h2>Co má smysl hlásit</h2>
<p>Závažné, neočekávané a nově vzniklé reakce mají přednost. U nových léčiv a biologik je práh nižší. Očekávaná mírná reakce u známého přípravku systém neobohatí, ale opakovaný cluster v jedné praxi už může.</p>
<h2>Co do hlášení patří</h2>
<ul>
<li>Identifikace přípravku včetně šarže, pokud je dostupná.</li>
<li>Časová osa: nasazení, vznik, vysazení, rechallenge pokud nastal.</li>
<li>Klinický obraz a relevantní komedikace.</li>
<li>Výsledek a případná hospitalizace.</li>
</ul>
<p>Kauzalitu v hlášení neuzavíráte. Uvádíte podezření a fakta. Hodnocení provádí farmakovigilanční tým. Obava, že „to nebude ono“, je častý důvod, proč signál zmizí.</p>
<h2>Dokumentace v kartě</h2>
<p>Stejný záznam, který posíláte, patří do dokumentace: datum, přípravek, popis, poučení pacienta a další postup. To není administrativa navíc. Je to kontinuita péče, když pacient přejde k jinému lékaři.</p>
<h2>Co text není</h2>
<p>Tento briefing nenahrazuje aktuální pokyny SÚKL ani souhrn údajů o přípravku. Před odesláním ověřte platný formulář a kanál hlášení. Klinická redakce MedScopeGlobal připomíná, že farmakovigilance je součást bezpečnosti, ne vedlejší agenda.</p>
${LEGAL}`,
  },
  {
    desk: "physician",
    slug: "antibioticka-stewardship-v-ambulanci",
    title: "Antibiotická stewardship v ambulanci praktického lékaře",
    excerpt:
      "Jak v ordinaci rozhodovat o antibiotiku: pravděpodobnost bakteriální etiologie, spektrum, doba podání a komunikace s pacientem.",
    cover_image_url: V21_MEDICAL_IMAGES.medicina,
    meta_description:
      "Antibiotická stewardship v ambulanci: spektrum, trvání, komunikace a kdy antibiotikum neindikovat.",
    rubric_slug: "odborne",
    source_name: "Klinická obsahová redakce MedScopeGlobal",
    unit: "medscope_cz_klinicka",
    section: "guidelines",
    content: `<p>Stewardship není kampaň proti antibiotikům. Je to disciplína, která chrání pacienta před zbytečnou toxicitou a společnost před rezistencí. V ambulanci se rozhodnutí dělá s omezeným časem a nejistotou — proto potřebuje strukturu, ne slogan.</p>
<h2>Nejdřív pravděpodobnost, potom přípravek</h2>
<p>Otázka není „které antibiotikum“, ale „je teď bakteriální léčba pravděpodobně prospěšná“. U řady respiračních infekcí je odpověď ne. Pokud ano, zúžíte spektrum na nejčastější původce v daném kontextu a na lokální rezistenci, pokud ji znáte.</p>
<h2>Dávka a doba</h2>
<p>Příliš krátká kúra u potvrzené indikace není ctnost. Zbytečně dlouhá kúra u nejisté indikace také ne. Držte se platného doporučení odborné společnosti a SPC. Tento text konkrétní režimy nepředepisuje.</p>
<ul>
<li>Zaznamenejte indikaci vlastními slovy, ne jen název přípravku.</li>
<li>Nastavte kontrolu: kdy se má stav zlepšit a co dělat, když se nezlepší.</li>
<li>Nezaměňujte „jistotu pacienta“ za indikaci.</li>
</ul>
<h2>Komunikace</h2>
<p>Vysvětlení, proč antibiotikum teď nepomůže, je klinický výkon. Pojmenujte očekávaný průběh, varovné příznaky a důvod, proč se vracet. Recept „pro jistotu“ je drahý kompromis, který se v kartě tváří jako péče.</p>
<p>Ověřte aktuální doporučení ČLS JEP a lokální mikrobiologii. MedScopeGlobal neposkytuje léčebný protokol pro konkrétního pacienta.</p>
${LEGAL}`,
  },
  {
    desk: "physician",
    slug: "hypertenze-jak-cist-doporuceni-v-praxi",
    title: "Hypertenze v praxi: jak číst doporučení bez zjednodušení",
    excerpt:
      "Odborný briefing k arteriální hypertenzi: měření, cíle, životní styl a farmakoterapie jako rámec — bez náhrady platného guideline.",
    cover_image_url: V21_MEDICAL_IMAGES.hero,
    meta_description:
      "Jak číst doporučení k hypertenzi v ordinaci: měření, cíle, režim a farmakoterapie jako rámec.",
    rubric_slug: "odborne",
    source_name: "Klinická obsahová redakce MedScopeGlobal",
    unit: "medscope_cz_klinicka",
    section: "guidelines",
    content: `<p>Hypertenze je častá, proto svádí k automatismu. Doporučení odborných společností se mění v nuancích: jak měřit, jaké cíle volit u křehkého pacienta, kdy zahájit kombinaci. Briefing učí číst dokument, ne ho nahradit.</p>
<h2>Měření je diagnóza i sledování</h2>
<p>Jedno číslo v ambulanci nestačí. Záleží na podmínkách, manžetě, opakování a na domácím nebo ambulantním monitorování, pokud je dostupné. Bílá halena není anekdota — je to zdroj nadléčení i podléčení.</p>
<h2>Cíl není jedno číslo pro všechny</h2>
<p>Guideline uvádí rozmezí a výjimky. Věk, komorbidity, tolerance a riziko pádů mění, kam tlačit. „Čím níže, tím lépe“ bez kontextu není čtení doporučení, je to zkratka.</p>
<h2>Režim není úvodní odstavec k přeskočení</h2>
<p>Sůl, pohyb, hmotnost, alkohol a kouření mění potřebu léků. Pokud je v kartě jen přípravek a chybí režim, dokumentace je neúplná. Režim ale není důvod odkládat farmakoterapii u vysokého rizika.</p>
<h2>Farmakoterapie jako třída, ne jako značka</h2>
<p>Čtěte mechanismus, kontraindikace, interakce a vliv na komorbidity. Kombinace má důvod v patofyziologii i v adherenci. Tento text nejmenuje konkrétní schéma — to patří do platného doporučení a do individuálního rozhodnutí.</p>
<p>Před aplikací ověřte aktuální dokument ESC / ČSH a SPC. Klinická redakce MedScopeGlobal necituje falešné DOI a nenahrazuje guideline.</p>
${LEGAL}`,
  },
  {
    desk: "physician",
    slug: "laboratorni-panel-racionalni-interpretace",
    title: "Klinický briefing: racionální interpretace základního laboratorního panelu",
    excerpt:
      "Jak číst krevní obraz, ionty, ledvinné a jaterní testy v souvislostech — a kdy číslo bez otázky mate.",
    cover_image_url: V21_MEDICAL_IMAGES.study,
    meta_description:
      "Racionální interpretace základního laboratorního panelu v ordinaci: kontext, trendy a limity čísla.",
    rubric_slug: "odborne",
    source_name: "Klinická obsahová redakce MedScopeGlobal",
    unit: "medscope_cz_klinicka",
    section: "guidelines",
    content: `<p>Laboratoř odpovídá na otázku, kterou lékař položil. Bez otázky je panel seznam odchylek. Referenční mez není hranice nemoci. Trend v čase často řekne víc než jedna hodnota mimo interval.</p>
<h2>Nejdřív preanalytika</h2>
<p>Hemolýza, dlouhá stagnace, špatná zkumavka a infuze nad místem odběru kazí výsledek dřív, než ho uvidíte. Pokud obraz nesedí ke klinice, opakujte odběr dřív, než rozvinete vzácnou diferenciální rozvahu.</p>
<h2>Krevní obraz</h2>
<p>Hemoglobin, leukocyty a destičky čtěte spolu. Izolovaná odchylka jedné řady má jiný význam než pancytopenie. Diferenciál bez kliniky je dekorace. Klinika bez diferenciálu u horečky je slepá skvrna.</p>
<h2>Ionty, ledviny, játra</h2>
<p>Sodík čtěte s osmolaritou a objemem, ne jako samostatné číslo. Kreatinin je funkcí svalové hmoty i filtrace. Jaterní testy rozlišujte na hepatocelulární a cholestatický vzorec, než sáhnete po dalším vyšetření.</p>
<ul>
<li>Pište do karty, proč jste panel objednali.</li>
<li>Označte, která odchylka mění postup teď, a která se kontroluje.</li>
<li>Neslibujte pacientovi diagnózu z jedné hodnoty.</li>
</ul>
<p>Text je vzdělávací rámec. Referenční meze, jednotky a doporučené postupy se liší laboratoří a odbornou společností.</p>
${LEGAL}`,
  },
  {
    desk: "physician",
    slug: "komunikace-rizika-s-pacientem-v-ordinaci",
    title: "Komunikace rizika s pacientem v ordinaci",
    excerpt:
      "Jak mluvit o prospěchu, škodě a nejistotě, aby pacient rozuměl rozhodnutí — bez strašení a bez falešné jistoty.",
    cover_image_url: V21_MEDICAL_IMAGES.digitalHealth,
    meta_description:
      "Komunikace rizika v ordinaci: prospěch, škoda, nejistota a sdílené rozhodování bez strašení.",
    rubric_slug: "odborne",
    source_name: "Klinická obsahová redakce MedScopeGlobal",
    unit: "medscope_cz_klinicka",
    section: "guidelines",
    content: `<p>Pacient nerozhoduje podle p hodnoty. Rozhoduje podle toho, co pochopí o prospěchu, škodě a alternativě. Špatně podané riziko vede k odmítnutí užitečné péče nebo k přijetí zbytečné.</p>
<h2>Absolutní čísla před relativními</h2>
<p>„Sníží riziko o polovinu“ bez základního rizika je klam. Říkejte: z kolika lidí ze sta se to stane bez zásahu a s ním. Pokud číslo neznáte, řekněte, že jde o řád, ne o přesnost. Nejistota je poctivější než falešná desetinná místa.</p>
<h2>Rámec, ne nátlak</h2>
<p>Stejné číslo zní jinak jako ztráta a jako zisk. Střídejte oba popisy, pokud rozhodujete o screeningu nebo o dlouhodobé léčbě. Ptejte se, co pacientovi vadí víc: opomenutá nemoc, nebo škoda ze zásahu.</p>
<h2>Dokumentace souhlasu</h2>
<p>Souhlas není podpis pod text, kterému nikdo nerozuměl. Zapište, co jste vysvětlili, jaké otázky padly a jaké preference pacient uvedl. To chrání kontinuitu péče i právně srozumitelný záznam.</p>
<p>Tento briefing není právní návod ani komunikační skript pro konkrétní diagnózu. Doplňuje, nenahrazuje, doporučení k informovanému souhlasu.</p>
${LEGAL}`,
  },
  {
    desk: "physician",
    slug: "lekove-interakce-systematicky-pristup",
    title: "Lékové interakce: systematický přístup před předpisem",
    excerpt:
      "Jak v ordinaci projít komedikaci, CYP dráhy a klinicky významné kombinace dřív, než se z interakce stane příhoda.",
    cover_image_url: V21_MEDICAL_IMAGES.drug,
    meta_description:
      "Lékové interakce v praxi: komedikace, CYP, klinický význam a kdy kombinaci nepodat.",
    rubric_slug: "odborne",
    source_name: "Klinická obsahová redakce MedScopeGlobal",
    unit: "medscope_cz_klinicka",
    section: "pharmacovigilance",
    content: `<p>Interakce není teoretická kapitola z farmakologie. Je to důvod, proč se běžný přípravek stane nebezpečným u člověka s pěti krabičkami. Software upozorní na mnoho dvojic. Lékař musí rozhodnout, která z nich mění postup.</p>
<h2>Nejdřív úplný seznam</h2>
<p>Recept, volně prodejné přípravky, doplňky a grapefruit nejsou folklór. Zeptejte se na ně. Bez seznamu je databáze slepá. U seniorů a po hospitalizaci seznam aktualizujte, ne kopírujte loňskou medikaci.</p>
<h2>Mechanismus zúží hluk</h2>
<p>Farmakokinetika (vstřebání, CYP, transportéry, vylučování) a farmakodynamika (stejný účinek, protichůdný účinek) se čtou zvlášť. Dvě upozornění stejného typu jsou jeden problém. Deset různorodých alertů je šum, který se nesmí stát důvodem k ignorování všech.</p>
<ul>
<li>Který lék lze vysadit nebo nahradit?</li>
<li>Který vyžaduje kontrolu hladiny, INR, pulzu nebo iontů?</li>
<li>Který je natolik rizikový, že kombinaci nepodáte?</li>
</ul>
<h2>Dokumentujte rozhodnutí</h2>
<p>Pokud alert přepíšete, napište proč. Budoucí kolega neuvidí vaši úvahu, uvidí jen kombinaci. SPC a lékový informační systém mají přednost před tímto briefingem.</p>
${LEGAL}`,
  },
  {
    desk: "research",
    slug: "jak-cist-randomizovanou-studii-endpointy-a-bias",
    title: "Jak číst randomizovanou studii: endpointy, bias a přenos do praxe",
    excerpt:
      "Výzkumný briefing: jak v RCT oddělit primární cíl od dekorace, randomizaci od slibu a statistickou významnost od klinického smyslu.",
    cover_image_url: V21_MEDICAL_IMAGES.study,
    meta_description:
      "Jak číst randomizovanou studii: primární endpoint, bias, generalizace a klinický význam.",
    rubric_slug: "studie",
    source_name: "Redakce evidence a dat MedScopeGlobal",
    unit: "medscope_evidence_synthesis",
    section: "evidence",
    content: `<p>Randomizovaná studie je silný nástroj, ne automatická pravda. Čtenář, který začne u tiskové zprávy, uvidí účinek. Čtenář, který začne u protokolu a endpointů, uvidí, co se skutečně měřilo.</p>
<h2>Nejdřív otázka studie</h2>
<p>PICO není školní cvičení. Populace, zásah, kontrola a výsledek určují, zda článek odpovídá na vaši klinickou otázku. Pokud se primární endpoint liší od toho, co slibuje titulek, čtete jinou studii, než si myslíte.</p>
<h2>Randomizace a slepení</h2>
<p>Randomizace má snížit systematickou chybu ve výchozích vlastnostech. Slepení má snížit bias v hodnocení. Ztráty z follow-up a změna endpointu po zahájení jsou místa, kde se síla designu ztrácí. ITT a per-protocol říkají jiný příběh — potřebujete oba, ne ten hezčí.</p>
<h2>Číslo není rozhodnutí</h2>
<p>p &lt; 0,05 není důkaz důležitosti. Absolutní rozdíl, NNT a poškození patří vedle relativního rizika. Široký interval spolehlivosti u malého vzorku je poctivější než hezké p u slabého účinku.</p>
<p>Redakce evidence MedScopeGlobal necituje falešná DOI a neprezentuje tento text jako recenzi konkrétní práce. Před přenosem do praxe čtěte primární pramen a platné doporučení.</p>
${LEGAL}`,
  },
  {
    desk: "research",
    slug: "hierarchie-dukazu-bez-falesne-jistoty",
    title: "Evidence v medicíně: hierarchie důkazů bez falešné jistoty",
    excerpt:
      "Proč meta-analýza nemusí být nejsilnější argument a kdy dobře popsaná série případů změní praxi víc než slabé RCT.",
    cover_image_url: V21_MEDICAL_IMAGES.congress,
    meta_description:
      "Hierarchie důkazů v medicíně: RCT, observace, meta-analýza a limity pyramidy bez falešné jistoty.",
    rubric_slug: "studie",
    source_name: "Redakce evidence a dat MedScopeGlobal",
    unit: "medscope_evidence_synthesis",
    section: "evidence",
    content: `<p>Pyramida evidence je pedagogická pomůcka. Není soud. Špatně provedená meta-analýza je slabší než jedna poctivá randomizovaná studie. Dobře zdokumentovaný nežádoucí účinek v sérii případů může být silnější signál než poddimenzované RCT, které ho nevidělo.</p>
<h2>Co pyramida umí</h2>
<p>Řadí design podle schopnosti snížit určité typy bias u otázek o účinku zásahu. Proto je RCT výše než observace u „funguje to?“. Proto je systematický přehled užitečný, když skládá srovnatelné studie, ne když míchá hrušky s jablky.</p>
<h2>Co pyramida neumí</h2>
<p>Neřeší relevanci populace, kvalitu měření ani konflikt zájmů. Neříká, že observace je k ničemu u vzácných škod a u otázek o prognóze. Neomlouvá čtenáře, který neotevřel metody.</p>
<ul>
<li>Je otázka o účinku, o škodě, o diagnostice, nebo o zkušenosti pacienta?</li>
<li>Jsou studie dost podobné, aby šly skládat?</li>
<li>Je výsledek přenositelný do vaší ordinace a zdravotního systému?</li>
</ul>
<p>Tento briefing je metodický, ne bibliografický. Bez falešných citací. Primární prameny ověřujte v databázích a v dokumentech odborných společností.</p>
${LEGAL}`,
  },
  {
    desk: "research",
    slug: "meta-analyza-pro-klinika-kdy-pomaha",
    title: "Meta-analýza pro klinika: kdy pomáhá a kdy mate",
    excerpt:
      "Jak číst souhrn studií: heterogenita, malé studie, selekce publikací a rozdíl mezi statistickým a klinickým sloučením.",
    cover_image_url: V21_MEDICAL_IMAGES.study,
    meta_description:
      "Jak číst meta-analýzu v praxi: heterogenita, publikační bias a kdy sloučení studií mate.",
    rubric_slug: "studie",
    source_name: "Redakce evidence a dat MedScopeGlobal",
    unit: "medscope_evidence_synthesis",
    section: "evidence",
    content: `<p>Meta-analýza slibuje jedno číslo místo dvanácti. To je užitečné, když studie měří totéž u podobných lidí. Je to nebezpečné, když software spočítá průměr z nesourodých designů a titulek to prohlásí za jistotu.</p>
<h2>Heterogenita není poznámka pod čarou</h2>
<p>I<sup>2</sup> a tau říkají, že studie se neshodují. Otázka zní proč: jiná dávka, jiný endpoint, jiná populace, jiná kvalita. Pokud to autoři nevysvětlí, sloučený odhad je dekorace.</p>
<h2>Malé studie a publikace</h2>
<p>Malé pozitivní práce se publikují snáz než malé negativní. Funnel plot a registrace protokolu jsou obrana, ne záruka. Pokud chybí protokol, čtěte výsledek jako hypotézu, ne jako uzavřený důkaz.</p>
<h2>Co s tím v praxi</h2>
<p>Hledejte, zda souhrn mění váš postup u konkrétního pacienta. Pokud interval sahá od škody k prospěchu, nemáte jistotu, máte nejistotu slušně spočítanou. To je také výsledek.</p>
<p>Redakce evidence MedScopeGlobal neuvádí falešná DOI. Před citací v dokumentaci sáhněte po primárním přehledu v Cochrane nebo v recenzovaném časopise.</p>
${LEGAL}`,
  },
];

function deskFields(article: DeskSeed): Record<string, unknown> {
  if (article.desk === "student") {
    return {
      min_access_level: "student",
      audience: "professional",
      med_track: article.med_track ?? "studium",
      student_topic: article.student_topic ?? "studium",
      ...(article.study_year ? { study_year: article.study_year } : {}),
    };
  }
  if (article.desk === "physician") {
    return {
      min_access_level: "physician",
      audience: "professional",
    };
  }
  return {
    min_access_level: "public",
    audience: "professional",
  };
}

export async function seedDeskArticles(): Promise<{ seeded: number; skipped: number; errors: string[] }> {
  const admin = createServiceRoleClient();
  const { data: cat } = await admin.from("categories").select("id").limit(1).maybeSingle();
  if (!cat?.id) return { seeded: 0, skipped: 0, errors: ["Chybí kategorie v databázi."] };

  let authorId = process.env.INGESTION_AUTHOR_ID ?? null;
  if (!authorId) {
    const { data: userRow } = await admin.from("users").select("id").eq("role", "admin").limit(1).maybeSingle();
    authorId = userRow?.id ?? null;
  }
  if (!authorId) return { seeded: 0, skipped: 0, errors: ["Chybí author_id."] };

  let seeded = 0;
  let skipped = 0;
  const errors: string[] = [];
  const now = Date.now();

  for (let i = 0; i < SEEDS.length; i += 1) {
    const article = SEEDS[i]!;
    const { data: existing } = await admin.from("articles").select("id").eq("slug", article.slug).maybeSingle();
    if (existing?.id) {
      skipped += 1;
      continue;
    }

    const extra = deskFields(article);
    const publishedAt = new Date(now - i * 36 * 60 * 1000).toISOString();
    const row: Record<string, unknown> = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      cover_image_url: article.cover_image_url,
      category_id: cat.id,
      author_id: authorId,
      published: true,
      published_at: publishedAt,
      vip_only: false,
      rubric_slug: article.rubric_slug,
      locale: "cs",
      source_name: article.source_name,
      meta_description: article.meta_description,
      ai_generated: false,
      hash_dedup: `desk-seed-${article.slug}`,
      metadata: {
        editorial_version: "26.4.0",
        section: article.section,
        editorial_unit_primary: article.unit,
        ai_assisted: false,
        fully_open: true,
        desk: article.desk,
      },
      ...extra,
    };

    const { error } = await admin.from("articles").insert(row);
    if (error) {
      const {
        med_track: _medTrack,
        student_topic: _studentTopic,
        study_year: _studyYear,
        ...core
      } = row;
      const retry = await admin.from("articles").insert(core);
      if (retry.error) errors.push(`${article.slug}: ${retry.error.message}`);
      else seeded += 1;
    } else {
      seeded += 1;
    }
  }

  return { seeded, skipped, errors };
}

export async function ensureDeskArticlesSeeded(): Promise<{ seeded: number }> {
  const admin = createServiceRoleClient();
  const [{ count: students }, { count: physicians }] = await Promise.all([
    admin
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .eq("min_access_level", "student"),
    admin
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .eq("min_access_level", "physician"),
  ]);

  if ((students ?? 0) >= 5 && (physicians ?? 0) >= 5) return { seeded: 0 };
  const result = await seedDeskArticles();
  return { seeded: result.seeded };
}
