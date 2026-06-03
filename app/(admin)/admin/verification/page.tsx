import {
  approveVerificationForm,
  rejectVerificationForm,
} from "@/lib/actions/verification";
import { createClient } from "@/lib/supabase/server";
import { verificationStatusLabel } from "@/lib/i18n/labels";
import { normalizeLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Ověření profesí" };

export default async function AdminVerificationPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("users")
    .select(
      "id, email, full_name, profession, verification_status, verification_document_url, access_level"
    )
    .in("verification_status", ["pending", "ai_review"])
    .order("created_at", { ascending: false });

  const pending = rows ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">
          Ověření profesí
        </h1>
        <p className="text-muted-foreground">
          Ruční schválení po AI kontrole dokumentů (úroveň 3 — lékaři).
        </p>
      </div>

      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Žádné žádosti ve frontě (pending / ai_review).
        </p>
      ) : (
        <ul className="space-y-4">
          {await Promise.all(
            pending.map(async (u) => {
              const statusLabel = await verificationStatusLabel(
                locale,
                u.verification_status
              );
              return (
            <li key={u.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{u.full_name ?? u.email ?? u.id}</CardTitle>
                  <CardDescription>
                    {u.profession} · {statusLabel} · úroveň {u.access_level}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  {u.verification_document_url && (
                    <a
                      href={u.verification_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary underline"
                    >
                      Doklad
                    </a>
                  )}
                  <form action={approveVerificationForm}>
                    <input type="hidden" name="userId" value={u.id} />
                    <Button type="submit" size="sm">
                      Schválit
                    </Button>
                  </form>
                  <form action={rejectVerificationForm}>
                    <input type="hidden" name="userId" value={u.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Zamítnout
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
