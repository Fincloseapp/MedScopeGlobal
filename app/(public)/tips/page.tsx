import { redirect } from "next/navigation";

/** Tips / příspěvky live on public articles; VIP Longevity is a separate paid path. */
export default function TipsAliasPage() {
  redirect("/articles");
}
