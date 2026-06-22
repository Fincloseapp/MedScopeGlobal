import { Newspaper, Tags, Megaphone, Crown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    articles,
    categories,
    ads,
    vip,
    notifications,
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("ads").select("*", { count: "exact", head: true }),
    supabase
      .from("vip_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    supabase.from("notifications").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      label: "Articles",
      value: articles.count ?? 0,
      icon: Newspaper,
      hint: "Includes drafts",
    },
    {
      label: "Categories",
      value: categories.count ?? 0,
      icon: Tags,
      hint: "Taxonomy",
    },
    {
      label: "Ads",
      value: ads.count ?? 0,
      icon: Megaphone,
      hint: "Total rows",
    },
    {
      label: "Active VIP",
      value: vip.count ?? 0,
      icon: Crown,
      hint: "Subscriptions",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">
          Operations overview
        </h1>
        <p className="text-muted-foreground">
          Live counts from Supabase. Notifications logged:{" "}
          <span className="font-semibold text-foreground">
            {notifications.count ?? 0}
          </span>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
