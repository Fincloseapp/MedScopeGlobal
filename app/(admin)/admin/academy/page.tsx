import Link from "next/link";
import { Activity, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAcademyCounts } from "@/lib/academy/db";

export const dynamic = "force-dynamic";

export default async function AdminAcademyDashboardPage() {
  let counts: Record<string, number> = {};
  let error: string | null = null;

  try {
    counts = await getAcademyCounts();
  } catch (e) {
    error = (e as Error).message;
  }

  const stats = [
    { label: "Kurzy", value: counts.courses ?? 0, icon: BookOpen },
    { label: "Lekce", value: counts.lessons ?? 0, icon: GraduationCap },
    { label: "Kvízy", value: counts.quizzes ?? 0, icon: Activity },
    { label: "AI úlohy", value: counts.ai_tasks ?? 0, icon: Sparkles },
    { label: "Pokrok uživatelů", value: counts.user_progress ?? 0, icon: Activity },
    { label: "Certifikáty", value: counts.certificates ?? 0, icon: GraduationCap },
  ];

  return (
    <div className="space-y-8">
      <MedScopeLogo href="/admin" width={160} height={40} className="mb-2" />
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">MedScope Academy v35</h1>
        <p className="text-muted-foreground">Přehled tabulek Academy — fáze 1 foundation.</p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700">
            Tabulky možná ještě nejsou migrovány: {error}
          </p>
        ) : null}
      </div>

      <Link
        href="/admin/academy/courses"
        className="inline-flex items-center gap-2 rounded-xl border border-[#005B96]/30 bg-[#005B96]/5 px-4 py-3 text-sm font-medium text-[#021d33] hover:bg-[#005B96]/10"
      >
        <BookOpen className="h-4 w-4 text-[#005B96]" />
        Správa kurzů
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
