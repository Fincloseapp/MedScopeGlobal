import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

type AccountPair = { signIn: string; subscribe: string; register: string };

/**
 * Short HN-style pair for the top of every header dropdown.
 * Keyed by UI locale and by primaryArticleLocale so /jp, /cn, /kr still resolve.
 */
const ACCOUNT: Record<string, AccountPair> = {
  cs: { signIn: "Přihlášení", subscribe: "Předplatné", register: "Registrace" },
  sk: { signIn: "Prihlásenie", subscribe: "Predplatné", register: "Registrácia" },
  pl: { signIn: "Zaloguj się", subscribe: "Prenumerata", register: "Rejestracja" },
  de: { signIn: "Anmelden", subscribe: "Abo", register: "Registrieren" },
  fr: { signIn: "Connexion", subscribe: "Abonnement", register: "Inscription" },
  it: { signIn: "Accedi", subscribe: "Abbonamento", register: "Registrati" },
  es: { signIn: "Entrar", subscribe: "Suscripción", register: "Registrarse" },
  pt: { signIn: "Entrar", subscribe: "Assinatura", register: "Registar" },
  "pt-BR": { signIn: "Entrar", subscribe: "Assinatura", register: "Cadastrar" },
  ro: { signIn: "Autentificare", subscribe: "Abonament", register: "Înregistrare" },
  hu: { signIn: "Bejelentkezés", subscribe: "Előfizetés", register: "Regisztráció" },
  ru: { signIn: "Войти", subscribe: "Подписка", register: "Регистрация" },
  uk: { signIn: "Увійти", subscribe: "Передплата", register: "Реєстрація" },
  be: { signIn: "Увайсці", subscribe: "Падпіска", register: "Рэгістрацыя" },
  zh: { signIn: "登录", subscribe: "订阅", register: "注册" },
  "zh-CN": { signIn: "登录", subscribe: "订阅", register: "注册" },
  ja: { signIn: "ログイン", subscribe: "購読", register: "登録" },
  ko: { signIn: "로그인", subscribe: "구독", register: "가입" },
  vi: { signIn: "Đăng nhập", subscribe: "Thuê bao", register: "Đăng ký" },
  id: { signIn: "Masuk", subscribe: "Langganan", register: "Daftar" },
  en: { signIn: "Sign in", subscribe: "Subscribe", register: "Register" },
  "en-US": { signIn: "Sign in", subscribe: "Subscribe", register: "Register" },
  "en-UK": { signIn: "Sign in", subscribe: "Subscribe", register: "Register" },
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
): {
  signInHref: string;
  signInLabel: string;
  subscribeHref: string;
  subscribeLabel: string;
  registerHref: string;
  registerLabel: string;
} {
  const loc = locale ?? "cs";
  const labels = accountPair(loc);
  return {
    signInHref: localizePublicHref("/login", loc),
    signInLabel: labels.signIn,
    subscribeHref: localizePublicHref(opts?.student ? "/predplatne#student" : "/predplatne", loc),
    subscribeLabel: labels.subscribe,
    registerHref: localizePublicHref("/signup", loc),
    registerLabel: labels.register,
  };
}
