/**
 * Native-speaker writing brief per magazine locale.
 * Foreign desks write in the mutation language — Czech only when locale is cs.
 */

const LANGUAGE_NAME = {
  cs: "čeština",
  sk: "slovenčina",
  pl: "polski",
  de: "Deutsch",
  fr: "français",
  it: "italiano",
  es: "español",
  pt: "português europeu",
  "pt-BR": "português brasileiro",
  ro: "română",
  hu: "magyar",
  ru: "русский",
  uk: "українська",
  be: "беларуская",
  "zh-CN": "简体中文",
  ja: "日本語",
  ko: "한국어",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
  en: "international English",
  "en-US": "American English",
};

const LOCAL_HINT = {
  cs: "Česko: praktický lékař, pojišťovny, tísňová 155.",
  sk: "Slovensko: všeobecný lekár, 155/112.",
  pl: "Polska: POZ, NFZ, 112.",
  de: "DACH: Hausarzt, gesetzliche Krankenkasse, 112.",
  fr: "France: médecin traitant, Assurance maladie, 15/112.",
  it: "Italia: medico di base, SSN, 118/112.",
  es: "España: médico de familia, SNS, 112.",
  pt: "Portugal: médico de família, SNS, INEM 112.",
  "pt-BR": "Brasil: UBS e SUS, SAMU 192. Português brasileiro, não europeu.",
  ro: "România: medic de familie, 112.",
  hu: "Magyarország: háziorvos, 112.",
  ru: "Местная практика и неотложка 103/112.",
  uk: "Сімейний лікар, 103.",
  be: "Тэрапеўт, 103.",
  "zh-CN": "社区医院、急救 120。只用简体中文。",
  ja: "かかりつけ医、救急 119。日本語のみ。",
  ko: "의원, 119. 한국어만.",
  vi: "Bác sĩ gia đình, 115.",
  id: "Puskesmas, 118/119.",
  en: "GP / family doctor; 112 or local emergency number.",
  "en-US": "PCP, US insurance networks, 911. American English.",
};

export function nativeLanguageName(locale = "cs") {
  return LANGUAGE_NAME[locale] ?? LANGUAGE_NAME.en;
}

export function buildNativeLocalePrompt(locale = "cs") {
  const language = nativeLanguageName(locale);
  const hint = LOCAL_HINT[locale] ?? LOCAL_HINT.en;
  const czechOnly = locale === "cs";
  return `Jazyk a redakce:
- Jsi rodilý mluvčí jazyka ${language}. Piš VÝHRADNĚ v tomto jazyce — pravopis i gramatika jako v kvalitním místním magazínu.
${czechOnly ? "- Čeština s diakritikou." : "- NIKDY nepiš česky ani neskládej věty z češtiny. Žádný český chrome."}
- Místní specifika: ${hint}
- Články vznikají nativně pro tuto mutaci. Cizí text přebírej jen výjimečně; pak ho adaptuj a přidej komentář místní redakce.
- Seniorní hlas: praxe i výzkum, aktivní hledání trendů v kategorii.
- Podprahová užitečnost: čtenář se chce vrátit. Žádné VIP, žádné „přispějte teď", žádné „kupte toto".
- Diplomaticky a právně v pořádku. Žádné diagnózy. U nejasností místní lékař / tísňová linka.`;
}
