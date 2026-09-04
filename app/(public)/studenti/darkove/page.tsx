import type { Metadata } from "next";
import Link from "next/link";
import { Gift } from "lucide-react";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { chromePack } from "@/lib/i18n/chrome-pack";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { GiftRedeemPanel } from "@/components/studenti/gift-redeem-panel";
import { studentIntroCharge, studentMonthlyCharge } from "@/lib/studenti/pricing";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const cs = chromePack(locale) === "cs";
  return await buildLocalizedV20PageMetadata({
    title: cs ? "Dárek Student LF — poslat odkaz" : "Student LF gift — forward the link",
    description: cs
      ? "Rodič zaplatí předplatné a přepošle aktivační odkaz studentovi."
      : "A parent pays the student plan and forwards the activation link.",
    path: "/studenti/darkove",
    locale,
  });
}

export default async function StudentGiftPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const locale = await getServerLocale();
  const cs = chromePack(locale) === "cs";
  const { session } = await searchParams;
  const intro = studentIntroCharge(locale);
  const monthly = studentMonthlyCharge(locale);
  const h = (path: string) => localizePublicHref(path, locale);

  return (
    <div className="bg-[#f3eee6] text-[#1b1712]">
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6d32]">
          <Gift className="h-3.5 w-3.5" aria-hidden />
          {cs ? "Dárek od rodiče" : "Gift from a parent"}
        </p>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight">
          {cs ? "Zaplatíte. Odkaz pošlete." : "You pay. They get the link."}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#5c564c]">
          {cs
            ? `První měsíc ${intro.formatted}, další měsíce ${monthly.formatted}. Po platbě vznikne odkaz. Student ho otevře, přihlásí se a aktivuje přístup. Jedna platba = jeden účet. Zrušíte kdykoli. Přijetí na medicínu nezaručujeme.`
            : `First month ${intro.formatted}, then ${monthly.formatted}. Payment creates a link. The student opens it, signs in and activates access. One payment = one account. Cancel anytime. We do not guarantee admission.`}
        </p>

        {session ? <GiftRedeemPanel sessionId={session} locale={locale} /> : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <V27CheckoutButton
            kind="subscription"
            productId="student-month"
            locale={locale}
            gift
            label={cs ? `Zaplatit dárek · ${intro.formatted}` : `Pay for the gift · ${intro.formatted}`}
            className="rounded-full bg-[#14110e] px-6 text-[#f6f1e8] hover:bg-black"
          />
          <Link
            href={h("/studenti")}
            className="rounded-full border border-[#1b1712]/15 px-5 py-2.5 text-sm font-semibold text-[#1b1712] hover:bg-white/60"
          >
            {cs ? "Zpět na desk" : "Back to the desk"}
          </Link>
        </div>
      </div>
    </div>
  );
}
