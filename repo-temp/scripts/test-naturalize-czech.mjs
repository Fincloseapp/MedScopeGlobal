/** Inline Czech TTS naturalization test (no TS import needed). */
const CZECH_DIGIT_SPOKEN = {
  "0": "nula", "1": "jedna", "2": "dvě", "3": "tři", "4": "čtyři",
  "5": "pět", "6": "šest", "7": "sedm", "8": "osm", "9": "devět",
};
const CZECH_LETTER = {
  a: "á", b: "bé", c: "cé", d: "dé", e: "e", f: "ef", g: "gé", h: "há",
  i: "í", j: "jé", k: "ká", l: "el", m: "em", n: "en", o: "o", p: "pé",
  q: "kvé", r: "er", s: "es", t: "té", u: "u", v: "vé", w: "dvojité vé",
  x: "iks", y: "ypsilon", z: "zet",
};
const MEDICAL_ABBR = { mmHg: "milimetrů rtučového sloupce", EKG: "E K G" };
const PAUSE = "\u0000";

function speakDigit(n) {
  if (CZECH_DIGIT_SPOKEN[n]) return CZECH_DIGIT_SPOKEN[n];
  return n.split("").map((d) => CZECH_DIGIT_SPOKEN[d] ?? d).join(" ");
}
function speakLetter(ch) {
  return CZECH_LETTER[ch.toLowerCase()] ?? ch;
}
function naturalize(raw) {
  let t = raw.replace(/\r/g, "").replace(/[#*]/g, " ");
  t = t.replace(/\b(\d{1,2})([a-d])\b/gi, (_, num, letter) => `${speakDigit(num)} ${speakLetter(letter)}`);
  for (const [abbr, spoken] of Object.entries(MEDICAL_ABBR)) {
    t = t.replace(new RegExp(`\\b${abbr}\\b`, "gi"), spoken);
  }
  t = t.replace(/\b(\d+)\s*\/\s*(\d+)\b/g, (_, a, b) => `${speakDigit(a)} ${PAUSE} ${speakDigit(b)}`);
  return t.replace(/\s+/g, " ").trim();
}

const s1 = naturalize("Stadium 2b podle TNM.");
const s2 = naturalize("Tlak krve 120/80 mmHg je v normě.");
console.log("2b test:", s1);
console.log("120/80 mmHg test:", s2);

let ok = s1.includes("dvě bé") && s2.includes("milimetrů rtučového sloupce");
console.log(ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
