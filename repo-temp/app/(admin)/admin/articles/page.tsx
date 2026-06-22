import Link from "next/link";
import { Eye, Pencil, Trash } from "lucide-react";
import { articleListAction } from "@/lib/actions/articles";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/types/database";

export default async function AdminArticlesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      categories ( name )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const articles = (data ?? []) as (Article & {
    categories: { name: string } | null;
  })[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-medical-navy">
            Articles
          </h1>
          <p className="text-muted-foreground">
            Draft, publish, and route clinical coverage.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">New article</Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.categories?.name ?? "—"}</TableCell>
                <TableCell>
                  <form action={articleListAction}>
                    <input type="hidden" name="intent" value="toggle" />
                    <input type="hidden" name="id" value={article.id} />
                    <input
                      type="hidden"
                      name="published"
                      value={(!article.published).toString()}
                    />
                    <Button type="submit" variant="outline" size="sm">
                      {article.published ? "Published" : "Draft"}
                    </Button>
                  </form>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/article/${article.slug}`} target="_blank">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/articles/${article.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <form action={articleListAction}>
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={article.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {articles.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">
            No articles yet. Create your first briefing.
          </p>
        )}
      </div>
    </div>
  );
}
