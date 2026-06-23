import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/types/database";

export async function getArticleForAdmin(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getArticleForAdmin", error);
    return null;
  }

  return data as Article | null;
}
