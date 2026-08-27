import { redirect } from "next/navigation";

/**
 * Legacy /donate alias — tips & donations live on magazine articles,
 * not VIP. Keep aligned with next.config `/donate` → `/articles`.
 */
export default function DonateAliasPage() {
  redirect("/articles");
}
