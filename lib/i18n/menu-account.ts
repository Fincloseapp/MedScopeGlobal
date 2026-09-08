import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

type AccountPair = { signIn: string; subscribe: string };

/**
 * Short HN-style pair for the top of every header dropdown.
 * Keyed by UI locale and by primaryArticleLocale so /jp, /cn, /kr still resolve.
 */
const ACCOUNT: Record<string, AccountPair> = {
  cs: { signIn: "Přihlášení", subscribe: "Předplatné" },
  sk: { signIn: "Prihlásenie", subscribe: "Predplatné" },
  pl: { signIn: "Zaloguj się", subscribe: "Prenumerata" },
  de: { signIn: "Anmelden", subscribe: "Abo" },
  fr: { signIn: "Connexion", subscribe: "Abonnement" },
  it: { signIn: "Accedi", subscribe: "Abbonamento" },
  es: { signIn: "Entrar", subscribe: "Suscripción" },
  pt: { signIn: "Entrar", subscribe: "Assinatura" },
  "pt-BR": { signIn: "Entrar", subscribe: "Assinatura" },
  ro: { signIn: "Autentificare", subscribe: "Abonament" },
  hu: { signIn: "Bejelentkezés", subscribe: "Előfizetés" },
  ru: { signIn: "Войти", subscribe: "Подписка" },
  uk: { signIn: "Увійти", subscribe: "Передплата" },
  be: { signIn: "Увайсці", subscribe: "Падпіска" },
  zh: { signIn: "登录", subscribe: "订阅" },
  "zh-CN": { signIn: "登录", subscribe: "订阅" },
  ja: { signIn: "ログイン", subscribe: "購読" },
  ko: { signIn: "로그인", subscribe: "구독" },
  vi: { signIn: "Đăng nhập", subscribe: "Thuê bao" },
  id: { signIn: "Masuk", subscribe: "Langganan" },
  en: { signIn: "Sign in", subscribe: "Subscribe" },
  "en-US": { signIn: "Sign in", subscribe: "Subscribe" },
  "en-UK": { signIn: "Sign in", subscribe: "Subscribe" },
};

function accountPair(locale?: string | null): AccountPair {
  const loc = normalizeLocale(locale ?? "cs");
  const primary = primaryArticleLocale(loc);
  return ACCOUNT[loc] ?? ACCOUNT[primary] ?? ACCOUNT.en;
}

/** HN-style account pair shown at the top of every header dropdown. */
export function menuAccountLinks(
  locale?: string | null,
  opts?: { student?: boolean }
): { signInHref: string; signInLabel: string; subscribeHref: string; subscribeLabel: string } {
  const loc = locale ?? "cs";
  const labels = accountPair(loc);
  return {
    signInHref: localizePublicHref("/login", loc),
    signInLabel: labels.signIn,
    subscribeHref: localizePublicHref(opts?.student ? "/predplatne#student" : "/predplatne", loc),
    subscribeLabel: labels.subscribe,
  };
}
