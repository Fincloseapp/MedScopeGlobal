import { deleteAd, saveAd, setAdActive } from "@/lib/actions/ads";
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
import type { AdRow } from "@/types/database";

async function createAd(formData: FormData) {
  "use server";
  await saveAd({
    title: String(formData.get("title")),
    image_url: String(formData.get("image_url")),
    link_url: String(formData.get("link_url") ?? "") || null,
    active: formData.get("active") === "on",
    placement: String(formData.get("placement") ?? "") || null,
  });
}

async function updateAd(formData: FormData) {
  "use server";
  await saveAd({
    id: String(formData.get("id")),
    title: String(formData.get("title")),
    image_url: String(formData.get("image_url")),
    link_url: String(formData.get("link_url") ?? "") || null,
    active: formData.get("active") === "on",
    placement: String(formData.get("placement") ?? "") || null,
  });
}

async function removeAd(formData: FormData) {
  "use server";
  await deleteAd(String(formData.get("id")));
}

async function toggleActive(formData: FormData) {
  "use server";
  await setAdActive(
    String(formData.get("id")),
    formData.get("active") === "true"
  );
}

export default async function AdminAdsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });

  const ads = (data ?? []) as AdRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">
          Advertising partners
        </h1>
        <p className="text-muted-foreground">
          Partner placements respect VIP ad-free reading automatically on the
          public site.
        </p>
      </div>

      <form
        action={createAd}
        className="grid gap-4 rounded-xl border bg-white p-6 md:grid-cols-2"
      >
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Title</label>
          <Input name="title" required placeholder="Digital pathology summit" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Image URL</label>
          <Input name="image_url" required placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Link URL</label>
          <Input name="link_url" placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Placement tag</label>
          <Input name="placement" placeholder="sidebar_primary" />
        </div>
        <label className="flex items-center gap-3 text-sm font-medium md:col-span-2">
          <input type="checkbox" name="active" className="h-4 w-4" />
          Active immediately
        </label>
        <div className="md:col-span-2">
          <Button type="submit">Create placement</Button>
        </div>
      </form>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creative</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell colSpan={3}>
                  <form action={updateAd} className="grid gap-4 md:grid-cols-5">
                    <input type="hidden" name="id" value={ad.id} />
                    <Input name="title" defaultValue={ad.title} />
                    <Input name="image_url" defaultValue={ad.image_url} />
                    <Input name="link_url" defaultValue={ad.link_url ?? ""} />
                    <Input
                      name="placement"
                      defaultValue={ad.placement ?? ""}
                      placeholder="Placement"
                    />
                    <label className="flex items-center gap-2 text-xs font-medium">
                      <input
                        type="checkbox"
                        name="active"
                        defaultChecked={ad.active}
                        className="h-4 w-4"
                      />
                      Active
                    </label>
                    <div className="flex flex-wrap gap-2 md:col-span-5">
                      <Button type="submit" size="sm">
                        Save changes
                      </Button>
                    </div>
                  </form>
                  <div className="mt-3 flex flex-wrap justify-between gap-3">
                    <form action={toggleActive}>
                      <input type="hidden" name="id" value={ad.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={(!ad.active).toString()}
                      />
                      <Button type="submit" size="sm" variant="outline">
                        Toggle active flag
                      </Button>
                    </form>
                    <form action={removeAd}>
                      <input type="hidden" name="id" value={ad.id} />
                      <Button size="sm" variant="ghost" className="text-destructive">
                        Delete
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {ads.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">
            Create partner placements to monetize non-VIP sessions.
          </p>
        )}
      </div>
    </div>
  );
}
