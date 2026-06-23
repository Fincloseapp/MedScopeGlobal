import { createServiceRoleClient } from "@/lib/supabase/service";
import { extractWithAi, slugifyV4c } from "@/lib/v4c/ai-extract";

export async function generateNewsletterIssue() {
  const admin = createServiceRoleClient();
  const issueDate = new Date().toISOString().slice(0, 10);
  const title = `MedScopeGlobal Newsletter — ${issueDate}`;

  const [articles, studies, legislation, drugNews, dh, uniNews, ads] = await Promise.all([
    admin.from("articles").select("title, slug, excerpt").eq("published", true).limit(5),
    admin.from("studies").select("title, id, summary").eq("published", true).limit(5),
    admin.from("legislation_items").select("title, slug, summary").eq("published", true).limit(4),
    admin.from("drug_news").select("title, slug, summary").eq("published", true).limit(4),
    admin.from("digital_health_items").select("title, slug, summary").eq("published", true).limit(3),
    admin.from("university_news").select("title, slug, summary").eq("published", true).limit(4),
    admin
      .from("ads")
      .select("title, company, ad_text, image_url, target_url, link_url")
      .eq("active", true)
      .eq("include_in_newsletter", true)
      .limit(5),
  ]);

  const rawOutline = JSON.stringify({
    articles: articles.data,
    studies: studies.data,
    legislation: legislation.data,
    drugNews: drugNews.data,
    digitalHealth: dh.data,
    universityNews: uniNews.data,
    ads: ads.data,
  });

  const ai = await extractWithAi("newsletter", {
    title,
    raw: rawOutline.slice(0, 8000),
  });

  const sections = (ai.sections as { title: string; items: string[] }[]) ?? [];
  const htmlParts = sections.map(
    (s) => `<section><h2>${s.title}</h2><ul>${(s.items ?? []).map((i) => `<li>${i}</li>`).join("")}</ul></section>`
  );

  if ((ads.data ?? []).length) {
    htmlParts.push(
      `<section><h2>Partneři</h2>${(ads.data ?? [])
        .map(
          (a) =>
            `<p><strong>${a.company ?? a.title}</strong> — ${a.ad_text ?? ""} <a href="${a.target_url ?? a.link_url ?? "#"}">více</a></p>`
        )
        .join("")}</section>`
    );
  }

  const html_content = htmlParts.join("\n") || `<p>${(ai.summary as string) ?? "Newsletter"}</p>`;
  const pdf_text =
    (ai.pdf_text_outline as string) ??
    `PDF OUTLINE\n${title}\n\n${html_content.replace(/<[^>]+>/g, " ").slice(0, 12000)}`;

  const slug = slugifyV4c(`newsletter-${issueDate}`);

  const { data, error } = await admin
    .from("newsletters")
    .insert({
      title: (ai.title as string) ?? title,
      slug,
      issue_date: issueDate,
      html_content,
      pdf_text,
      layout_json: ai,
      published: true,
      admin_only: false,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data?.id, slug };
}
