/** Desk-quality Czech copy for the most visible magazine cards and bodies. */

export type MagazineDeskOverride = {
  title: string;
  excerpt: string;
  content?: string;
};

const DISCLAIMER =
  "<p><em>Text slouží ke vzdělávání. Nenahrazuje vyšetření, diagnózu ani individuální lékařskou radu.</em></p>";

function article(sections: string): string {
  return `${sections}\n${DISCLAIMER}`;
}

export const MAGAZINE_DESK_OVERRIDES: Record<string, MagazineDeskOverride> = {
  "verejnost-prevence-2026-06-23-dusevni-pohoda-kdy-vyhledat-odbornou-pomoc": {
    title: "Duševní pohoda: kdy stačí režim a kdy už hledat odbornou pomoc",
    excerpt:
      "Únava po směně je běžná. Trvající nespavost, ztráta chuti k jídlu nebo myšlenky, že by bylo lépe nebýt, už patří k lékaři — ne na další seznam tipů.",
    content: article(`<p>V české praxi se duševní potíže často schovají za „jen jsem unavený“. Praktický lékař, psychiatr i krizové linky ale řeší stejnou otázku: jde o přetížení, které poleví po spánku a úpravě režimu, nebo o stav, který už mění práci, vztahy a bezpečí?</p>
<h2>Co je ještě zátěž a co už nemoc</h2>
<p>Krátký pokles nálady po hádce, nemoci v rodině nebo nočních směnách patří k životu. Varovné je, když se stav táhne týdny, vrací se bez zjevné příčiny a přestáváte zvládat věci, které jste dřív uměli. Typické signály jsou porucha spánku, ztráta chuti k jídlu nebo naopak přejídání, stažení od lidí, výbuchy vzteku a pocit, že nic nemá smysl.</p>
<p>U úzkosti si lidé často stěžují na tlak na hrudi, bušení srdce a pocit, že se „nedá nadechnout“. U deprese na prázdno, zpomalení a vinu. Ani jedno z toho se nemá diagnostikovat z článku. Má se ale brát vážně dřív, než se zhorší pracovní neschopnost nebo vztahy.</p>
<h2>Kdy jít k praktickému lékaři</h2>
<p>Praktický lékař je v Česku správné první dveře, pokud potíže trvají déle než dva týdny, zasahují do práce nebo péče o děti, nebo pokud se bojíte, že jde o něco tělesného. Lékař vyloučí anémii, poruchu štítné žlázy, vedlejší účinky léků a doporučí další krok — včetně psychiatrie nebo psychologie.</p>
<ul>
<li>Objednejte se, když se nespavost nebo plačtivost opakuje několik týdnů.</li>
<li>Řekněte nahlas, co se změnilo v jídle, spánku, alkoholu a práci — ne jen „jsem ve stresu“.</li>
<li>Pokud berete léky na tlak, bolest nebo hormonální antikoncepci, vezměte seznam s sebou.</li>
</ul>
<h2>Kdy nečekat na objednání</h2>
<p>Myšlenky na smrt, plán, jak si ublížit, halucinace nebo náhlá změna chování po nové dávce léku patří na tísňovou linku 155, případně 112. Krizovou pomoc v Česku zajišťují i linky důvěry a psychiatrické pohotovosti v krajských nemocnicích. Čekat „až zítra“ se v těchto situacích nevyplácí.</p>
<p>Stejně rychle jednat, když blízký přestane pít, jíst, reagovat, nebo když po porodu nastoupí zmatenost a strach o dítě. To není slabost. To je medicína.</p>
<h2>Co pomáhá, než se dostanete do ordinace</h2>
<p>Režim nemoc nenahradí, ale snižuje chaos. Stabilní čas vstávání, denní světlo, omezení alkoholu a krátká chůze venku jsou opatření, která psychiatr i praktický lékař obvykle podporují. Sociální sítě po půlnoci a samoléčba tabletami od známých stav zhoršují častěji, než ho spraví.</p>
<p>Pokud už máte termín za týden, napište si tři věty: kdy to začalo, co nejvíc vadí a co jste zkoušeli. Ušetří to čas v ambulanci a snižuje riziko, že v stresu zapomenete na důležité detaily.</p>
<h2>Jak mluvit s rodinou bez nátlaku</h2>
<p>Místo „však to přeženeš“ funguje konkrétní nabídka: doprovod k lékaři, hlídání dětí, odvoz. Blízkému neříkejte, že „to má v hlavě“. Řekněte, že vidíte změnu a že chcete pomoct s prvním krokem. Pokud odmítá péči a zároveň je v ohrožení, volejte záchrannou službu — ne Facebook.</p>
<h2>Co v Česku skutečně pomáhá, než se uvolní termín</h2>
<p>Objednací doby u psychiatrie se liší podle kraje. Než přijde specialista, praktický lékař může zahájit základní vyšetření, upravit léky, které náladu horší, a napsat neschopenku, pokud práci nezvládáte. Psychologie ve zdravotnictví i krizová centra městských nemocnic jsou často rychlejší než čekání na ideálního terapeuta z internetu.</p>
<p>Linka první psychické pomoci a regionální krizové linky existují proto, aby člověk nemusel v noci sahat po alkoholu nebo po tabletkách od souseda. Číslo si uložte dřív, než ho budete potřebovat. Stejně tak kontakt na praktického lékaře po pracovní době — mnoho ordinací má záznamník s návodem na pohotovost.</p>
<p>Škola a zaměstnavatel nejsou lékař. Mohou ale uvolnit režim, když přinesete zprávu. Není ostuda říct personalistovi, že jdete k lékaři. Ostuda je předstírat chřipku šest týdnů, zatímco se deprese prohlubuje.</p>
<h2>Mýty, které zbytečně oddalují péči</h2>
<p>„Až to bude vážné, poznám to.“ Často nepoznáte. Pozná to partner nebo kolega. „Antidepresiva změní osobnost.“ Mění spíš nespavost a úzkost, když je nasadí lékař. „Psycholog je pro slabé.“ Psycholog je pro lidi, kteří chtějí znovu spát a pracovat. „Když budu cvičit a meditovat, stačí to.“ U středně těžké deprese to nestačí. Režim doplňuje léčbu, nenahrazuje ji.</p>
<p>Další častý omyl: čekat na lednový restart. Duševní stav nectí kalendář. Pokud se teď budíte ve tři a plačete v koupelně, termín v březnu je pozdě. Vezměte první volné okno u praktického lékaře tento týden.</p>
<h2>Zdroje</h2>
<ul>
<li>NZIP — duševní zdraví a krizová pomoc</li>
<li>Ministerstvo zdravotnictví ČR — péče v psychiatrii</li>
<li>WHO — mental health gap a včasné vyhledání péče</li>
</ul>`),
  },

  "verejnost-rozhovory-2026-06-23-pecovatele-o-dusevni-zdravi-senioru-rodina-jako-opora": {
    title: "Péče o seniora s duševní nemocí: co unese rodina a co už ne",
    excerpt:
      "Rodina v Česku často drží domácí péči bez návodu. U deprese, demence nebo zmatenosti rozhoduje režim, praktický lékař a včasná odlehčovací služba — ne další slib, že to zvládnete sami.",
    content: article(`<p>Když se u rodiče objeví zapomínání, podezíravost nebo stažení, rodina většinou nejdřív upraví domácnost a až pozdě volá lékaře. V Česku přitom platí jednoduché pravidlo: duševní změna u seniora je důvod k vyšetření, ne k čekání, „až se to srovná“.</p>
<h2>Co rodina pozná dřív než diagnóza</h2>
<p>První signály bývají praktické. Účty se platí dvakrát, jídlo zůstává v troubě, sousedé hlásí noční telefonáty. Senior popírá potíže, protože se bojí ústavu. Úkolem rodiny není vyhrát hádku, ale zapsat konkrétní události a donést je praktickému lékaři nebo geriatrovi.</p>
<p>U deprese ve stáří často chybí plačtivost. Převládá nezájem o vnoučata, ztráta chuti, opakované stížnosti na bolest bez nálezu. U demence se mění orientace, řeč a schopnost plánovat. Obojí se může překrývat s infekcí močových cest, dehydratací nebo vedlejším účinkem léků.</p>
<h2>Jak rozdělit péči, aby se domácnost nezhroutila</h2>
<p>Jedna dcera nebo syn obvykle nese všechno. To je nejrychlejší cesta k vyhoření pečovatele. Rozdělte týden na směny: kdo bere léky, kdo nákup, kdo doprovod k lékaři. I dvě hodiny odlehčení týdně snižují chyby v medikaci a hádky.</p>
<ul>
<li>Veďte seznam léků včetně kapek a volně prodejných přípravků.</li>
<li>Nastavte jeden kontakt na praktického lékaře a jednu osobu, která volá lékárnu.</li>
<li>Zeptejte se obce na příspěvek na péči a terénní službu — ne až po pádu.</li>
</ul>
<h2>Kdy volat lékaře a kdy záchranku</h2>
<p>Náhlá zmatenost, neschopnost rozeznat byt, pád s úderem hlavy, odmítání tekutin nebo agresivita, kterou nezvládáte, patří na 155. Plíživé zhoršování paměti patří k praktickému lékaři a následně ke specialistovi. Čekat na „lepší den“ u člověka, který se ztrácí v paneláku, je nebezpečné.</p>
<p>Pokud pečovatel sám přestává spát, pije přes míru nebo má myšlenky, že to vzdá, je to taky zdravotní stav. Odlehčovací pobyt nebo denní stacionář není selhání rodiny. Je to součást péče.</p>
<h2>Co říkat seniorovi bez ponížení</h2>
<p>Vyhněte se zkoušení typu „víš, jaký je den?“. Místo toho popište situaci: „Vidím, že se vracíš z obchodu bez nákupu. Pojďme to zítra projít s lékařem.“ Konkrétní nabídka dopravy funguje líp než obecná starost. Pokud senior odmítá vyšetření a zároveň ohrožuje sebe nebo okolí, rozhoduje lékař a záchranná služba, ne rodinné hlasování.</p>
<h2>Peníze, dávky a odlehčení bez studu</h2>
<p>Příspěvek na péči, terénní pečovatelská služba a odlehčovací pobyt jsou v Česku nástroje, ne přiznání porážky. Žádost trvá. Začněte, zatímco ještě zvládáte noční směny u lůžka. Obecní úřad a praktický lékař vědí, kam poslat formulář. Charita a diecézní charity často umí nastoupit dřív než velký ústav.</p>
<p>Účet za inkontinenční pomůcky, dopravu a ušlou mzdu pečovatele se sečte rychleji než diagnóza. Zapište výdaje. Sourozenci, kteří „nemají čas“, můžou platit službu, i když nehlídají. To je férovější než tichá válka o víkendy.</p>
<p>Pokud pečovatel bere léky na tlak a přestává je polykat, protože „teď není čas“, je to další pacient v domácnosti. Jedna ambulance pro seniora a jedna kontrola pro pečovatele. Dva kalendáře, ne jeden hrdinský.</p>
<h2>Bezpečnost bytu, než přijde diagnóza</h2>
<p>Sporák s hlídáním, kopie klíčů u důvěryhodného souseda, vyřazení volně ložených koberečků a noční světlo na cestě na záchod snižují pády. Léky z koupelny pryč z dohledu, pokud je v rodině zmatek v dávkování. Bankovní limity a plná moc se řeší, dokud senior ještě rozumí, co podepisuje — ne až po první ztrátě úspor.</p>
<h2>Zdroje</h2>
<ul>
<li>NZIP — péče o seniory a duševní zdraví</li>
<li>Česká alzheimerovská společnost — podpora pečujících</li>
<li>Ministerstvo práce a sociálních věcí — příspěvek na péči</li>
</ul>`),
  },

  "verejnost-zivotni-styl-2026-06-24-zimni-spanek-jak-si-uchovat-energii-a-vitalitu-behem-nejdelsich-noci": {
    title: "Zimní noci a spánek: co opravdu drží energii, když se stmívá ve čtyři",
    excerpt:
      "Krátký den v Česku kazí usínání častěji než „nedostatek vůle“. Světlo ráno, tma večer a stálý čas vstávání udělají víc než další bylinný čaj.",
    content: article(`<p>Od listopadu do února se v Česku stmívá dřív, než mnoho lidí odejde z práce. Tělo to čte jako signál k útlumu, ale pracovní doba se nekrátí. Výsledek je známý: usínání u obrazovky, noční buzení a ranní únava, kterou lidé léčí další kávou.</p>
<h2>Proč zima kazí spánek i bez nespavosti</h2>
<p>Světlo řídí vnitřní hodiny. Když ráno jedete do práce potmě a večer svítíte do obličeje mobilem, mozek dostane zmatečné signály. K tomu se přidá méně pohybu, těžší večeře a víc alkoholu o víkendech. To není „zimní deprese“ u každého. Je to často jen špatně nastavený režim, který jde opravit dřív, než sáhnete po lécích na spaní.</p>
<p>Pokud únava trvá týdny, přidá se nezájem o lidi a ranní těžkost, kterou nespraví spánek, patří věc k praktickému lékaři. Zimní období umí odhalit i anémii, poruchu štítné žlázy nebo depresi.</p>
<h2>Tři úpravy, které mají smysl v paneláku</h2>
<p>První je ranní světlo. I dvacet minut chůze venku po snídani, nebo snídaně u okna, pomáhá nastavit bdělost. Druhá je tma hodinu před spaním: televize v ložnici a telefon u polštáře usínání oddalují. Třetí je stálý čas vstávání včetně soboty. Víkendové přespávání o dvě hodiny rozhazuje pondělí víc než jedna kratší noc.</p>
<ul>
<li>Ložnici větrejte a držte teplotu spíš chladnější než přetopenou.</li>
<li>Kávu po 15. hodině vynechte, pokud usínáte až po půlnoci.</li>
<li>Alkohol „na spaní“ zkracuje hluboký spánek a budí v druhé polovině noci.</li>
</ul>
<h2>Kdy je únava důvodem k vyšetření</h2>
<p>Chrápání s apnoickými pauzami, usínání za volantem, otoky kotníků nebo noční pocení s úbytkem hmotnosti nepatří do kategorie „zima je prostě únavná“. To patří k lékaři. Stejně tak nespavost, která trvá déle než měsíc a zasahuje práci.</p>
<p>Volně prodejné přípravky na spaní bez konzultace jsou v české lékárně snadno dostupné a stejně snadno maskují příčinu. Pokud berete léky na tlak, depresi nebo bolest, zeptejte se lékárníka nebo lékaře dřív, než přidáte další krabičku.</p>
<h2>Krátký zimní režim na pracovní týden</h2>
<p>Vstaňte v pracovní dny ve stejný čas. Hned po probuzení světlo, ne e-mail. Odpoledne deset minut chůze, i kdyby jen kolem bloku. Večer stejné okno usínání, ne „ještě jeden díl“. Když jednou za týden usnete pozdě, nekompenzujte to nedělí do poledne — raději kratší odpolední spánek do 20 minut.</p>
<h2>Topení, jídlo a další české pastičky</h2>
<p>Přetopený panelák suší sliznice a budí žízní v noci. Teplota v ložnici spíš kolem osmnácti než dvaadvaceti stupňů usínání usnadňuje. Těžká večeře po dvaceté druhé hodině, typická po pozdní směně, posouvá usnutí a vrací kyselinu do jícnu. Lepší je menší jídlo dřív a voda na nočním stolku.</p>
<p>Melatonin z drogerie není neškodná vitaminová pastilka. U lidí s posunem směn může pomoct, u jiných rozhazuje ráno. Berte ho jen po radě lékárníka nebo lékaře, zvlášť když užíváte léky na srážlivost nebo depresi. Bylinné čaje s valeriánou u někoho zklidní, u jiného přidají ranní těžkost. Testujte jednu věc týdně, ne celý regál najednou.</p>
<p>Světelná terapie má smysl u sezónní poruchy nálady, ale lampa z e-shopu bez konzultace není diagnóza. Pokud se v listopadu opakovaně hroutíte a na jaře ožíváte, řekněte to praktickému lékaři. Může jít o víc než „jen zimu“.</p>
<h2>Směny, řízení a bezpečnost</h2>
<p>Řidiči, zdravotníci a operátoři po noční směně nemají „dojet na kávě“. Mikrospánek na D1 není charakterová vada. Je to fyziologie. Pokud usínáte na semaforu, nejezděte. Zaměstnavatel v Česku má povinnost řešit bezpečnost; vy máte povinnost nehrát hrdinu.</p>
<h2>Zdroje</h2>
<ul>
<li>NZIP — spánek a režim dne</li>
<li>Česká společnost pro výzkum spánku — hygiena spánku</li>
<li>WHO — pohyb a denní rytmus</li>
</ul>`),
  },

  "verejnost-zivotni-styl-2026-06-24-10-minut-denne-pro-zdravejsi-rodice-jak-ziskat-zpet-kontrolu-nad-svym-telem": {
    title: "Deset minut pohybu pro rodiče, kteří nechodí do posilovny",
    excerpt:
      "Po směně a školní družině nezbývá hodina. Krátký, opakovaný pohyb v bytě nebo po schodech snižuje ztuhlost a drží kondici líp než další odložený start v lednu.",
    content: article(`<p>Rodiče v Česku často cvičení odkládají na „až děti usnou“ a pak usnou sami. Deset minut není trénink na závod. Je to dávka, kterou tělo stihne mezi večeří a koupáním, a která se sčítá, když se opakuje většinu dní v týdnu.</p>
<h2>Proč krátký pohyb není alibismus</h2>
<p>Světová zdravotnická organizace počítá i středně intenzivní aktivitu v krátkých blocích. Pro člověka, který sedí v autě, u počítače a pak u úkolů, je horší nula než deset minut dřepů, chůze do schodů a protažení zad. Cílem není „získat kontrolu nad tělem“. Cílem je udržet sílu, dech a náladu, než se z bolesti zad stane důvod k neschopence.</p>
<p>Kdo má vysoký tlak, bolest na hrudi, neodstoupenou operaci nebo čerstvý porod, má nejdřív mluvit s lékařem. Krátký domácí pohyb není náhrada rehabilitace.</p>
<h2>Sestava, která se vejde mezi plenami</h2>
<p>Minutu choďte na místě nebo do schodů. Pak dvě minuty dřepů k židli, dvě minuty kliků o kuchyňskou linku, dvě minuty prkna na předloktích a tři minuty protažení kyčlí a hrudní páteře. Bez pomůcek, bez hudby, která budí děti. Když zbyde čas, přidejte chůzi s kočárkem kolem bloku — to je pořád pohyb, i když to nevypadá jako trénink.</p>
<ul>
<li>Stejný slot každý den: po snídani, nebo hned po návratu ze školky.</li>
<li>Boty u dveří a podložka srolovaná u rádia snižují tření „kde začít“.</li>
<li>Bolest v kloubu, která se zhoršuje, je důvod přestat — ne „protlačit“.</li>
</ul>
<h2>Co deset minut nespraví</h2>
<p>Nespraví nadváhu za měsíc, nespraví noční směny a nespraví záda, když osm hodin sedíte bez přestávky. Pomáhá ale přerušit sezení, udržet svaly, které drží páteř, a snížit pocit, že na zdraví „není čas“. Kdo zvládne tři bloky denně po deseti minutách, je už blízko doporučenému objemu chůze.</p>
<h2>Kdy jít k lékaři místo další výzvy</h2>
<p>Dušnost v klidu, otoky nohou, bolest na hrudi a závrať při dřepu nepatří do domácího tréninku. Po porodu se vraťte k zátěži až po kontrole, zvlášť po císařském řezu nebo při úniku moči. Praktický lékař a fyzioterapeut jsou v těchto situacích rychlejší cesta než další video.</p>
<h2>Jak to ukotvit v domácnosti, kde nikdy není klid</h2>
<p>Dvě minuty, než se uvaří těstoviny, nejsou alibismus. Jsou to dřepy k lince, zatímco dítě staví kostky. Večerní úklid vysavačem je pohyb, pokud ho nepočítáte jako trest. Schody místo výtahu v paneláku přidají za týden víc, než jedno nedělní „pořádné“ cvičení, které stejně odpadne.</p>
<p>Partner nebo prarodič může hlídat deset minut. To je férovější prosba než „potřebuju hodinu pro sebe“, kterou domácnost uslyší jako luxus. Když jste sami, cvičte, když dítě kouká na jednu pohádku — a netrestejte se za to. Pohyb rodiče je taky péče o dítě.</p>
<p>Zápis do kalendáře vedle školní družiny funguje líp než aplikace s ohněm. Tři křížky v týdnu jsou úspěch. Sedm z deseti dní je už režim. Nula proto, že plán byl „hodina jógy“, je nejčastější český scénář po Novém roce.</p>
<h2>Bolest zad, pánevní dno a další limity</h2>
<p>Opakovaná bolest vystřelující do nohy, brnění a slabost patří k lékaři, ne k hlubšímu předklonu z videa. Po porodu únik moči při dřepu hlásí, že je dřív potřeba fyzioterapie pánevního dna než další série skákání. To není ostuda. Je to mechanika.</p>
<h2>Zdroje</h2>
<ul>
<li>WHO — doporučení k pohybové aktivitě</li>
<li>NZIP — pohyb pro dospělé</li>
<li>Česká fyzioterapeutická společnost — domácí cvičení a bolest zad</li>
</ul>`),
  },

  "verejnost-zivotni-styl-2026-07-04-kognitivni-rezerva-mozek-aktivni-desetileti-pohyb-socialni-vazby-uceni": {
    title: "Kognitivní rezerva: pohyb, lidé a učení, ne zázračný doplněk",
    excerpt:
      "Mozek ve stáří nespasí křížovka ani drahý prášek. V české praxi se opakuje totéž: chůze, krevní tlak, sluch, přátelé a nová dovednost — ideálně včas, ne až po první ztrátě klíčů.",
    content: article(`<p>Kognitivní rezerva je pracovní název pro to, jak dobře mozek snáší stárnutí a drobná poškození. Nestaví se za víkend. Staví se roky z pohybu, vzdělání, práce, vztahů a léčby tlaku, cukrovky a sluchu. Doplněk z reklamy to nenahradí.</p>
<h2>Co rezerva je a co není</h2>
<p>Není to slib, že demence nepřijde. Je to polštář: při stejném nálezu na zobrazení může jeden člověk zůstat samostatný a druhý potřebovat péči. Pozorování z Evropy i Česka se shodují v hrubých rysech. Pomáhá pravidelný pohyb, léčba cévních rizik, korekce sluchu, nekouření a život, ve kterém se ještě učíte a potkáváte lidi.</p>
<p>Křížovka sama o sobě rezervu nepostaví, pokud zbytek dne sedíte, pijete a nemluvíte s nikým. Ani „trénink mozku“ v telefonu nenahradí chůzi do kopce a sbor, kroužek nebo brigádu.</p>
<h2>České minimum, které má smysl po padesátce</h2>
<p>Změřte si tlak a nechte si zkontrolovat cukr a cholesterol u praktického lékaře. Nedoslýchavost řešte dřív, než se stáhnete z rozhovorů — izolace rezervu snižuje. Choďte tak, abyste se zadýchali, ale ještě mohli mluvit. Přidejte jednu věc, kterou neumíte: jazyk, nástroj, tanec, řemeslo. Opakování známého kvízu nestačí.</p>
<ul>
<li>Kontrola sluchu a zraku patří k prevenci paměti, ne jen k pohodlí.</li>
<li>Pád a úraz hlavy rezervu berou — domácnost zbavte kluzkých předložek.</li>
<li>Alkohol „na rozpustilost“ ve vyšším věku zhoršuje spánek i rovnováhu.</li>
</ul>
<h2>Kdy je zapomínání důvodem k vyšetření</h2>
<p>Občasné hledání jména není diagnóza. Důvod k lékaři je, když se ztrácí v dobře známé cestě, opakuje stejnou otázku, nezvládá finance nebo se mění povaha. Rodina to pozná dřív než člověk sám. Praktický lékař vyloučí léky, depresi, infekci a rozhodne o dalším vyšetření.</p>
<p>Nekupujte „nootropika“ z e-shopu místo vyšetření. Některé přípravky interagují s léky na tlak a srážlivost.</p>
<h2>Týden, který rezervu skutečně živí</h2>
<p>Tři delší procházky, jedna návštěva nebo telefonát, který není jen vyřizování, a jedna hodina nové dovednosti. To je realističtější plán než „deset let ideálního života“. Začněte letos. Rezerva se neukládá zpětně z předsevzetí.</p>
<h2>Cévy, sluch a další „nenápadné“ páky</h2>
<p>Neléčený tlak a cukrovka berou rezervu tiše. Praktický lékař v Česku umí nastavit léky a kontroly; vy musíte přijít. To samé platí pro fibrilaci síní — nepravidelný tep a dušnost nepatří k „věku“. Sluchadlo není marnivost. Když neslyšíte stůl, přestanete na stůl chodit, a izolace rezervu sežere rychleji než špatný kvíz.</p>
<p>Kouření a pasivní kouř v kuchyni jsou stále časté. Přestat v šedesáti má smysl. Není to kázání. Je to aritmetika cév. Totéž u pohybu: chůze s holemi po sídlišti není trapná. Je to dostupný trénink bez členského.</p>
<p>Doplňky „pro mozek“ s nejasným složením zatěžují ledviny a peněženku. Omega-3 z ryby dvakrát týdně nebo z konzervy je srozumitelnější než prášek s anglickým názvem. Vitamin D v zimě řešte s lékařem podle hladiny, ne podle dávky z reklamy.</p>
<h2>Práce, důchod a ztráta rytmu</h2>
<p>Odchod do důchodu umí sebrat denní strukturu. Kdo měl práci plnou lidí, najednou zůstane v bytě. Rezerva padá s kalendářem. Dobrovolnictví, univerzita třetího věku, sbor nebo hlídání vnoučat na kratší bloky drží rytmus líp než televize od rána. Pokud se po odchodu z práce za tři měsíce zavřete doma, řekněte to lékaři. Může jít o depresi, ne o „zasloužený odpočinek“.</p>
<h2>Zdroje</h2>
<ul>
<li>Lancet Commission — ovlivnitelné rizikové faktory demence</li>
<li>NZIP — paměť a stárnutí</li>
<li>Česká alzheimerovská společnost — včasné vyšetření</li>
</ul>`),
  },

  "verejnost-nemoci-2026-06-24-jaro-v-plnem-kvetu-jak-se-pripravit-na-sezonni-alergie-a-uzit-si-teple-mesice": {
    title: "Pylová sezóna: jak zvládnout alergickou rýmu, než začne kvést tráva",
    excerpt:
      "Svědění očí a vodnatá rýma na jaře nejsou „jen nachlazení“. V Česku rozhoduje pylový zpravodaj, včasné antihistaminikum a lékař, když se přidá dušnost.",
    content: article(`<p>Sezónní alergická rýma v Česku začíná často už s lískou a olší, dlouho před tím, než lidé otevřou okna „na jaro“. Kdo každý rok v dubnu otéká v očích a kýchá v tramvaji, nemá čekat na první mráčkové ráno. Má mít plán dřív, než vyjde tráva.</p>
<h2>Jak odlišit alergii od nachlazení</h2>
<p>Alergie svědí. Nos teče vodově, oči pálí, kýchání jde v sériích, horečka chybí. Nachlazení bolí v krku, často přidá teplotu a za pár dní se mění. Když se stejné potíže vrací každý rok ve stejném týdnu, je to silný argument pro alergii — potvrdí ji lékař, ne aplikace.</p>
<p>Astma, tlak na hrudi a pískoty při výdechu už nejsou „jen rýma“. Patří k praktickému lékaři nebo alergologovi, při dušnosti v klidu na 155.</p>
<h2>Co zkusit dřív, než sezóna vrcholí</h2>
<p>Sledujte pylový zpravodaj SZÚ nebo ČHMÚ a v silné dny sušte prádlo uvnitř, po návratu se osprchujte a nenechávejte v ložnici svršky zvenku. Antihistaminikum druhé generace se často bere pravidelně, ne až když otečete v práci. Očné kapky a nosní kortikoid doporučí lékař nebo lékárník podle toho, co už berete.</p>
<ul>
<li>Nezačínejte v sezóně s novým „přírodním“ přípravkem místo osvědčeného léku.</li>
<li>Pokud antihistaminikum tlačí na únavu za volantem, řešte změnu s lékařem.</li>
<li>Děti s opakovanými nočními kašli po pylu patří k pediatrovi, ne na další výplach.</li>
</ul>
<h2>Kdy má smysl alergolog</h2>
<p>Když potíže kazí spánek, školu nebo práci, když nestačí volně prodejný lék, nebo když je v rodině astma. Alergolog rozhodne o testech a o tom, zda připadá v úvahu alergenová imunoterapie. Ta se nezačíná v týdnu, kdy už kvete všechno kolem sídliště.</p>
<p>Potravinové „očisty“ a vyloučení mléka bez důvodu alergickou rýmu nespraví. Zbytečná dieta jen přidá práci rodičům.</p>
<h2>Byt, auto a škola v pylové špičce</h2>
<p>Větrejte ráno po krátkém dešti, ne v poledne při větru. V autě zapněte recirkulaci na dálnici lemované trávou. Ve škole má smysl říct učiteli, že dítě bere lék a že po tělocviku venku potřebuje umýt ruce a obličej. To není rozmazlenost. Je to hygiena alergenu.</p>
<p>Klimatizace s ucpaným filtrem alergikovi nepomůže. Filtr se mění, ne jen „ofoukne“. Stejně tak vysavač bez filtru v domácnosti s kočkou a pylem. Koberce v ložnici v sezóně často horší než plovoucí podlaha, kterou utřete.</p>
<p>Kontaktní čočky v pylové špičce svědění očí zhoršují. Brýle a kapky doporučené lékárníkem bývají klidnější volba. Když oko otéká tak, že nejde otevřít, jděte k lékaři — může jít o víc než rýmu.</p>
<h2>Astma, anafylaxe a hranice samoléčby</h2>
<p>Alergická rýma a astma se potkávají. Úlevový inhalátor se nepoužívá podle nálady souseda. Má rozpis. Otok jazyka, kopřivka po bodnutí a dušnost po jídle jsou jiná diagnóza — anafylaxe. Tam patří pohotovost a předepsaný adrenalin, ne další antihistaminikum z kabelky.</p>
<h2>Zdroje</h2>
<ul>
<li>SZÚ — pylová informační služba</li>
<li>Česká společnost alergologie a klinické imunologie</li>
<li>NZIP — alergická rýma</li>
</ul>`),
  },

  "verejnost-nemoci-2026-06-24-chripka-nebo-nachlazeni-jak-rozlisit-tyto-dva-caste-nemoci": {
    title: "Chřipka, nebo nachlazení: jak je rozeznat a kdy zůstat doma",
    excerpt:
      "Nachlazení začíná postupně a bolí v krku. Chřipka přijde náhle, s horečkou a bolestí svalů. V Česku rozhoduje stav rizikových skupin a to, zda se člověk vůbec postaví.",
    content: article(`<p>V čekárně praktického lékaře se na podzim míchají rýmy, chřipky a další virózy. Rozlišení není akademická hra. Rozhoduje, kdo může zůstat v režimu čaje a kdo patří k lékaři dřív, protože je starší, těhotná, po chemoterapii nebo má těžké srdce.</p>
<h2>Jak se liší začátek</h2>
<p>Nachlazení se plíží: škrábání v krku, rýma, kýchání, teplota spíš nízká. Člověk většinou zvládne jídlo a krátkou chůzi. Chřipka padá: během hodin přijde horečka, třesavka, bolest hlavy a svalů, suchý kašel a pocit, že tělo neposlouchá. Únava po chřipce umí trvat dny i po poklesu teploty.</p>
<p>Covid-19 a další respirační viry se s oběma překrývají. Proto se u rizikových pacientů rozhoduje podle závažnosti a testu, ne podle dojmu z titulku.</p>
<h2>Kdo má jít k lékaři dřív</h2>
<p>Senioři, těhotné, lidé s astmatem, cukrovkou, závažným srdečním onemocněním a poruchou imunity nemají čekat, až „přežene rýma“, když mají horečku a dušnost. U dětí rozhoduje pediatr při vysoké horečce u kojka, při ztíženém pití a při vtažených mezižebřích.</p>
<ul>
<li>Dušnost, bolest na hrudi, zmatenost a modré rty — 155, ne čekárna.</li>
<li>Horečka, která po třech dnech neklesá, patří k praktickému lékaři.</li>
<li>Antibiotika vir neničí. Berou se jen při potvrzené bakteriální komplikaci.</li>
</ul>
<h2>Režim, který skutečně zkracuje nákazu okolí</h2>
<p>Zůstaňte doma, dokud máte horečku a výrazný kašel. Rouška v MHD a v ordinaci chrání druhé. Ruce, vlastní ručník, větrání. Paracetamol nebo ibuprofen podle příbalového letáku a věku, dostatek tekutin. Děti bez porady s lékařem nedostávají kyselinu acetylsalicylovou.</p>
<p>Očkování proti chřipce každé podzim neslibuje, že neonemocníte. Snižuje ale těžký průběh u těch, kteří ho nejvíc potřebují. Termín u praktického lékaře je v Česku běžnější než hon na poslední volné místo v listopadu.</p>
<h2>Domácnost, práce a návrat do kolektivu</h2>
<p>Do školky a kanceláře se nevrací ten, kdo má horečku a potí se u stolu. Kolektiv to pozná a virus se tam otočí. Rouška v MHD po odeznění horečky ještě den dva snižuje kašlání do cizího obličeje. Vlastní hrnek a větrání v open space nejsou móda. Jsou to drobnosti, které v sezóně rozhodují.</p>
<p>Děti s rýmou bez horečky často můžou do školky podle provozního řádu, ale kašlající kojk s teplotou ne. Zeptejte se pediatra, ne skupiny rodičů. U seniorů v jedné domácnosti s vnoučaty platí opatrnost: krátká návštěva bez objetí u horečky je laskavost, ne chlad.</p>
<p>Po chřipce se lidé vrací do posilovny brzy a omdlí u dřepu. Týden po horečce jen chůze. Srdce po viróze není téma pro hrdinství. Pokud dušnost nebo tlak na hrudi přetrvávají, jděte k lékaři dřív, než přidáte kilometry.</p>
<h2>Léky ve skříňce, které škodí</h2>
<p>Kombinace dvou přípravků s paracetamolem je v Česku častá chyba. Čtěte složení „proti rýmě“. Ibuprofen u lidí s vředem, špatnými ledvinami nebo některými léky na srdce nepatří k samoléčbě. Těhotné a kojci mají vlastní pravidla — lékárna, ne zbylá krabička po dědečkovi.</p>
<h2>Zdroje</h2>
<ul>
<li>SZÚ — chřipka a respirační nákazy</li>
<li>NZIP — chřipka a nachlazení</li>
<li>ECDC — sezónní influenza</li>
</ul>`),
  },

  "verejnost-prevence-2026-07-02-screening-rakoviny-co-je-dostupne-v-cesku-prevence-bez-zbytecneho-straseni": {
    title: "Screening rakoviny v Česku: které programy jsou hrazené a k čemu jsou",
    excerpt:
      "Mamografie, test na krev ve stolici a stěr z děložního hrdla nejsou diagnostika „pro jistotu“. Jsou to organizované programy s věkem a intervalem — a s jasným dalším krokem, když vyjde odchylka.",
    content: article(`<p>Česko má organizované screeningy několika nádorů. Nejde o to, vystrašit se titulkem. Jde o to vědět, od jakého věku má smysl pozvánka, co vyšetření umí a co ne, a kam jít, když výsledek není v pořádku.</p>
<h2>Co screening je a co není</h2>
<p>Screening hledá nemoc u člověka bez potíží. Proto má přesná pravidla. Není to náhrada vyšetření, když krvácíte, hubnete, nebo máte hmatnou bulku. V takovém případě jdete k lékaři ihned, i když jste „právě byli na screeningu“.</p>
<p>Falešně pozitivní výsledek existuje. Znamená to další vyšetření, ne diagnózu. Falešně negativní také — proto se intervaly dodržují a potíže se neignorují.</p>
<h2>Hlavní programy, na které se v praxi ptáte</h2>
<p>Screening rakoviny prsu probíhá mamografií v akreditovaných centrech u žen v určeném věkovém rozmezí, obvykle ve dvouletém intervalu. Screening koloreta začíná v dospělosti testem okultního krvácení nebo kolonoskopií podle pravidel programu. Screening rakoviny děložního hrdla je vázaný na cytologii a návštěvy gynekologa. O přesném věku a úhradě rozhoduje aktuální metodika — ověřte ji u praktického lékaře, gynekologa nebo na stránkách programu.</p>
<ul>
<li>Pozvánku nenechávejte ležet v šuplíku proto, že „nic vás nebolí“. To je právě smysl screeningu.</li>
<li>Výsledek si vyzvedněte. Nález bez dalšího kroku screening neukončuje.</li>
<li>Rodinná zátěž v mladém věku patří ke specialistovi, ne jen do běžného intervalu.</li>
</ul>
<h2>Jak se nenechat vystrašit ani uklidnit falešně</h2>
<p>Internetové „tumormarkery z krve pro jistotu“ nejsou náhradou organizovaného screeningu. Ani celotělové CT bez indikace. Zbytečné záření a falešné nálezy škodí. Naopak odklad kolonoskopie po pozitivním testu ze strachu je častá chyba. Sedace a dnešní příprava jsou jiné než historky z 90. let.</p>
<h2>Praktický postup na měsíc</h2>
<p>Zjistěte u praktického lékaře, které programy se vás týkají. Objednejte chybějící termín. Zeptejte se, kam přijde výsledek. Pokud máte potíže teď — krev ve stolici, bulky, nepravidelné krvácení — nečekejte na pozvánku.</p>
<h2>Jak číst výsledek bez paniky</h2>
<p>„Doplňující vyšetření“ není rozsudek. Znamená, že obraz nebo test nebyl jednoznačný. Zeptejte se, do kdy máte termín a kdo volá, když se termín neozve. V Česku se výsledky občas ztratí mezi pracovišti. Jeden telefon za týden je legitimní, ne otravování.</p>
<p>Pokud vás zvou na biopsii nebo kolonoskopii, zeptejte se na přípravu, léky na ředění krve a odvoz. Nejezděte sami, když dostanete sedaci. Napište seznam léků. Alergie na jód a kontrast řekněte nahlas, i když „to přece vědí z karty“.</p>
<p>Druhý názor má smysl u nejasného nálezu a u rozhodnutí o operaci. Nemá smysl u odkladu kvůli strachu z internetových fór. Fórum nevidí vaše snímky.</p>
<h2>Rodina, genetika a věk mimo tabulku</h2>
<p>Rakovina prsu u matky v pětatřiceti, nádor tlustého střeva u otce před padesátkou nebo více případů v jedné linii patří na genetickou konzultaci, kterou doporučí onkolog nebo praktický lékař. Intervaly pak můžou být jiné než u populace. To není důvod ke každoročnímu celotělovému skenu. Je to důvod k cílenému plánu.</p>
<p>Muži se screeningů často neúčastní, protože „to je na ženy“. Kolorektum a kůže se jich týkají stejně. Praktický lékař umí vysvětlit, co je hrazené. Stud není diagnostická metoda.</p>
<h2>Zdroje</h2>
<ul>
<li>Národní screeningové centrum ÚZIS — programy v ČR</li>
<li>MZČR — onkologický screening</li>
<li>NZIP — prevence nádorových onemocnění</li>
</ul>`),
  },

  "verejnost-nemoci-2026-07-02-dychaci-potize-u-deti-kdy-je-cas-zavolat-pediatra": {
    title: "Dýchací potíže u dětí: kdy stačí pediatr a kdy volat 155",
    excerpt:
      "Rýma s kašlem je v jeslích běžná. Vtažená mezižebří, pískot, odmítání pití nebo dítě, které nechce ležet, už patří k okamžitému rozhodnutí — ne k dalšímu čekání do rána.",
    content: article(`<p>Respirační infekce u dětí plní české ambulance od podzimu do jara. Většina skončí režimem a kontrolou pediatra. Část ale potřebuje kyslík nebo nemocnici. Rodina rozhoduje podle toho, jak dítě dýchá, pije a reaguje — ne podle barvy hlenu na fotce ve skupině rodičů.</p>
<h2>Známky, které počkají do ordinace</h2>
<p>Hlen, kašel, teplota, dítě si hraje a pije, i když je mrzuté. To je obvykle důvod k pediatrovi v běžné době, k hydrataci a ke kontrole, pokud se stav táhne. U kojků do tří měsíců je horečka vždy důvod k rychlému kontaktu s lékařem, i bez dušnosti.</p>
<h2>Známky, které nečekají</h2>
<p>Vtažená kůže mezi žebry, sípání slyšitelné bez fonendoskopu, zastavení na slovo, modré rty, apatie, křeče, méně než polovina obvyklých plen nasucho, nebo dítě, které odmítá pít a zvrací všechno. To je 155. Stejně tak, když máte pocit, že „tohle už není naše dítě“ — rodičovský dojem je v pediatrii cenný údaj.</p>
<ul>
<li>Počítat dechy u spícího dítěte umí naučit pediatr; vysoká dechová frekvence v klidu je varování.</li>
<li>U štěkavého kašle s potížemi při nádechu myslete na subglotickou laryngitidu a jděte po urgentní lince.</li>
<li>Inhalace v domácích podmínkách bez rozpisu od lékaře u dušného dítěte nestačí.</li>
</ul>
<h2>Co dělat do příjezdu záchranky</h2>
<p>Posaďte dítě, uvolněte oblečení, necpěte jídlo. U kojka ho držte vzpřímeně. Nepište do skupin. Pokud dítě ztratí vědomí, dispečer 155 vede resuscitaci. Otevřené okno „pro vzduch“ stav samo nespraví, ale klid rodiče ano.</p>
<h2>Prevence, která není zbytečná</h2>
<p>Očkování podle kalendáře, kouř mimo byt, mytí rukou, dítě s horečkou nenechávat ve školce. U předčasně narozených a dětí s vrozenou vadou srdce se ptejte pediatra na sezónní ochranu proti závažným virům. Antibiotika na každý kašel nepatří — zhoršují odolnost a neřeší virus.</p>
<h2>Jak popsat stav do telefonu, aby lékař rozhodl</h2>
<p>Řekněte věk, teplotu, jak pije, kolik plen za dvanáct hodin, zda jsou vtažená mezižebří a jestli dítě reaguje na hlas. „Je nějak divné“ nestačí, ale „neusměje se, leží a dýchá rychle“ stačí. Nahrávka dechu v telefonu pediatrovi někdy pomůže víc než odhad.</p>
<p>Léky, které dítě dostalo, vyjmenujte včetně kapek a čípku. Dvojitá dávka paracetamolu z dvou sirupů je častá chyba. Pište časy na papír. U kojků měřte teplotu tak, jak vás naučil pediatr — ne každý teploměr z drogerie měří stejně.</p>
<p>Noční kašel, který dítě posadí a zklidní se v páře koupelny, bývá u starších dětí laryngitida. Pokud se neklidní, nebo je dítě malé, neexperimentujte s opakovaným sprchováním. Volejte.</p>
<h2>Školka, sourozenci a návrat</h2>
<p>Zelený hlen není automaticky antibiotikum. Návrat do školky po horečce řešte s pediatrem a provozním řádem. Sourozenec bez potíží nemusí zůstat doma „pro jistotu“, ale umýt ruce a nesdílet lahve ano. Kouř v bytě po viróze prodlužuje kašel — to je jedna z mála rad, která platí skoro vždy.</p>
<h2>Zdroje</h2>
<ul>
<li>Česká pediatrická společnost — doporučení k horečce a dušnosti</li>
<li>NZIP — péče o nemocné dítě</li>
<li>Zdravotnická záchranná služba — tísňová linka 155</li>
</ul>`),
  },

  "verejnost-zivotni-styl-2026-07-02-stres-z-prace-jak-dechova-cviceni-a-rezim-dne-mohou-pomoci": {
    title: "Stres ze směny: dech a režim, které unesou český pracovní den",
    excerpt:
      "Tlak na hrudi po poradě nemusí být infarkt, ale ignorovat ho také nelze. Krátký dechový nácvik, pauza na jídlo a hranice přesčasů snižují tenzi. Trvající bolest na hrudi patří k lékaři.",
    content: article(`<p>V českých provozech i kancelářích se stres měří přesčasy, dojížděním a nočními směnami. Tělo odpovídá svalovým napětím, mělkým dechem a špatným spánkem. Dechové cvičení není terapie na vyhoření. Je to nástroj, jak sundat první vrstvu tenze, než se z ní stane neschopenka nebo hádka doma.</p>
<h2>Kdy je stres ještě režim a kdy už medicína</h2>
<p>Občasný tlak před termínem je běžný. Denní bušení srdce, nespavost, alkohol jako jediný spínač klidu a myšlenky, že práci nezvládnete, patří k praktickému lékaři. Bolest na hrudi, dušnost a bolest do levé paže se neřeší dýcháním do sáčku. Řeší se 155, dokud lékař neřekne opak.</p>
<p>Imunitu stres „neničí“ jako v reklamě. Horší spánek, méně pohybu a víc cigaret ale opravdu zvyšují počet neschopenek. To je praktický důvod režim měnit.</p>
<h2>Dech, který se vejde na záchod v práci</h2>
<p>Čtyři vteřiny nádech nosem, šest vteřin výdech ústy, šest cyklů. Ramena dolů, jazyk od patra. Opakujte dvakrát denně a jednou po konfliktu. Není to meditace na horách. Je to návrat z mělkého dechu, který drží tělo v poplachu.</p>
<ul>
<li>Pauza na jídlo mimo obrazovku snižuje odpolední náraz na sladké a kávu.</li>
<li>Po noční směně neřiďte, pokud usínáte na semaforu — to je bezpečnost, ne slabost.</li>
<li>Sobotní dohánění e-mailů bere neděli víc než jedna kratší směna v týdnu.</li>
</ul>
<h2>Režim, který neslibuje work-life balance</h2>
<p>Stanovte čas, kdy telefon jde do jiné místnosti. Jednou týdně pohyb, který zvedne tep. Jednou týdně rozhovor, který není o práci. Pokud vedoucí mění rozpis každý den a vy přestáváte spát, je to téma pro lékaře a pro zákoník práce, ne pro další aplikaci na vděčnost.</p>
<h2>Směny, dojíždění a alkohol jako falešný ventil</h2>
<p>Hodina v autě po dvanáctihodinové směně je další směna pro nervový systém. Když je to možné, rozdělte cestu chůzí od zastávky. Když není, aspoň deset minut před vstupem domů — obejít blok, ne rovnou hádka o nádobí. Děti to poznají. Partner také.</p>
<p>Pivo „na vypnutí“ po noční směně kazí spánek, který už je stejně krátký. Stejně tak prášek po kolegovi. Praktický lékař má slyšet pravdu o alkoholu a tabletách, ne verzi pro potvrzení. Jinak předepíše něco, co se s tím bije.</p>
<p>Odbory a inspekce práce existují i ve zdravotnictví a ve fabrice. Pokud rozpis porušuje odpočinek mezi směnami a vy usínáte za volantem, je to bezpečnost práce. Neschopenka není jediný nástroj. Není ale ostuda, když ji lékař napíše, protože tělo už neskládá věty.</p>
<h2>Kdy nestačí dech a je čas na neschopenku</h2>
<p>Když se ráno budíte s hrůzou, pláčete na záchodě v práci, nebo neudržíte pozornost u stroje, dechové cvičení je málo. Jděte k praktickému lékaři. Vyhoření, úzkost a deprese se v Česku léčí. Čekání na dovolenou v srpnu stav v březnu nespraví.</p>
<h2>Zdroje</h2>
<ul>
<li>NZIP — stres a duševní hygiena</li>
<li>SZÚ — pracovní zátěž a zdraví</li>
<li>WHO — duševní zdraví na pracovišti</li>
</ul>`),
  },

  // Card-only polish for other live listing duplicates
  "verejnost-prevence-2026-06-24-kdy-vyhledat-odbornou-pomoc-mentalni-prevence-a-dusevni-pohoda": {
    title: "Signály, že duševní stav už není jen únava po směně",
    excerpt:
      "Když se nespavost, stažení od lidí nebo ztráta chuti táhnou týdny, patří první krok praktickému lékaři. Krizové myšlenky nečekají na termín — to je 155.",
  },
  "verejnost-zivotni-styl-2026-07-02-10-minut-denne-jak-zaneprazdneni-rodice-mohou-zustat-fit-bez-posilovny": {
    title: "Krátký pohyb mezi školkou a večeří, bez posilovny",
    excerpt:
      "Tři bloky po deseti minutách chůze do schodů a dřepů k židli udrží záda a dech líp než odložený start „až bude čas“.",
  },
  "verejnost-nemoci-2026-07-02-jaro-v-plnem-rozkvetu-jak-se-ucinne-branit-sezonnim-alergiim": {
    title: "Pylová sezóna: co stihnout, než začne kvést tráva",
    excerpt:
      "Sledujte pylový zpravodaj, sušte prádlo uvnitř a antihistaminikum berte podle rozpisu — ne až když otečete v tramvaji.",
  },
  "verejnost-prevence-2026-07-02-dusevni-pohoda-kdyz-je-cas-vyhledat-pomoc": {
    title: "Kdy stačí rozhovor a kdy je čas na psychiatrii",
    excerpt:
      "Praktický lékař umí vyloučit tělesnou příčinu a nasměrovat dál. Myšlenky na ublížení sobě patří na tísňovou linku, ne do dalšího týdne čekání.",
  },
  "verejnost-prevence-2026-07-02-prevence-osteoporozy-u-zen-i-muzu-vapnik-vitamin-d-pohyb": {
    title: "Kosti ve středním věku: pohyb, pád a vitamin D — ne jen vápník v reklamě",
    excerpt:
      "Osteoporóza se týká žen i mužů. Rozhoduje síla, rovnováha, kouření a to, zda po zápěstí nebo obratli přijde denzitometrie.",
  },
  "verejnost-rozhovory-2026-07-02-cesta-zpet-k-zivotu-jak-se-vratit-k-aktivnimu-zivotu-po-infarktu": {
    title: "Po infarktu: první týdny návratu, ne hrdinský trénink",
    excerpt:
      "Kardiorehabilitace, léky a postupná chůze rozhodují víc než slib, že budete jako dřív. Bolest na hrudi při zátěži patří k lékaři ihned.",
  },
  "verejnost-zivotni-styl-2026-07-02-10-minut-denne-pro-zdravejsi-vas-jak-zaneprazdneni-rodice-mohou-zustat-aktivni": {
    title: "Mikrotrénink, který se vejde do školního rána",
    excerpt:
      "Deset minut před odchodem do školy: schody, dřep k židli, protažení hrudníku. Opakování počítá víc než ideální plán na neděli.",
  },
  "verejnost-zivotni-styl-2026-07-02-jak-stres-z-prace-nici-imunitu-5-dechovych-cviceni-ktera-vam-pomohou": {
    title: "Pět dechových cyklů po směně — a kdy to nestačí",
    excerpt:
      "Krátký výdech delší než nádech umí sundat tenzi. Trvající nespavost, alkohol jako spínač klidu nebo bolest na hrudi patří k lékaři.",
  },
  "verejnost-zivotni-styl-2026-07-02-pit-pit-pit-myty-o-hydrataci-v-chladnem-pocasi": {
    title: "Zimní pití: žízeň lže, moč a rty nelžou",
    excerpt:
      "V česku v zimě lidé pijí méně, protože není horko. Čaj a voda po malých dávkách stačí. Slazené ionťáky kancelář nahradit nemusí.",
  },
  "verejnost-nemoci-2026-07-02-jaro-v-plnem-kvetu-jak-se-pripravit-na-sezonni-alergie": {
    title: "Alergická rýma versus jarní nachlazení",
    excerpt:
      "Svědění očí a vodnatá rýma bez horečky hlásí spíš pyl. Horečka a bolest v krku hlásí infekci. Dušnost neřešte kapkami z e-shopu.",
  },
  "verejnost-nemoci-2026-07-02-kdy-volat-pediatra-respiracni-infekce-u-deti-co-hledat-a-jak-reagovat": {
    title: "Kašel u dítěte: co hledat, než zvednete telefon pediatrovi",
    excerpt:
      "Hra a pití obvykle počkají do ambulance. Vtažená mezižebří, apatie nebo kojk s horečkou nečekají na ráno.",
  },
  "verejnost-nemoci-2026-07-02-chripka-versus-nachlazeni-jak-rozlisit-a-co-delat": {
    title: "Chřipka versus nachlazení: kdo zůstane doma a kdo jde k lékaři",
    excerpt:
      "Náhlá horečka a bolest svalů svědčí pro chřipku. Rýma bez pádu stavu pro nachlazení. Rizikové skupiny nečekají na čtvrtý den.",
  },
  "verejnost-nemoci-2026-07-02-bolesti-hlavy-rozpoznani-cervenych-a-zelenych-signalu": {
    title: "Bolest hlavy: kdy stačí režim a kdy je to červený prapor",
    excerpt:
      "Známá migréna s obvyklým průběhem je jiná situace než náhlá, nejhorší bolest života, ztuhlá šíje nebo nová bolest po úrazu.",
  },
  "verejnost-prevence-2026-07-02-dusevni-pohoda-kdy-je-cas-vyhledat-pomoc": {
    title: "První kroky, když se úzkost nebo nálada vleče",
    excerpt:
      "Zapište si, co se změnilo ve spánku a jídle, a jděte k praktickému lékaři. Krizovou linku použijte dřív, než se stav zlomí.",
  },
  "verejnost-prevence-2026-07-02-rakovina-v-predstihu-co-je-dostupne-v-cesku": {
    title: "Onkologický screening: pozvánka, věk a co dělat s odchylkou",
    excerpt:
      "Hrazené programy v Česku mají interval a další krok. Potíže jako krev ve stolici nebo bulka nečekají na další pozvánku.",
  },
};
