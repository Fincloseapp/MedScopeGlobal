const FAQ_ITEMS = [
  {
    q: "Jak funguje 14denní zkušební verze?",
    a: "Po registraci a výběru tarifu zadáte platební kartu přes Stripe. Prvních 14 dní neúčtujeme nic — máte plný přístup k obsahu daného tarifu. Po skončení zkušební doby se automaticky spustí měsíční nebo roční předplatné podle zvoleného plánu.",
  },
  {
    q: "Mohu předplatné kdykoli zrušit?",
    a: "Ano. Zrušení probíhá v sekci Účet nebo ve Stripe zákaznickém portálu. Přístup zůstane aktivní do konce zaplaceného období.",
  },
  {
    q: "Jaký tarif zvolit?",
    a: "Veřejnost (99 Kč) — prevence, životní styl a AI pro laiky. Student LF (149 Kč) — studijní materiály, kvízy a AI tutor. Lékař v praxi (490 Kč) — odborná sekce, guidelines, CME a klinický AI.",
  },
  {
    q: "Jaké platební metody podporujete?",
    a: "Platby zpracovává Stripe: platební karta (Visa, Mastercard), Apple Pay a Google Pay. Údaje o kartě neukládáme na našich serverech.",
  },
  {
    q: "Je roční plán výhodnější?",
    a: "Ano — roční předplatné odpovídá 10 měsícům ceny (≈ 2 měsíce zdarma). Např. tarif Student LF: 1 490 Kč/rok místo 1 788 Kč při měsíční platbě.",
  },
  {
    q: "Potřebuji účet před platbou?",
    a: "Doporučujeme se nejprve zaregistrovat na /signup, poté zvolit tarif zde. U tarifu pro lékaře může být vyžadováno ověření profese (ČLK).",
  },
] as const;

export function SubscriptionFaq() {
  return (
    <section aria-labelledby="faq-heading" className="mt-16">
      <h2 id="faq-heading" className="font-display text-2xl font-semibold text-[#021d33]">
        Časté dotazy
      </h2>
      <dl className="mt-6 space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-[#005B96]/15 bg-white px-5 py-4 shadow-sm open:shadow-md"
          >
            <summary className="cursor-pointer list-none font-semibold text-[#021d33] marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <span
                  className="shrink-0 text-[#005B96] transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </span>
            </summary>
            <dd className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</dd>
          </details>
        ))}
      </dl>
    </section>
  );
}
