import Link from "next/link";
import { BookOpen, Brain, GraduationCap, Trophy } from "lucide-react";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAcademyCounts } from "@/lib/academy/db";

export default async function AdminAcademyDashboardPage() {
  const counts = await getAcademyCounts();

  const stats = [
    { label: "Kurzy", value: counts.courses ?? 0, icon: GraduationCap },
    { label: "Lekce", value: counts.lessons ?? 0, icon: BookOpen },
    { label: "Kvízy", value: counts.quizzes ?? 0, icon: Brain },
    { label: "AI úlohy", value: counts.ai_tasks ?? 0, icon: Brain },
    { label: "Postup uživatelů", value: counts.user_progress ?? 0, icon: Trophy },
    { label: "Certifikáty", value: counts.certificates ?? 0, icon: Trophy },
  ];

  return (
    <div className="mx-auto max-w-5xl p-6">
      <MedScopeLogo href="/admin" preset="admin-sidebar" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-[#021d33]">MedScope Academy</h1>
      <p className="mt-2 text-sm text-slate-600">v35.0 — administrace kurzů a AI pipeline (fáze 1).</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-[#005B96]" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#021d33]">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/academy/courses"
          className="rounded-full bg-[#005B96] px-5 py-2 text-sm font-medium text-white hover:bg-[#004a7a]"
        >
          Správa kurzů
        </Link>
        <Link
          href="/academy"
          className="rounded-full border border-[#cfe1f3] px-5 py-2 text-sm font-medium text-[#005B96] hover:bg-[#f0f7fc]"
        >
          Veřejný náhled
        </Link>
      </div>
    </div>
  );
}
