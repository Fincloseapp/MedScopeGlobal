import type { Metadata } from "next";
import Link from "next/link";
import { PRICING, SITE } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Pricing",
};

export default async function PricingPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);

  const plans = [
    {
      id: "basic",
      name: t(dict, "pricing.basic"),
      price: `${PRICING.basicMonthlyCzk} CZK`,
      period: "/ month",
      features: [
        "Educational articles & prevention",
        "Personalized feed (basic)",
        "Email digests",
      ],
    },
    {
      id: "vip",
      name: t(dict, "pricing.vip"),
      price: `${PRICING.vipMonthlyCzk} CZK`,
      period: "/ month",
      highlighted: true,
      features: [
        "All Basic features",
        "VIP investigations & early alerts",
        "Ad-free reading",
        "Priority notifications",
      ],
    },
    {
      id: "yearly",
      name: t(dict, "pricing.yearly"),
      price: `${PRICING.yearlyCzk} CZK`,
      period: "/ year",
      features: [
        "VIP access for 12 months",
        "Best value vs monthly VIP",
        `${PRICING.trialDays}-day trial on first signup (when Stripe enabled)`,
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-[#005B96]">
          {t(dict, "pricing.title")}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {SITE.name} — {PRICING.trialDays} {t(dict, "pricing.trial")}
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={
              plan.highlighted
                ? "border-[#005B96] shadow-lg ring-2 ring-[#005B96]/20"
                : ""
            }
          >
            <CardHeader>
              <CardTitle className="font-display text-2xl text-[#005B96]">
                {plan.name}
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full bg-[#005B96] hover:bg-[#004a7a]"
              >
                <Link href="/signup">{t(dict, "pricing.cta")}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        Stripe Billing checkout will activate after{" "}
        <code className="rounded bg-muted px-1">STRIPE_SECRET_KEY</code> is set.
        See <Link href="/welcome" className="text-[#005B96] underline">platform overview</Link>.
      </p>
    </div>
  );
}
