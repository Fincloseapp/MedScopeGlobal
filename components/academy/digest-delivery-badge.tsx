import { getDigestDeliveryStatus } from "@/lib/academy/marketing/digest-config";

export function DigestDeliveryBadge() {
  const status = getDigestDeliveryStatus();

  const label =
    status.mode === "sendgrid"
      ? "SendGrid — živé doručování digestu"
      : "Log-only — digest se ukládá, e-mail se neodesílá";

  const tone =
    status.mode === "sendgrid"
      ? "border-green-200 bg-green-50 text-green-800"
      : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tone}`}>
      <p className="font-medium">Newsletter digest: {label}</p>
      <p className="mt-1 text-xs opacity-90">
        From: {status.fromEmail}
        {status.hasListId ? " · SendGrid list ID nastaven" : ""}
        {status.hasNewsletterTo ? " · ACADEMY_NEWSLETTER_TO nastaven" : ""}
        {!status.configured ? (
          <>
            {" "}
            · Nastavte <code className="text-xs">SENDGRID_API_KEY</code> na Vercel pro produkční
            odesílání
          </>
        ) : null}
      </p>
    </div>
  );
}
