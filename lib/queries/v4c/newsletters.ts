import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type NewsletterRow = {
  id: string;
  title: string;
  slug: string;
  issue_date: string;
  html_content: string | null;
  pdf_text: string | null;
  pdf_url: string | null;
  published: boolean;
  admin_only: boolean;
  created_at: string;
};

export async function getLatestNewsletter() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .select("*")
    .eq("published", true)
    .eq("admin_only", false)
    .order("issue_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as NewsletterRow;
}

export async function getNewsletterArchive(admin = false) {
  const supabase = admin ? createServiceRoleClient() : await createClient();
  let q = supabase.from("newsletters").select("*").order("issue_date", { ascending: false });
  if (!admin) {
    q = q.eq("published", true).eq("admin_only", false);
  }
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as NewsletterRow[];
}
