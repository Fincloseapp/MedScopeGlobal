import Link from "next/link";
import { Crown } from "lucide-react";
import { VerificationForm } from "@/components/account/verification-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VipBadge } from "@/components/vip/vip-badge";
import {
  professionLabel,
  verificationStatusLabel,
} from "@/lib/i18n/labels";
import { ACCESS_LEVELS } from "@/lib/config/access-levels";
import { getSessionProfile } from "@/lib/auth/session";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { normalizeLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { getVipStatus } from "@/lib/vip";
import { cookies } from "next/headers";

export const metadata = { title: "Účet" };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AccountPage({ searchParams }: Props) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);
  const { user, profile } = await getSessionProfile();
  const isVip = await getVipStatus(user?.id);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-semibold text-medical-navy">
          Přihlaste se pro správu účtu a ověření profese.
        </p>
        <Button asChild className="mt-6">
          <Link href="/login">Přihlásit se</Link>
        </Button>
      </div>
    );
  }

  const accessLabel =
    ACCESS_LEVELS.find((l) => l.id === profile?.access_level)?.labelKey ??
    "access.public";
  const professionDisplay = profile?.profession
    ? await professionLabel(locale, profile.profession)
    : "—";
  const verificationStatus = profile?.verification_status ?? "pending";
  const verificationDisplay = await verificationStatusLabel(
    locale,
    verificationStatus
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6">
      {sp.error === "admin_required" && (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          Administrátorský přístup vyžaduje roli admin.
        </p>
      )}
      <div>
        <h1 className="font-display text-4xl font-bold text-medical-navy">
          Můj účet
        </h1>
        <p className="text-muted-foreground">
          {profile?.full_name ?? user.email}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil a přístup</CardTitle>
          <CardDescription>
            Úroveň přístupu a profese z registrace. Úroveň 3 vyžaduje ověření
            dokladu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Úroveň:</span>{" "}
            {t(dict, accessLabel)}
          </p>
          <p>
            <span className="font-medium">Profese:</span> {professionDisplay}
          </p>
          <p>
            <span className="font-medium">Ověření:</span> {verificationDisplay}
          </p>
          <Button asChild variant="link" className="h-auto p-0">
            <Link href="/access-levels">Jak fungují úrovně přístupu →</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ověření profese (úroveň 3)</CardTitle>
          <CardDescription>
            Nahrajte ISIC, diplom nebo lékařskou licenci. Proběhne AI kontrola a
            ruční schválení administrátorem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationForm
            profession={profile?.profession ?? null}
            verificationStatus={verificationStatus}
            documentUrl={profile?.verification_document_url ?? null}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            MedScope VIP {isVip && <VipBadge />}
          </CardTitle>
          <CardDescription>
            VIP odemyká prémiové články a odstraňuje reklamy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVip ? (
            <p className="text-sm text-muted-foreground">
              Předplatné VIP je aktivní.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Pro aktivaci VIP kontaktujte partnerships nebo použijte ceník.
              </p>
              <Button asChild>
                <Link href="mailto:vip@medscopeglobal.example">
                  <Crown className="mr-2 h-4 w-4" />
                  Kontakt VIP
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
