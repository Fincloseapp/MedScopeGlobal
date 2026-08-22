/** First-run walkthrough copy for seniors (3 short Czech steps). */

export const MP_ONBOARDING_SKIP = "Přeskočit";
export const MP_ONBOARDING_NEXT = "Další";
export const MP_ONBOARDING_DONE = "Rozumím";
export const MP_ONBOARDING_HELP = "Jak to funguje";
export const MP_ONBOARDING_TITLE = "Jak MeDipacient funguje";

export const MP_ONBOARDING_STEPS = [
  {
    id: "upload",
    title: "Nahrát zprávu",
    body: "Dole stiskněte Nahrát zprávu. Vyfoťte papír od lékaře nebo vyberte PDF.",
  },
  {
    id: "wait",
    title: "Počkat na překlad",
    body: "Chvíli počkejte. MeDipacient zprávu přečte a napíše srozumitelně česky.",
  },
  {
    id: "controls",
    title: "Kontroly nahoře",
    body: "Termíny kontrol uvidíte nahoře ve Zprávách. Tam si je i odškrtnete.",
  },
] as const;
