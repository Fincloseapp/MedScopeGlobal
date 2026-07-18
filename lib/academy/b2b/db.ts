import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { B2BCourse, CourseModule, PartnerInstitution } from "@/types/academy-b2b";

export async function listPartnerInstitutions(): Promise<PartnerInstitution[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partner_institutions")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("[academy-b2b] listPartnerInstitutions", error.message);
    return [];
  }
  return (data ?? []) as PartnerInstitution[];
}

export async function getPartnerInstitution(
  idOrSlug: string
): Promise<PartnerInstitution | null> {
  const admin = createServiceRoleClient();
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      idOrSlug
    );

  const query = admin.from("partner_institutions").select("*");
  const { data, error } = isUuid
    ? await query.eq("id", idOrSlug).maybeSingle()
    : await query.eq("slug", idOrSlug).maybeSingle();

  if (error || !data) return null;
  return data as PartnerInstitution;
}

export async function listAccreditedCmeCourses(limit = 50): Promise<B2BCourse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id, slug, title, description, status, cover_image_url,
      accreditation_number, credits_count, partner_institution_id,
      requires_verified_doctor, passing_threshold,
      partner_institutions ( id, name, slug, logo_url, contact_email, is_active, metadata, created_at, updated_at )
    `
    )
    .eq("status", "published")
    .eq("requires_verified_doctor", true)
    .not("accreditation_number", "is", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[academy-b2b] listAccreditedCmeCourses", error.message);
    return listAccreditedCmeCoursesFlat(limit);
  }

  return (data ?? []).map((row) => {
    const partnerRaw = row.partner_institutions as PartnerInstitution | PartnerInstitution[] | null;
    const partner = Array.isArray(partnerRaw) ? partnerRaw[0] ?? null : partnerRaw;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      status: row.status,
      cover_image_url: row.cover_image_url,
      accreditation_number: row.accreditation_number,
      credits_count: row.credits_count ?? 0,
      partner_institution_id: row.partner_institution_id,
      requires_verified_doctor: row.requires_verified_doctor ?? true,
      passing_threshold: row.passing_threshold ?? 80,
      partner,
    } satisfies B2BCourse;
  });
}

async function listAccreditedCmeCoursesFlat(limit: number): Promise<B2BCourse[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("courses")
    .select("*")
    .eq("status", "published")
    .eq("requires_verified_doctor", true)
    .not("accreditation_number", "is", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[academy-b2b] listAccreditedCmeCoursesFlat", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    status: row.status,
    cover_image_url: row.cover_image_url,
    accreditation_number: row.accreditation_number,
    credits_count: row.credits_count ?? 0,
    partner_institution_id: row.partner_institution_id,
    requires_verified_doctor: row.requires_verified_doctor ?? true,
    passing_threshold: row.passing_threshold ?? 80,
    partner: null,
  }));
}

export async function getAccreditedCourseBySlug(
  slug: string
): Promise<(B2BCourse & { modules: CourseModule[] }) | null> {
  const admin = createServiceRoleClient();
  const { data: course, error } = await admin
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("requires_verified_doctor", true)
    .maybeSingle();

  if (error || !course) return null;

  const [{ data: modules }, partner] = await Promise.all([
    admin
      .from("course_modules")
      .select("*")
      .eq("course_id", course.id)
      .order("sort_order", { ascending: true }),
    course.partner_institution_id
      ? getPartnerInstitution(course.partner_institution_id as string)
      : Promise.resolve(null),
  ]);

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    status: course.status,
    cover_image_url: course.cover_image_url,
    accreditation_number: course.accreditation_number,
    credits_count: course.credits_count ?? 0,
    partner_institution_id: course.partner_institution_id,
    requires_verified_doctor: course.requires_verified_doctor ?? true,
    passing_threshold: course.passing_threshold ?? 80,
    partner,
    modules: (modules ?? []) as CourseModule[],
  };
}

export async function listPartnerMemberships(userId: string): Promise<
  Array<{ partner: PartnerInstitution; role: string }>
> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("partner_institution_members")
    .select("role, partner_institution_id")
    .eq("user_id", userId);

  if (error || !data?.length) return [];

  const results: Array<{ partner: PartnerInstitution; role: string }> = [];
  for (const row of data) {
    const partner = await getPartnerInstitution(row.partner_institution_id as string);
    if (partner) results.push({ partner, role: row.role as string });
  }
  return results;
}
