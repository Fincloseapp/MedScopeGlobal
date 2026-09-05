import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { ClkVerifyForm } from "@/components/odborna/clk-verify-form";
import { ProfessionalDisclaimer } from "@/components/odborna/professional-disclaimer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OdbornaGateReason } from "@/lib/auth/odborna-access";
import { getOdbornaHubCopy } from "@/lib/i18n/odborna-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function OdbornaGate({
  reason,
  clkStatus,
  locale = "cs",
}: {
  reason: OdbornaGateReason;
  clkStatus?: {
    status: string;
    clkNumber?: string;
  } | null;
  locale?: string;
}) {
  const pack = getOdbornaHubCopy(locale);
  const copy =
    reason === "login"
      ? { title: pack.gateLoginTitle, body: pack.gateLoginBody }
      : reason === "verify"
        ? { title: pack.gateVerifyTitle, body: pack.gateVerifyBody }
        : reason === "pending"
          ? { title: pack.gatePendingTitle, body: pack.gatePendingBody }
          : { title: pack.gateRejectedTitle, body: pack.gateRejectedBody };

  return (
    <div className="space-y-6">
      <Card className="border-[#cfe1f3]">
        <CardHeader>
          <div className="flex items-center gap-2 text-[#005B96]">
            <ShieldAlert className="h-5 w-5" aria-hidden />
            <CardTitle>{copy.title}</CardTitle>
          </div>
          <CardDescription>{copy.body}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reason === "login" && (
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={localizePublicHref("/login?next=/odborna", locale)}>{pack.signIn}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizePublicHref("/signup", locale)}>{pack.register}</Link>
              </Button>
            </div>
          )}
          {reason !== "login" && (
            <ClkVerifyForm
              initialStatus={clkStatus?.status}
              clkNumber={clkStatus?.clkNumber}
            />
          )}
          <Button asChild variant="link" className="h-auto p-0">
            <Link href={localizePublicHref("/access-levels#overeni", locale)}>{pack.accessHow}</Link>
          </Button>
        </CardContent>
      </Card>
      <ProfessionalDisclaimer />
    </div>
  );
}
