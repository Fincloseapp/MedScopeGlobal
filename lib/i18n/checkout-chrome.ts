import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { looksLikeCzech } from "@/lib/i18n/czech-detect";

export type CheckoutButtonCopy = {
  busy: string;
  failed: string;
  stripeMissing: string;
  generic: string;
};

function checkoutPack(locale?: string | null): string {
  const normalized = normalizeLocale(locale ?? "cs");
  if (normalized === "zh-CN" || normalized === "cn") return "zh-CN";
  if (normalized === "pt-BR" || normalized === "pt") return "pt-BR";
  if (normalized === "en-US" || normalized === "en-UK" || normalized === "en") return "en";
  const primary = primaryArticleLocale(normalized);
  if (primary === "zh") return "zh-CN";
  if (primary === "en") return "en";
  return primary;
}

const PACK: Record<string, CheckoutButtonCopy> = {
  cs: {
    busy: "Otevírám platbu…",
    failed: "Platbu se nepodařilo otevřít. Zkuste to znovu.",
    stripeMissing: "Platba teď není k dispozici.",
    generic: "Něco se pokazilo.",
  },
  en: {
    busy: "Opening payment…",
    failed: "Payment could not be opened. Please try again.",
    stripeMissing: "Payment is temporarily unavailable.",
    generic: "Something went wrong.",
  },
  de: {
    busy: "Zahlung wird geöffnet…",
    failed: "Die Zahlung ließ sich nicht öffnen. Bitte erneut versuchen.",
    stripeMissing: "Zahlung ist gerade nicht verfügbar.",
    generic: "Etwas ist schiefgelaufen.",
  },
  fr: {
    busy: "Ouverture du paiement…",
    failed: "Le paiement n’a pas pu s’ouvrir. Réessayez.",
    stripeMissing: "Le paiement est temporairement indisponible.",
    generic: "Une erreur s’est produite.",
  },
  sk: {
    busy: "Otváram platbu…",
    failed: "Platbu sa nepodarilo otvoriť. Skúste to znova.",
    stripeMissing: "Platba teraz nie je k dispozícii.",
    generic: "Niečo sa pokazilo.",
  },
  pl: {
    busy: "Otwieram płatność…",
    failed: "Nie udało się otworzyć płatności. Spróbuj ponownie.",
    stripeMissing: "Płatność jest chwilowo niedostępna.",
    generic: "Coś poszło nie tak.",
  },
  it: {
    busy: "Apertura del pagamento…",
    failed: "Il pagamento non si è aperto. Riprovi.",
    stripeMissing: "Il pagamento non è disponibile al momento.",
    generic: "Qualcosa è andato storto.",
  },
  es: {
    busy: "Abriendo el pago…",
    failed: "No se pudo abrir el pago. Inténtelo de nuevo.",
    stripeMissing: "El pago no está disponible ahora.",
    generic: "Algo salió mal.",
  },
  "pt-BR": {
    busy: "Abrindo o pagamento…",
    failed: "Não foi possível abrir o pagamento. Tente de novo.",
    stripeMissing: "O pagamento está indisponível no momento.",
    generic: "Algo deu errado.",
  },
  ro: {
    busy: "Deschid plata…",
    failed: "Plata nu s-a putut deschide. Încercați din nou.",
    stripeMissing: "Plata nu este disponibilă acum.",
    generic: "A apărut o eroare.",
  },
  hu: {
    busy: "Fizetés megnyitása…",
    failed: "A fizetést nem sikerült megnyitni. Próbálja újra.",
    stripeMissing: "A fizetés most nem elérhető.",
    generic: "Valami hiba történt.",
  },
  ru: {
    busy: "Открываю оплату…",
    failed: "Не удалось открыть оплату. Попробуйте ещё раз.",
    stripeMissing: "Оплата сейчас недоступна.",
    generic: "Что-то пошло не так.",
  },
  uk: {
    busy: "Відкриваю оплату…",
    failed: "Не вдалося відкрити оплату. Спробуйте ще раз.",
    stripeMissing: "Оплата зараз недоступна.",
    generic: "Щось пішло не так.",
  },
  be: {
    busy: "Адкрываю аплату…",
    failed: "Не ўдалося адкрыць аплату. Паспрабуйце яшчэ раз.",
    stripeMissing: "Аплата зараз недаступная.",
    generic: "Нешта пайшло не так.",
  },
  "zh-CN": {
    busy: "正在打开支付…",
    failed: "无法打开支付，请重试。",
    stripeMissing: "支付暂时不可用。",
    generic: "出了点问题。",
  },
  ja: {
    busy: "決済を開いています…",
    failed: "決済を開けませんでした。もう一度お試しください。",
    stripeMissing: "決済は一時的に利用できません。",
    generic: "エラーが発生しました。",
  },
  ko: {
    busy: "결제를 여는 중…",
    failed: "결제를 열 수 없습니다. 다시 시도하세요.",
    stripeMissing: "결제를 잠시 이용할 수 없습니다.",
    generic: "문제가 발생했습니다.",
  },
  vi: {
    busy: "Đang mở thanh toán…",
    failed: "Không mở được thanh toán. Hãy thử lại.",
    stripeMissing: "Thanh toán tạm thời không khả dụng.",
    generic: "Đã xảy ra lỗi.",
  },
  id: {
    busy: "Membuka pembayaran…",
    failed: "Pembayaran tidak bisa dibuka. Coba lagi.",
    stripeMissing: "Pembayaran sedang tidak tersedia.",
    generic: "Terjadi kesalahan.",
  },
};

export function getCheckoutButtonCopy(locale?: string | null): CheckoutButtonCopy {
  return PACK[checkoutPack(locale)] ?? PACK.en!;
}

/** API / fallback strings stay Czech-only on /cs. */
const CZECH_CHECKOUT_LEAK =
  /není|nakonfigurován|selhal|Neplatný|Přesměrování|pokladnu|zkuste to|nepodařilo/i;

export function readerCheckoutError(locale: string | null | undefined, raw?: string | null): string {
  const chrome = getCheckoutButtonCopy(locale);
  const normalized = normalizeLocale(locale ?? "cs");
  const message = raw?.trim() || "";
  if (normalized === "cs") return message || chrome.failed;
  if (message && !looksLikeCzech(message) && !CZECH_CHECKOUT_LEAK.test(message)) return message;
  return chrome.failed;
}
