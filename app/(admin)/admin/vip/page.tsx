import { deactivateVip, upsertVip } from "@/lib/actions/vip";
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
import { createServiceRoleClient } from "@/lib/supabase/service";

async function upsertAction(formData: FormData) {
  "use server";
  await upsertVip({
    user_id: String(formData.get("user_id")),
    active: formData.get("active") === "on",
    starts_at: String(formData.get("starts_at") || "") || null,
    ends_at: String(formData.get("ends_at") || "") || null,
  });
}

async function deactivateAction(formData: FormData) {
  "use server";
  await deactivateVip(String(formData.get("user_id")));
}

export default async function AdminVipPage() {
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("vip_subscriptions")
    .select(
      `
      *,
      users!user_id ( email, full_name )
    `
    )
    .order("created_at", { ascending: false });

  const rows =
    (data ?? []) as {
      user_id: string;
      active: boolean;
      starts_at: string | null;
      ends_at: string | null;
      users: { email: string | null; full_name: string | null } | null;
    }[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">
          VIP subscriptions
        </h1>
        <p className="text-muted-foreground">
          Align manual grants with your billing workflow—every change emits an
          audit record.
        </p>
      </div>

      <form
        action={upsertAction}
        className="grid gap-4 rounded-xl border bg-white p-6 md:grid-cols-2"
      >
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">User ID</label>
          <Input
            name="user_id"
            required
            placeholder="UUID from Supabase Auth / public.users"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Starts</label>
          <Input name="starts_at" type="datetime-local" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Ends</label>
          <Input name="ends_at" type="datetime-local" />
        </div>
        <label className="flex items-center gap-3 text-sm font-medium md:col-span-2">
          <input type="checkbox" name="active" defaultChecked className="h-4 w-4" />
          Active subscription
        </label>
        <div className="md:col-span-2">
          <Button type="submit">Save VIP record</Button>
        </div>
      </form>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.user_id}>
                <TableCell>
                  <div className="font-medium">
                    {row.users?.full_name ?? "Unnamed reader"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {row.users?.email ?? row.user_id}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div>
                    Start:{" "}
                    {row.starts_at
                      ? new Date(row.starts_at).toLocaleString()
                      : "—"}
                  </div>
                  <div>
                    End:{" "}
                    {row.ends_at ? new Date(row.ends_at).toLocaleString() : "—"}
                  </div>
                </TableCell>
                <TableCell>{row.active ? "Active" : "Inactive"}</TableCell>
                <TableCell className="text-right">
                  <form action={deactivateAction}>
                    <input type="hidden" name="user_id" value={row.user_id} />
                    <Button size="sm" variant="outline">
                      Deactivate
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">
            No VIP rows yet—grant access with the form above.
          </p>
        )}
      </div>
    </div>
  );
}
