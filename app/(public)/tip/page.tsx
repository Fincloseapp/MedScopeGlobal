import { redirect } from "next/navigation";

/**
 * Legacy /tip alias — tips live on magazine articles, not VIP protocols.
 */
export default function TipAliasPage() {
  redirect("/articles");
}
