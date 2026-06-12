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

const REASON_COPY: Record<OdbornaGateReason, { title: string; body: string }> = {
  login: {
    title: "Přihlášení vyžadováno",
    body: "Odborná sekce je dostupná pouze registrovaným uživatelům.",
  },
  verify: {
    title: "Ověření ČLK",
    body: "Pro přístup k odbornému obsahu ověřte evidenční číslo v registru ČLK.",
  },
  pending: {
    title: "Čeká na schválení",
    body: "Vaše žádost o ověření ČLK byla přijata a čeká na kontrolu.",
  },
  rejected: {
    title: "Ověření zamítnuto",
    body: "Evidenční číslo nebylo potvrzeno. Kontaktujte podporu nebo zkuste znovu.",
  },
};

export function OdbornaGate({
  reason,
  clkStatus,
}: {
  reason: OdbornaGateReason;
  clkStatus?: {
    status: string;
    clkNumber?: string;
  } | null;
}) {
  const copy = REASON_COPY[reason];

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
                <Link href="/login?next=/odborna">Přihlásit se</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup">Registrace</Link>
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
            <Link href="/access-levels#overeni">Jak fungují úrovně přístupu →</Link>
          </Button>
        </CardContent>
      </Card>
      <ProfessionalDisclaimer />
    </div>
  );
}
