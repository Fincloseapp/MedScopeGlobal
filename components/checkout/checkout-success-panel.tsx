"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { normalizeLocale } from "@/lib/i18n/config";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";

function editorialSuccessCopy(locale: string) {
  const primary = primaryArticleLocale(normalizeLocale(locale));
  if (primary === "de") {
    return {
      title: "Zahlung erfolgreich",
      body: "Danke. Die Redaktion ist jetzt offen — weiterlesen, wann Sie wollen.",
      read: "Artikel weiterlesen",
      plans: "Tarife",
    };
  }
  if (primary === "fr") {
    return {
      title: "Paiement réussi",
      body: "Merci. La rédaction est ouverte — continuez votre lecture.",
      read: "Continuer l’article",
      plans: "Formules",
    };
  }
  if (primary !== "cs") {
    return {
      title: "Payment successful",
      body: "Thank you. Editorial is open — continue reading whenever you like.",
      read: "Continue reading",
      plans: "Plans",
    };
  }
  return {
    title: "Platba proběhla úspěšně",
    body: "Děkujeme. Redakce je teď otevřená — čtěte dál, kdy chcete.",
    read: "Pokračovat ve čtení",
    plans: "Ceník",
  };
}

export function CheckoutSuccessPanel() {
  const params = useSearchParams();
  const sessionId = params.get("session_id") ?? "";
  const gift = params.get("gift") === "1";
  const product = params.get("product") ?? "";
  const locale = params.get("locale") ?? "cs";
  const editorial = product.startsWith("public-");
  const share = useMemo(() => {
    if (!sessionId) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/studenti/darkove?session=${encodeURIComponent(sessionId)}`;
  }, [sessionId]);
  const editorialCopy = editorial ? editorialSuccessCopy(locale) : null;
  const articlesHref = localizePublicHref("/articles", locale);
  const plansHref = localizePublicHref("/predplatne#public", locale);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="rounded-3xl border border-green-200 bg-green-50 p-8">
        <h1 className="font-display text-2xl font-bold text-green-900">
          {editorialCopy?.title ?? "Platba proběhla úspěšně"}
        </h1>
        <p className="mt-3 text-sm text-green-800">
          {editorialCopy?.body ??
            "Děkujeme za nákup. Potvrzení obdržíte e-mailem. Přístup k obsahu bude aktivován během několika minut."}
        </p>
        {gift && share ? (
          <div className="mt-5 rounded-2xl border border-green-200 bg-white p-4 text-left">
            <p className="text-sm font-semibold text-[#021d33]">Odkaz pro studenta</p>
            <p className="mt-1 text-xs text-slate-600">
              Přepošlete tento odkaz. Student se přihlásí a klikne na Aktivovat. Jedna platba = jeden účet.
            </p>
            <p className="mt-3 break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">{share}</p>
            <Link
              href={`/studenti/darkove?session=${encodeURIComponent(sessionId)}`}
              className="mt-3 inline-flex text-sm font-semibold text-[#005B96] hover:underline"
            >
              Otevřít aktivační stránku
            </Link>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {editorial ? (
            <>
              <Link
                href={articlesHref}
                className="rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
              >
                {editorialCopy?.read}
              </Link>
              <Link
                href={plansHref}
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {editorialCopy?.plans}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/studenti"
                className="rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
              >
                Studentský přehled
              </Link>
              <Link
                href="/predplatne"
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Ceník
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
