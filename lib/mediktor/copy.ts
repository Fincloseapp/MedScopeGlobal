/** Czech copy for MeDiktor physician onboarding (PWA + marketing). */
export const MEDIKTOR_ONBOARDING = {
  welcome: {
    title: "Diktujte, my zapisujeme. Začněte během 30 sekund.",
    cta: "Pokračovat",
  },
  contact: {
    title: "Zadejte e-mail. Pošleme ověřovací kód (bez hesla).",
    phonePlaceholder: "+420 … (volitelné)",
    emailPlaceholder: "vas@email.cz",
    cta: "Poslat kód e-mailem",
    smsGap:
      "SMS zatím není zapnutá. Kód posíláme e-mailem. Telefon je volitelný — uložíme ho k účtu, až bude e-mail ověřený.",
    phoneOnlyHint:
      "Samotný telefon nestačí — doplňte e-mail, na který pošleme kód.",
  },
  otp: {
    title: "Zadejte kód z e-mailu.",
    cta: "Ověřit a pokračovat",
    resend: "Poslat kód znovu",
    sentViaEmail: "Kód jsme poslali e-mailem",
    sentViaSms: "Kód jsme poslali SMS",
  },
  verify: {
    title: "Ověřujeme, že jste zdravotník. Můžete pokračovat.",
    subtitle: "Ověření běží na pozadí — diktovat můžete hned.",
    options: {
      id: "Průkaz / občanka (foto)",
      license: "Číslo licence (ČLK)",
      ico: "IČO zdravotnického zařízení",
      workEmail: "Pracovní e-mail",
    },
    cta: "Odeslat k ověření",
    skip: "Pokračovat bez dokončení",
  },
  integration: {
    title: "Chcete automaticky ukládat záznamy do vašeho systému?",
    prompt: "Chcete propojit MeDiktor s vaším softwarem?",
    yes: "Zapnout odesílání",
    skip: "Přeskočit — budu kopírovat",
  },
  main: {
    micHint: "Klikněte na mikrofon a začněte mluvit.",
    micTitle: "Potřebujeme mikrofon",
    micWhy:
      "MeDiktor nahrává diktát nebo konzultaci přímo v telefonu, aby z něj připravil odborný zápis. Audio se po zpracování neukládá.",
    micCta: "Povolit mikrofon",
    micReady: "Mikrofon povolen — můžete nahrávat",
    micGrantThenRecord: "Po povolení ihned spustíme nahrávání.",
  },
  tutorial: {
    title: "Jak začít",
    steps: [
      {
        n: 1,
        title: "Stáhnout na plochu",
        text: "Nainstalujte MeDiktor na telefon i PC. Pak e-mail → ověřovací kód. Bez hesla.",
      },
      {
        n: 2,
        title: "Nahrát (diktát nebo konzultace)",
        text: "Diktát po vyšetření, nebo rozhovor — pacientovi nejdřív řekněte větu z Návodu. Mikrofon → Stop → zápis.",
      },
      {
        n: 3,
        title: "Účet a kopírování",
        text: "Text se uloží do účtu (Historie na mobilu i PC). Tlačítko Kopírovat, Word nebo PDF do vašeho software.",
      },
      {
        n: 4,
        title: "Volitelné napojení SW",
        text: "Webhook / HL7 / FHIR v záložce Účet. Bez toho stačí kopírovat. Ověření lékaře můžete doplnit kdykoli.",
      },
    ],
  },
  tooltips: [
    {
      title: "Vítejte v MeDiktoru",
      text: "Nahrajte diktát nebo konzultaci — my připravíme odborný zápis.",
    },
    {
      title: "Mikrofon",
      text: "Klepněte na „Povolit mikrofon“ — telefon se zeptá na přístup. Po povolení spustíme nahrávku. Po skončení zápis zkontrolujte.",
    },
    {
      title: "Účet MedScopeGlobal",
      text: "Stejný účet na mobilu i PC. Podpora: +420 733 635 144.",
    },
  ],
  marketing: {
    downloadCta: "Stáhnout aplikaci",
    startIn30: "Začněte diktovat během 30 sekund.",
    otpBlurb:
      "Stačí e-mail a ověřovací kód — bez hesla. SMS zatím není; telefon je volitelný k účtu.",
    ambulatoryTitle: "Pro ambulantní lékaře",
    ambulatoryText:
      "Žádná složitá registrace. Diktujte po vyšetření a volitelně propojte ambulancní software.",
    hospitalTitle: "Pro nemocniční lékaře",
    hospitalText:
      "Rychlý start kódem. Propojení s NIS přes export, webhook, HL7 nebo FHIR — bez složitého onboardingu.",
  },
} as const;

export const MEDIKTOR_STORE = {
  appStoreUrl: process.env.NEXT_PUBLIC_MEDIKTOR_APP_STORE_URL?.trim() || "",
  playStoreUrl: process.env.NEXT_PUBLIC_MEDIKTOR_PLAY_STORE_URL?.trim() || "",
  smartDownloadPath: "/mediktor/stahnout",
  pwaPath: "/app/dokumentace",
} as const;
