import { redirect } from "next/navigation";

/** Canonical terms live at /terms. */
export default function VopRedirect() {
  redirect("/terms");
}
