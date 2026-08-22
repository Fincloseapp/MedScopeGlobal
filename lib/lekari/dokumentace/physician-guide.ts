/** Canonical Czech physician guide: workflow, sync, copy, integration, recording law. */
export const PHYSICIAN_GUIDE = {
  title: "Návod pro lékaře",
  subtitle:
    "Jednoduchý postup: jak MeDiktor stáhnout, jak s ním pracovat, kdy se zápis uloží do účtu, jak ho zkopírovat do vašeho software a co říct pacientovi před nahrávkou.",

  workflow: {
    title: "Celkový postup práce",
    intro: "Od stažení k zápisu v NIS — v bodech.",
    steps: [
      {
        n: 1,
        title: "Stáhněte aplikaci na plochu",
        text: "Telefon i PC: otevřete medscopeglobal.com/mediktor → „Nainstalovat MeDiktor na plochu“. iPhone jen v Safari (Sdílet → Přidat na plochu). Android Chrome: ⋮ → Nainstalovat. PC Chrome/Edge: zelené tlačítko, nebo ikona ⊕ v adresním řádku.",
      },
      {
        n: 2,
        title: "Přihlaste se",
        text: "E-mail → ověřovací kód (bez hesla). Stejný účet na mobilu i na počítači. Ověření lékaře je volitelné — diktovat můžete hned.",
      },
      {
        n: 3,
        title: "Vyberte režim",
        text: "Diktát — nahráváte sami po vyšetření (pacient u toho být nemusí). Konzultace — nahráváte rozhovor s pacientem; nejdřív ho informujte (věta níže).",
      },
      {
        n: 4,
        title: "Povolte mikrofon a nahrajte",
        text: "Klepněte na mikrofon → povolte přístup v telefonu/PC → mluvte → Stop a zpracovat. Až 60 minut (automaticky po 2 min úsecích).",
      },
      {
        n: 5,
        title: "Zkontrolujte návrh",
        text: "MeDiktor připraví strukturovaný zápis. Upravte ho. Odpovědnost za obsah má vždy lékař — AI je asistent, ne diagnóza.",
      },
      {
        n: 6,
        title: "Uložte / zkopírujte / pošlete do SW",
        text: "Zápis se automaticky uloží do vašeho účtu. Pak ho zkopírujete, stáhnete jako Word (.docx) nebo PDF, nebo se odešle do napojeného software (pokud jste propojení zapnuli).",
      },
    ],
  },

  download: {
    title: "Stažení a instalace",
    items: [
      "Otevřete https://medscopeglobal.com/mediktor/stahnout",
      "Klepněte na „Nainstalovat MeDiktor na plochu“ — ikona MeD se objeví na ploše / v nabídce Start.",
      "QR na stránce MeDiktor naskenujte telefonem, pokud instalujete z počítače na mobil.",
      "App Store a Google Play zatím nejsou; instalace je webová aplikace (PWA), chová se jako běžná ikona.",
    ],
  },

  daily: {
    title: "Běžný den v ordinaci",
    items: [
      "Po vyšetření (nebo během konzultace po informování pacienta) otevřete MeDiktor z plochy.",
      "Zvolte šablonu (anamnéza, kontrola, propouštěcí zpráva…).",
      "Nahrajte → počkejte na zápis → rychle upravte.",
      "Zkopírujte do ambulantního nebo nemocničního programu, nebo nechte automatické odeslání, pokud je zapnuté.",
      "Stejný zápis najdete v záložce Historie na mobilu i na PC.",
    ],
  },

  sync: {
    title: "Kdy a jak se data přenášejí do účtu",
    items: [
      "Audio: do účtu se neukládá. Slouží jen k vytvoření textu a po zpracování se zahodí.",
      "Text zápisu: uloží se do vašeho účtu MedScopeGlobal hned po úspěšném zpracování (stav „Uloženo v účtu“).",
      "Historie: záložka Historie v aplikaci = stejné zápisy na mobilu i na PC pod stejným e-mailem.",
      "Offline: bez sítě se zápis nepřepíše ani neuloží. Pošlete nahrávku, až budete online.",
      "Propojený SW: pokud máte zapnutý webhook / API / HL7 / FHIR, text se po uložení zkusí odeslat i do vašeho systému. Výsledek uvidíte u zápisu.",
      "Do účtu se neposílá nahrávka rozhovoru jako soubor — jen výsledný text (a dočasný přepis pro úpravu).",
    ],
  },

  copy: {
    title: "Jak zápis zkopírovat do dokumentace",
    items: [
      "Tlačítko Kopírovat u klinického zápisu — vložíte Ctrl+V / dlouhé stisknutí do NIS, ambulantního PC nebo Wordu.",
      "Tlačítko Word — stáhne soubor .docx otevřitelný ve Wordu / LibreOffice.",
      "Tlačítko PDF — stáhne stejný zápis ve formátu PDF (sekce 1–10, souhlas GDPR, podpis).",
      "Sdílet — na telefonu nabídne odeslání souboru nebo textu (e-mail, Úschovna zařízení…).",
      "Historie → otevřete starší zápis → znovu Kopírovat / Word / PDF / Sdílet.",
      "Vložení do programu lékaře: klikněte do pole dokumentace a vložte text. U režimu Kopírovat není potřeba žádný speciální ovladač.",
    ],
  },

  integration: {
    title: "Automatické napojení na software, který používáte",
    intro:
      "Nemusíte nic napojovat — kopírování stačí. Automatika je volitelná, až to vaše IT dovolí.",
    paths: [
      {
        title: "A. Ruční (nejčastější, hned)",
        text: "Kopírovat, Word nebo PDF → vložit do ambulantního programu / NIS. Žádné nastavení.",
      },
      {
        title: "B. Webhook / API",
        text: "V záložce Účet (nebo při prvním spuštění) zvolte Webhook / API a zadejte HTTPS adresu, kterou vám dá IT (např. https://vas-system.cz/webhook). Po každém uloženém zápisu MeDiktor pošle JSON (text zápisu, název, čas). Autorizace: Bearer token, pokud ho IT zadá.",
      },
      {
        title: "C. HL7 / FHIR",
        text: "Vyberte HL7 nebo FHIR R4 jako typ propojení a cílový systém (NIS / ambulance). MeDiktor připraví výměnný formát. Plné napojení na konkrétní NIS (např. nemocniční) dokončíme s vaším IT — ozvěte se na +420 733 635 144.",
      },
      {
        title: "D. Přeskočit",
        text: "Propojení můžete přeskočit a zapnout později v Účet → SW propojení.",
      },
    ],
    where: "Nastavení: aplikace → záložka Účet, nebo první spuštění (krok „Chcete propojit MeDiktor s vaším softwarem?“).",
  },

  legal: {
    title: "Informování pacienta — zákonné, běžné, bez pochyb",
    lead:
      "Nahrávat konzultaci v ordinaci je v České republice běžné a zákonné, pokud to pacient ví a souhlasí. Skryté nahrávání rozhovoru nedělejte.",
    twoModes: [
      {
        title: "Diktát (pacient u toho není)",
        text: "Nahráváte svůj odborný souhrn po vyšetření. Hlas pacienta se nezaznamenává. Zvláštní souhlas s nahrávkou nepotřebujete. Zápis je zdravotnická dokumentace, kterou máte povinnost vést.",
      },
      {
        title: "Konzultace (pacient mluví na nahrávku)",
        text: "Před stisknutím mikrofonu nahlas řekněte větu níže a počkejte na souhlas. Když pacient odmítne, nahrávejte až diktát po odchodu — péči to nesmí zhoršit.",
      },
    ],
    scriptTitle: "Řekněte nahlas (stačí jednou, srozumitelně)",
    script:
      "Nahrávám teď náš rozhovor do aplikace MeDiktor, abych z něj připravil zdravotnickou dokumentaci. Nahrávka se po vytvoření zápisu smaže, nikam se dál neposílá a slouží jen k zápisu. Péči to nijak nemění — pokud si nahrávání nepřejete, nahrávat nebudu a zápis udělám po vyšetření. Souhlasíte?",
    scriptShort:
      "Nahrávám rozhovor jen kvůli zápisu do dokumentace, nahrávka se smaže. Můžete odmítnout. Souhlasíte?",
    rules: [
      "Říkejte to před zapnutím nahrávání, ne až během něj.",
      "Počkejte na zřetelné ano / přikývnutí. Při nejistotě nahrávejte až diktát bez pacienta.",
      "Nenahrávejte skrytě (telefon v kapse, bez vědomí). To osobnostní práva porušuje.",
      "Nahrávka není ke zveřejnění, výuce cizích osob ani k odeslání e-mailem jako audio.",
      "Do dokumentace patří text, který jste zkontrolovali — ne surový záznam hlasu.",
    ],
    basesTitle: "Právní opora (ČR / EU)",
    bases: [
      "Občanský zákoník č. 89/2012 Sb., § 84–90 — podobizna a záznam projevu osobní povahy se pořizují se souhlasem / s vědomím člověka. Otevřené nahrávání po informování a souhlasu je v pořádku.",
      "GDPR (nařízení EU 2016/679), čl. 6 a čl. 9 odst. 2 písm. h) — zpracování údajů o zdravotním stavu pro poskytování zdravotní péče a vedení dokumentace. Čl. 13 — pacient má právo vědět, co se s údaji děje (proto ta věta nahlas).",
      "Zákon č. 110/2019 Sb., o zpracování osobních údajů — prováděcí předpis k GDPR v ČR.",
      "Zákon č. 372/2011 Sb., o zdravotních službách: § 31 informovanost pacienta, § 51 mlčenlivost, § 53 a násl. povinnost vést zdravotnickou dokumentaci.",
      "Etický kodex ČLK — důvěra a srozumitelné poučení. Informovaný pacient není překážka péče.",
    ],
    roles:
      "Správce údajů pacienta je lékař / zdravotnické zařízení. MedScopeGlobal (Al Synaptica Research Institute s.r.o., IČO 06024963) zpracovává text zápisu jako zpracovatel pro váš účet. Audio po zpracování neuchováváme.",
    notDevice:
      "MeDiktor není zdravotnický prostředek ani automatická diagnóza. Výstup je návrh zápisu; klinické rozhodnutí a finální znění dokumentace nese lékař.",
    disclaimer:
      "Tento souhrn je praktická pomůcka podle platných předpisů ČR a EU, nenahrazuje vnitřní směrnici vašeho zařízení ani individuální právní posudek. Při hromadném nasazení v nemocnici schvalte postup s právním / GDPR týmem.",
    waitingRoomTitle: "Informace pro pacienty — nahrávání konzultace",
    waitingRoom:
      "Lékař může nahrát náš rozhovor do aplikace MeDiktor jen proto, aby z něj připravil zdravotnickou dokumentaci. Nahrávka se po vytvoření zápisu smaže, nikam se nezveřejňuje a neslouží k výuce cizích osob. Péče je stejná, i když nahrávání odmítnete — stačí to lékaři říct. Nahrává se jen s vaším vědomím a souhlasem.",
    waitingRoomLegal:
      "Právní rámec: občanský zákoník č. 89/2012 Sb. § 84–90, GDPR čl. 6, 9 odst. 2 písm. h) a 13, zákon č. 110/2019 Sb., zákon č. 372/2011 Sb. § 31, § 51, § 53 a násl. Správce údajů: lékař / zdravotnické zařízení. Zpracovatel textu zápisu: MedScopeGlobal (Al Synaptica Research Institute s.r.o.).",
  },
} as const;
