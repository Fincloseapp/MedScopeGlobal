import Image from "next/image";
import { deleteMediaAsset } from "@/lib/storage/upload";
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
import { uploadMediaAsset } from "@/lib/storage/upload";
import type { MediaRow } from "@/types/database";

async function uploadAction(formData: FormData) {
  "use server";
  await uploadMediaAsset(formData);
}

async function deleteAction(formData: FormData) {
  "use server";
  await deleteMediaAsset(String(formData.get("id")));
}

export default async function AdminMediaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as MediaRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">
          Media library
        </h1>
        <p className="text-muted-foreground">
          Files upload to the public <code>media</code> bucket and register in the{" "}
          <code>media</code> table.
        </p>
      </div>

      <form
        action={uploadAction}
        encType="multipart/form-data"
        className="flex flex-wrap items-end gap-4 rounded-xl border bg-white p-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="file">
            Upload asset
          </label>
          <InputFile />
        </div>
        <Button type="submit">Upload</Button>
      </form>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="w-32">
                  <div className="relative h-16 w-24 overflow-hidden rounded-md bg-muted">
                    {row.mime_type?.startsWith("image/") ? (
                      <Image
                        src={row.public_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                        File
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-xl break-all text-xs">
                  {row.public_url}
                </TableCell>
                <TableCell className="text-right">
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <Button size="sm" variant="ghost" className="text-destructive">
                      Delete
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">
            Uploads will appear here with their Supabase public URLs.
          </p>
        )}
      </div>
    </div>
  );
}

function InputFile() {
  return (
    <input
      id="file"
      name="file"
      type="file"
      accept="image/*"
      required
      className="text-sm"
    />
  );
}
