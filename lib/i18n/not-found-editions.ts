import type { NotFoundCopy } from "@/lib/i18n/not-found-copy";

export type NotFoundEdition = Partial<NotFoundCopy>;

const EDITIONS: Record<string, NotFoundEdition> = {
  sk: {
    code: "Chyba 404",
    title: "Stránka sa nenašla",
    body: "Požadovaná stránka na MedScopeGlobal neexistuje alebo bola presunutá. Otvorte aplikáciu, predplatné alebo úvodnú stránku.",
    home: "Domov",
    apps: "Aplikácie",
    trial: "Predplatné",
  },
  pl: {
    code: "Błąd 404",
    title: "Nie znaleziono strony",
    body: "Ta strona nie istnieje na MedScopeGlobal albo została przeniesiona. Otwórz aplikację, prenumeratę albo stronę główną.",
    home: "Start",
    apps: "Aplikacje",
    trial: "Prenumerata",
  },
  ja: {
    code: "エラー 404",
    title: "ページが見つかりません",
    body: "このページは MedScopeGlobal にないか、移動しました。アプリ、購読、またはホームを開いてください。",
    home: "ホーム",
    apps: "アプリ",
    trial: "購読",
  },
};

export function notFoundEdition(primary: string): NotFoundEdition | undefined {
  return EDITIONS[primary];
}
