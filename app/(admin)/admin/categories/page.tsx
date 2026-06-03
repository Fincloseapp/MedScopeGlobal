import { deleteCategory, saveCategory } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";

async function createCategory(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "");
  if (!name.trim()) return;
  await saveCategory({
    name,
    description: String(formData.get("description") ?? "") || null,
  });
}

async function updateCategory(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await saveCategory({
    id,
    name: String(formData.get("name")),
    slug: String(formData.get("slug") ?? "") || undefined,
    description: String(formData.get("description") ?? "") || null,
  });
}

async function removeCategory(formData: FormData) {
  "use server";
  await deleteCategory(String(formData.get("id")));
}

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const categories = (data ?? []) as Category[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">
          Categories
        </h1>
        <p className="text-muted-foreground">
          Control taxonomy for specialty desks and SEO slugs.
        </p>
      </div>

      <form
        action={createCategory}
        className="grid gap-4 rounded-xl border bg-white p-6 md:grid-cols-3"
      >
        <div className="space-y-2 md:col-span-1">
          <label className="text-sm font-medium" htmlFor="name">
            New category name
          </label>
          <Input id="name" name="name" required placeholder="Cardiovascular care" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <Input
            id="description"
            name="description"
            placeholder="Optional SEO summary"
          />
        </div>
        <div className="md:col-span-3">
          <Button type="submit">Create category</Button>
        </div>
      </form>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell colSpan={3}>
                  <form
                    action={updateCategory}
                    className="grid gap-4 md:grid-cols-4"
                  >
                    <input type="hidden" name="id" value={category.id} />
                    <Input name="name" defaultValue={category.name} required />
                    <Input name="slug" defaultValue={category.slug} />
                    <Input
                      name="description"
                      defaultValue={category.description ?? ""}
                      placeholder="Description"
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="submit" size="sm" variant="secondary">
                        Save
                      </Button>
                    </div>
                  </form>
                  <form action={removeCategory} className="mt-3 flex justify-end">
                    <input type="hidden" name="id" value={category.id} />
                    <Button size="sm" variant="ghost" className="text-destructive">
                      Delete
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {categories.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">
            No categories yet—create one above.
          </p>
        )}
      </div>
    </div>
  );
}
