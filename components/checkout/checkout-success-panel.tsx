"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { normalizeLocale } from "@/lib/i18n/config";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { safeEditorialReturnPath } from "@/lib/editorial/return-path";

function editorialSuccessCopy(locale: string) {
  const primary = primaryArticleLocale(normalizeLocale(locale));
  if (primary === "de") {
    return {
      title: "Zahlung erfolgreich",
      body: "Danke. Die Redaktion wird jetzt auf diesem Gerät geöffnet.",
      opening: "Redaktion wird auf diesem Gerät geöffnet…",
      opened: "Dieses Gerät hat jetzt Zugang. Sie können die Artikel sofort lesen — das Stripe-Konto legen wir im Hintergrund an.",
      failed: "Die Zahlung ist durch, aber dieses Gerät ließ sich nicht entsperren. Erneut versuchen oder mit derselben E-Mail anmelden.",
      retry: "Erneut entsperren",
      unlocking: "Zugang wird geöffnet…",
      read: "Artikel weiterlesen",
      plans: "Tarife",
    };
  }
  if (primary === "fr") {
    return {
      title: "Paiement réussi",
      body: "Merci. La rédaction s’ouvre maintenant sur cet appareil.",
      opening: "Ouverture de la rédaction sur cet appareil…",
      opened: "Cet appareil a maintenant accès. Vous pouvez lire les articles tout de suite — le compte Stripe sera rattaché en arrière-plan.",
      failed: "Le paiement a réussi, mais cet appareil n’a pas pu être déverrouillé. Réessayez, ou connectez-vous avec le même e-mail.",
      retry: "Réessayer le déverrouillage",
      unlocking: "Déverrouillage…",
      read: "Continuer l’article",
      plans: "Formules",
    };
  }
  if (primary !== "cs") {
    return {
      title: "Payment successful",
      body: "Thank you. Editorial is opening on this device now.",
      opening: "Opening the magazine on this device…",
      opened: "This device now has access. You can read articles now; we will attach the Stripe email in the background.",
      failed: "Payment succeeded, but this device could not be unlocked. Retry, or sign in with the same email.",
      retry: "Retry unlock",
      unlocking: "Unlocking access…",
      read: "Continue reading",
      plans: "Plans",
    };
  }
  return {
    title: "Platba proběhla úspěšně",
    body: "Děkujeme. Redakce se na tomto zařízení právě otevírá.",
    opening: "Otevíráme Redakci na tomto zařízení…",
    opened:
      "Toto zařízení má přístup. Články můžete číst hned — účet z e-mailu Stripe přidáme na pozadí.",
    failed:
      "Platba prošla, ale toto zařízení se nepodařilo odemknout. Zkuste to znovu, nebo se přihlaste stejným e-mailem.",
    retry: "Odemknout znovu",
    unlocking: "Odemykáme přístup…",
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
  const alreadyClaimed = params.get("claimed") === "1";
  const knownEditorial = product.startsWith("public-") || alreadyClaimed;
  const shouldProbe =
    Boolean(sessionId) &&
    !gift &&
    !alreadyClaimed &&
    !/^(student|physician|dokumentace)-/.test(product);
  const [editorial, setEditorial] = useState(knownEditorial);
  const returnPath = safeEditorialReturnPath(params.get("return"));
  const share = useMemo(() => {
    if (!sessionId) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/studenti/darkove?session=${encodeURIComponent(sessionId)}`;
  }, [sessionId]);
  const editorialCopy = editorial ? editorialSuccessCopy(locale) : null;
  const articlesHref = localizePublicHref(returnPath ?? "/articles", locale);
  const plansHref = localizePublicHref("/predplatne#public", locale);
  const [claimed, setClaimed] = useState(!knownEditorial || alreadyClaimed);
  const [claimFailed, setClaimFailed] = useState(false);
  const [claiming, setClaiming] = useState(knownEditorial && Boolean(sessionId) && !alreadyClaimed);

  const claimEditorial = useCallback(async () => {
    if (!sessionId) {
      setClaimFailed(true);
      setClaiming(false);
      return;
    }
    setClaiming(true);
    setClaimFailed(false);
    try {
      const res = await fetch("/api/v27/claim-editorial", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        if (res.status === 403 && !product.startsWith("public-")) {
          setEditorial(false);
          setClaimed(true);
          return;
        }
        setClaimFailed(true);
        return;
      }
      setEditorial(true);
      setClaimed(true);
    } catch {
      setClaimFailed(true);
    } finally {
      setClaiming(false);
    }
  }, [sessionId, product]);

  useEffect(() => {
    if (alreadyClaimed) {
      setEditorial(true);
      setClaimed(true);
      setClaiming(false);
      return;
    }
    if (knownEditorial || shouldProbe) {
      void claimEditorial();
      return;
    }
    setClaimed(true);
    setClaiming(false);
  }, [alreadyClaimed, knownEditorial, shouldProbe, claimEditorial]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="rounded-3xl border border-green-200 bg-green-50 p-8">
        <h1 className="font-display text-2xl font-bold text-green-900">
          {editorialCopy?.title ?? "Platba proběhla úspěšně"}
        </h1>
        <p className="mt-3 text-sm text-green-800">
          {editorial
            ? claiming
              ? editorialCopy?.opening
              : claimed
                ? editorialCopy?.opened
                : editorialCopy?.body
            : "Děkujeme za nákup. Potvrzení obdržíte e-mailem. Přístup k obsahu bude aktivován během několika minut."}
        </p>
        {claimFailed ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-amber-800">{editorialCopy?.failed}</p>
            <button
              type="button"
              onClick={() => void claimEditorial()}
              className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-950"
            >
              {editorialCopy?.retry}
            </button>
          </div>
        ) : null}
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
              {claimed ? (
                <Link
                  href={articlesHref}
                  className="rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
                >
                  {editorialCopy?.read}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="cursor-wait rounded-full bg-[#005B96]/50 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  {editorialCopy?.unlocking}
                </button>
              )}
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
