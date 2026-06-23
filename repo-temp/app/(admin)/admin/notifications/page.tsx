import {
  broadcastNotificationToVip,
  sendNotificationToUser,
} from "@/lib/actions/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

async function sendUser(formData: FormData) {
  "use server";
  await sendNotificationToUser({
    user_id: String(formData.get("user_id")),
    title: String(formData.get("title")),
    body: String(formData.get("body") ?? "") || null,
    priority: formData.get("priority") === "on",
  });
}

async function broadcast(formData: FormData) {
  "use server";
  await broadcastNotificationToVip({
    title: String(formData.get("title")),
    body: String(formData.get("body") ?? "") || null,
  });
}

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">
          Notifications
        </h1>
        <p className="text-muted-foreground">
          Messages persist in the <code>notifications</code> table and surface
          inside the reader bell.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          action={sendUser}
          className="space-y-4 rounded-xl border bg-white p-6 shadow-sm"
        >
          <h2 className="font-semibold text-medical-navy">Direct message</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium">User ID</label>
            <Input name="user_id" required placeholder="UUID" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input name="title" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Body</label>
            <Textarea name="body" rows={4} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="priority" className="h-4 w-4" />
            Priority alert (VIP workflows)
          </label>
          <Button type="submit">Send to user</Button>
        </form>

        <form
          action={broadcast}
          className="space-y-4 rounded-xl border bg-white p-6 shadow-sm"
        >
          <h2 className="font-semibold text-medical-navy">
            Broadcast to VIP readers
          </h2>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input name="title" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Body</label>
            <Textarea name="body" rows={6} />
          </div>
          <p className="text-xs text-muted-foreground">
            Sends one notification per active VIP seat with priority routing.
          </p>
          <Button type="submit">Broadcast</Button>
        </form>
      </div>
    </div>
  );
}
