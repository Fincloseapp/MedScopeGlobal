"use client";

import { useEffect, useState } from "react";

type Order = {
  status: string;
  decision: string | null;
  price: number | null;
  variableSymbol: string | null;
  invoiceHtml: string;
  invoiceNumber: string;
  iban: string | null;
  bankAccount: string | null;
  hasQr: boolean;
  stripeReady: boolean;
  company: string;
};

export function AdOrderClient({ id, token }: { id: string; token: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Chybí přístupový token z e-mailu.");
      return;
    }
    void fetch(`/api/ads/order/${id}?token=${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Objednávka nenalezena."))))
      .then((data) => setOrder(data as Order))
      .catch((err: Error) => setError(err.message));
  }, [id, token]);

  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!order) return <p className="text-sm text-muted-foreground">Načítám objednávku…</p>;

  const allowed = order.decision === "allowed" || order.status === "approved" || order.status === "active";
  const paid = order.status === "active";

  return (
    <div className="space-y-6">
      <p className="text-sm">
        Stav: <strong>{order.status}</strong>
        {order.decision ? ` · rozhodnutí: ${order.decision}` : " · čeká na tři editory a admina"}
      </p>
      {allowed && !paid ? (
        <div className="rounded-2xl border bg-white p-4 text-sm">
          <p className="font-semibold">Platba za reklamu — {order.company}</p>
          <p className="mt-1">Částka {Number(order.price ?? 0).toLocaleString("cs-CZ")} Kč</p>
          {order.variableSymbol ? (
            <p className="mt-1">
              Variabilní symbol: <code className="font-mono">{order.variableSymbol}</code>
            </p>
          ) : null}
          {order.iban ? <p className="mt-1">IBAN: {order.iban}</p> : null}
          {order.bankAccount ? <p className="mt-1">Účet: {order.bankAccount}</p> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`/api/ads/checkout?request_id=${encodeURIComponent(id)}`}
              className="rounded-full bg-[#005B96] px-4 py-2 text-white"
            >
              Zaplatit kartou (Stripe)
            </a>
          </div>
          {order.hasQr ? (
            <p className="mt-4">
              <img
                alt="QR platba"
                src={`/api/ads/qr/${id}?token=${encodeURIComponent(token)}`}
                width={180}
                height={180}
              />
            </p>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              QR převod se zobrazí, až bude v prostředí vyplněný IBAN provozovatele.
            </p>
          )}
        </div>
      ) : null}
      {paid ? <p className="text-sm text-emerald-800">Platba je potvrzená. Faktura odešla na e-mail firmy.</p> : null}
      <section>
        <h2 className="font-display text-xl font-semibold">Náhled faktury {order.invoiceNumber}</h2>
        <iframe title="Faktura" className="mt-3 h-[720px] w-full rounded-xl border bg-white" srcDoc={order.invoiceHtml} />
      </section>
    </div>
  );
}
