/** Global locale configuration for MedScopeGlobal ecosystem */

export const GLOBAL_LOCALES = [
  { code: "cs", hreflang: "cs-CZ", label: "Čeština", region: "EU", currency: "CZK", searchEngine: "google" },
  { code: "sk", hreflang: "sk-SK", label: "Slovenčina", region: "EU", currency: "EUR", searchEngine: "google" },
  { code: "pl", hreflang: "pl-PL", label: "Polski", region: "EU", currency: "PLN", searchEngine: "google" },
  { code: "de", hreflang: "de-DE", label: "Deutsch", region: "EU", currency: "EUR", searchEngine: "google" },
  { code: "fr", hreflang: "fr-FR", label: "Français", region: "EU", currency: "EUR", searchEngine: "google" },
  { code: "it", hreflang: "it-IT", label: "Italiano", region: "EU", currency: "EUR", searchEngine: "google" },
  { code: "es", hreflang: "es-ES", label: "Español", region: "EU", currency: "EUR", searchEngine: "google" },
  { code: "ro", hreflang: "ro-RO", label: "Română", region: "EU", currency: "RON", searchEngine: "google" },
  { code: "hu", hreflang: "hu-HU", label: "Magyar", region: "EU", currency: "HUF", searchEngine: "google" },
  { code: "ru", hreflang: "ru-RU", label: "Русский", region: "RU", currency: "RUB", searchEngine: "yandex" },
  { code: "uk", hreflang: "uk-UA", label: "Українська", region: "RU", currency: "UAH", searchEngine: "google" },
  { code: "be", hreflang: "be-BY", label: "Беларуская", region: "RU", currency: "BYN", searchEngine: "yandex" },
  { code: "zh-CN", hreflang: "zh-CN", label: "简体中文", region: "ASIA", currency: "CNY", searchEngine: "baidu" },
  { code: "ja", hreflang: "ja-JP", label: "日本語", region: "ASIA", currency: "JPY", searchEngine: "google" },
  { code: "ko", hreflang: "ko-KR", label: "한국어", region: "ASIA", currency: "KRW", searchEngine: "naver" },
  { code: "vi", hreflang: "vi-VN", label: "Tiếng Việt", region: "ASIA", currency: "VND", searchEngine: "google" },
  { code: "id", hreflang: "id-ID", label: "Bahasa Indonesia", region: "ASIA", currency: "IDR", searchEngine: "google" },
  { code: "en", hreflang: "en", label: "English (International)", region: "GLOBAL", currency: "USD", searchEngine: "google" },
  { code: "en-US", hreflang: "en-US", label: "English (USA)", region: "USA", currency: "USD", searchEngine: "google" },
] as const;

export type GlobalLocaleCode = (typeof GLOBAL_LOCALES)[number]["code"];

export const GEO_LOCALE_MAP: Record<string, GlobalLocaleCode> = {
  US: "en-US", CA: "en-US", GB: "en", AU: "en", NZ: "en", IE: "en",
  CZ: "cs", SK: "sk", PL: "pl", DE: "de", AT: "de", CH: "de",
  FR: "fr", BE: "fr", IT: "it", ES: "es", PT: "es",
  RO: "ro", HU: "hu",
  RU: "ru", BY: "be", UA: "uk", KZ: "ru",
  CN: "zh-CN", TW: "zh-CN", HK: "zh-CN",
  JP: "ja", KR: "ko", VN: "vi", ID: "id",
};

export function localeFromCountry(countryCode: string | null | undefined): GlobalLocaleCode {
  if (!countryCode) return "cs";
  return GEO_LOCALE_MAP[countryCode.toUpperCase()] ?? "en";
}

export function getLocaleConfig(code: string) {
  return GLOBAL_LOCALES.find((l) => l.code === code) ?? GLOBAL_LOCALES[0];
}

export const MEDICAL_DISCLAIMER: Record<GlobalLocaleCode, string> = {
  cs: "Obsah není lékařská diagnóza ani léčebné doporučení. Vždy konzultujte se svým lékařem.",
  sk: "Obsah nie je lekárska diagnóza ani liečebné odporúčanie. Vždy konzultujte so svojím lekárom.",
  pl: "Treść nie stanowi diagnozy medycznej ani zaleceń terapeutycznych. Zawsze konsultuj się z lekarzem.",
  de: "Der Inhalt stellt keine medizinische Diagnose oder Behandlungsempfehlung dar. Konsultieren Sie immer Ihren Arzt.",
  fr: "Le contenu ne constitue pas un diagnostic médical ni une recommandation thérapeutique. Consultez toujours votre médecin.",
  it: "Il contenuto non costituisce una diagnosi medica né una raccomandazione terapeutica. Consulti sempre il proprio medico.",
  es: "El contenido no constituye un diagnóstico médico ni una recomendación terapéutica. Consulte siempre a su médico.",
  ro: "Conținutul nu reprezintă un diagnostic medical sau o recomandare terapeutică. Consultați întotdeauna medicul.",
  hu: "A tartalom nem minősül orvosi diagnózisnak vagy kezelési javaslatnak. Mindig konzultáljon orvosával.",
  ru: "Контент не является медицинским диагнозом или рекомендацией по лечению. Всегда консультируйтесь с врачом.",
  uk: "Контент не є медичним діагнозом чи рекомендацією щодо лікування. Завжди консультуйтеся з лікарем.",
  be: "Кантэнт не з'яўляецца медыцынскім дыягнозам ці рэкамендацыяй па лячэнні. Заўсёды кансультуйцеся з лекарам.",
  "zh-CN": "本内容不构成医疗诊断或治疗建议。请务必咨询您的医生。",
  ja: "このコンテンツは医学的診断や治療の推奨ではありません。必ず医師にご相談ください。",
  ko: "이 콘텐츠는 의학적 진단이나 치료 권고가 아닙니다. 항상 의사와 상담하세요.",
  vi: "Nội dung không phải là chẩn đoán y khoa hay khuyến nghị điều trị. Luôn tham khảo ý kiến bác sĩ.",
  id: "Konten ini bukan diagnosis medis atau rekomendasi pengobatan. Selalu konsultasikan dengan dokter Anda.",
  en: "Content is not medical diagnosis or treatment advice. Always consult your physician.",
  "en-US": "This content is not medical advice, diagnosis, or treatment. Always consult your healthcare provider.",
};
