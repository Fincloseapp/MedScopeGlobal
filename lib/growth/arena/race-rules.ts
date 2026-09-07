/** Admin-only copy. Public pages must not name Alfa/Beta. */

export const ARENA_POINTS_PER_PAID = 100;

export const ARENA_RACE_RULES = {
  title: "Jak závod týmů pokračuje",
  goal:
    "Cíl je nejvíc platících předplatitelů se skutečně zaplaceným Stripe (status active). Trial, hop, crawler, IndexNow a košík bez platby nejsou výhra.",
  steps: [
    "Každé kolo cronu: drafty + IndexNow hopy — nejdřív /predplatne. To je pipeline, ne skóre.",
    "Body: 0 paid → 0 bodů. Každý přiřazený ai_agent_paid = +100. Návštěva a checkout body nedávají.",
    "Vedoucí 7 dní: kdo má víc paid. 0–0 = remíza. Historické body z éry návštěv se nepočítají.",
    "Hodina: oba 0 paid → remíza, kvóta zmrazená. Jeden má paid → vítěz +8 kvóty, poražený −4.",
    "Poražený 6 hodin bez paid, zatímco soupeř má paid → usmrcení a klon ze stylu vítěze.",
    "Organická platba bez cookie ms_ai_ref (header, homepage) = výhra programu, ale ani jeden tým nedostane bod (agent other).",
    "Sociální drafty zůstávají ve frontě. Cron neposílá IG/FB/X. Lidský upload z /promo/klipy + /predplatne.",
    "B2B /firmy/reklama/nova je druhý příjem a do souboje se nepočítá, dokud někdo nezaplatí předplatné.",
  ],
} as const;
