import { redirect } from "next/navigation";
import { ArticleEditor } from "@/components/portal/article-editor";
import { isVerifiedExpert } from "@/lib/portal/rbac";
import { getSessionUser } from "@/lib/portal/request";

export default async function NewArticlePage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  if (!isVerifiedExpert(user)) redirect("/portal/manage");

  return (
    <main className="section">
      <p className="eyebrow">Nový článek</p>
      <h1>Vytvoření nebo generování obsahu</h1>
      <ArticleEditor />
    </main>
  );
}
