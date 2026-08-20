import { CZECH_NAMEDAYS } from "@/lib/calendar/czech-namedays";

const TZ = "Europe/Prague";

const PUBLIC_HOLIDAYS: Record<string, string> = {
  "01-01": "Nový rok — Den obnovy samostatného českého státu",
  "05-01": "Svátek práce",
  "05-08": "Den vítězství",
  "07-05": "Den slovanských věrozvěstů Cyrila a Metoděje",
  "07-06": "Den upálení mistra Jana Husa",
  "09-28": "Den české státnosti",
  "10-28": "Den vzniku samostatného československého státu",
  "11-17": "Den boje za svobodu a demokracii",
  "12-24": "Štědrý den",
  "12-25": "1. svátek vánoční",
  "12-26": "2. svátek vánoční",
};

const SIGNIFICANT_DAYS: Record<string, string> = {
  "01-16": "Den památky Jana Palacha",
  "01-27": "Den památky obětí holocaustu",
  "03-12": "Den přístupu České republiky k NATO",
  "05-05": "Květnové povstání českého lidu",
  "06-10": "Výročí vyhlazení Lidic",
  "06-18": "Den hrdinů druhého odboje",
  "06-27": "Den památky obětí komunistického režimu",
  "08-21": "Den památky obětí invaze a následné okupace (1968)",
  "11-11": "Den válečných veteránů",
};

const HEALTH_DAYS: Record<string, string> = {
  "02-04": "Světový den proti rakovině",
  "03-03": "Světový den sluchu",
  "03-20": "Světový den ústního zdraví",
  "03-24": "Světový den tuberkulózy",
  "04-02": "Světový den porozumění autismu",
  "04-07": "Světový den zdraví",
  "04-11": "Světový den Parkinsonovy nemoci",
  "04-25": "Světový den malárie",
  "05-05": "Světový den hygieny rukou",
  "05-12": "Mezinárodní den sester",
  "05-17": "Světový den hypertenze",
  "05-19": "Světový den praktických lékařů",
  "05-31": "Světový den bez tabáku",
  "06-14": "Světový den dárců krve",
  "07-28": "Světový den hepatitidy",
  "09-10": "Světový den prevence sebevražd",
  "09-17": "Světový den bezpečí pacientů",
  "09-21": "Světový den Alzheimerovy choroby",
  "09-29": "Světový den srdce",
  "10-01": "Mezinárodní den starších osob",
  "10-10": "Světový den duševního zdraví",
  "10-12": "Světový den artritidy",
  "10-16": "Světový den anestezie",
  "10-20": "Světový den osteoporózy",
  "10-29": "Světový den proti cévní mozkové příhodě",
  "11-14": "Světový den diabetu",
  "11-17": "Světový den nedonošených dětí",
  "12-01": "Světový den AIDS",
  "12-03": "Mezinárodní den osob se zdravotním postižením",
};

export type CzechTodayInfo = {
  iso: string;
  dateLabel: string;
  nameday: string | null;
  holiday: string | null;
  significantDay: string | null;
  healthDay: string | null;
  text: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Anonymous Gregorian computus → Easter Sunday month/day. */
export function easterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function addDays(year: number, month: number, day: number, delta: number): { month: number; day: number } {
  const dt = new Date(Date.UTC(year, month - 1, day + delta));
  return { month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): string {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstWd = first.getUTCDay();
  const shift = (weekday - firstWd + 7) % 7;
  const day = 1 + shift + (nth - 1) * 7;
  return `${pad(month)}-${pad(day)}`;
}

function pragueYmd(now: Date): { year: number; month: number; day: number; key: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day, key: `${pad(month)}-${pad(day)}` };
}

function formatNameday(raw: string | undefined): string | null {
  const names = (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!names.length) return null;
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} a ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} a ${names[names.length - 1]}`;
}

function holidayFor(year: number, key: string): string | null {
  if (PUBLIC_HOLIDAYS[key]) return PUBLIC_HOLIDAYS[key];
  const easter = easterSunday(year);
  const friday = addDays(year, easter.month, easter.day, -2);
  const monday = addDays(year, easter.month, easter.day, 1);
  if (key === `${pad(friday.month)}-${pad(friday.day)}`) return "Velký pátek";
  if (key === `${pad(monday.month)}-${pad(monday.day)}`) return "Velikonoční pondělí";
  return null;
}

function extraSignificant(year: number, key: string): string | null {
  if (SIGNIFICANT_DAYS[key]) return SIGNIFICANT_DAYS[key];
  if (key === nthWeekdayOfMonth(year, 5, 0, 2)) return "Den matek";
  if (key === nthWeekdayOfMonth(year, 6, 0, 3)) return "Den otců";
  return null;
}

export function getCzechTodayInfo(now: Date = new Date()): CzechTodayInfo {
  const { year, key } = pragueYmd(now);
  const dateLabel = new Intl.DateTimeFormat("cs-CZ", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const prettyDate = dateLabel.charAt(0).toLocaleUpperCase("cs-CZ") + dateLabel.slice(1);

  const nameday = formatNameday(CZECH_NAMEDAYS[key]);
  const holiday = holidayFor(year, key);
  const significantDay = extraSignificant(year, key);
  const healthDay = HEALTH_DAYS[key] ?? null;

  const parts = [prettyDate];
  if (nameday) parts.push(nameday.includes(" a ") ? `svátek mají ${nameday}` : `svátek má ${nameday}`);
  if (holiday) parts.push(`státní svátek: ${holiday}`);
  else if (significantDay) parts.push(`významný den: ${significantDay}`);
  if (healthDay) parts.push(`ve zdravotnictví: ${healthDay}`);

  return {
    iso: `${year}-${key}`,
    dateLabel: prettyDate,
    nameday,
    holiday,
    significantDay,
    healthDay,
    text: parts.join(" · "),
  };
}

export function getPortalTodayNote(now?: Date): string {
  return getCzechTodayInfo(now).text;
}
