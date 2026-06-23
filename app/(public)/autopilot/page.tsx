import { redirect } from "next/navigation";

export default function AutopilotPublicRedirect() {
  redirect("/admin/autopilot");
}
