import { createServiceRoleClient } from "@/lib/supabase/service";
import { listAllCoursesAdmin } from "@/lib/academy/db";

export type WeeklyDigestItem = {
  type: "course" | "lesson" | "simulation";
  title: string;
  slug: string;
  url: string;
};

export type WeeklyDigest = {
  subject: string;
  intro: string;
  items: WeeklyDigestItem[];
  generatedAt: string;
};

/** Builds Academy weekly digest content from recent published material. */
export async function generateWeeklyDigest(): Promise<WeeklyDigest> {
  const admin = createServiceRoleClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com";

  const [courses, lessons, simulations] = await Promise.all([
    listAllCoursesAdmin().then((rows) => rows.filter((c) => c.status === "published").slice(0, 5)),
    admin
      .from("lessons")
      .select("title, slug, course_id")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(5)
      .then(({ data }) => data ?? []),
    admin
      .from("clinical_simulations")
      .select("title, slug")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(3)
      .then(({ data }) => data ?? []),
  ]);

  const items: WeeklyDigestItem[] = [
    ...courses.map((c) => ({
      type: "course" as const,
      title: c.title,
      slug: c.slug,
      url: `${baseUrl}/academy/courses/${c.slug}`,
    })),
    ...lessons.map((l) => ({
      type: "lesson" as const,
      title: l.title,
      slug: l.slug,
      url: `${baseUrl}/academy/courses`,
    })),
    ...simulations.map((s) => ({
      type: "simulation" as const,
      title: s.title,
      slug: s.slug,
      url: `${baseUrl}/academy/ai-simulations/${s.slug}`,
    })),
  ];

  return {
    subject: "MedScope Academy — týdenní přehled",
    intro: "Novinky z Academy za poslední týden: kurzy, lekce a klinické simulace.",
    items,
    generatedAt: new Date().toISOString(),
  };
}

/** Persists digest as a marketing event for downstream email/newsletter workers. */
export async function persistWeeklyDigest(digest: WeeklyDigest): Promise<string | null> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("marketing_events")
    .insert({
      event_type: "academy_weekly_digest",
      status: "pending",
      payload: digest,
      scheduled_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[academy] persistWeeklyDigest", error.message);
    return null;
  }
  return data.id as string;
}
