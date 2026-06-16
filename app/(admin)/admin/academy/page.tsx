import { BookOpen, Brain, GraduationCap, Trophy } from "lucide-react";
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
    <>
      <p className="text-sm text-slate-600">
        Přehled Academy v35 — API, admin sekce a homepage integrace (fáze 2).
      </p>

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
    </>
  );
}
