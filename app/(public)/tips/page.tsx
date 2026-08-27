import { redirect } from "next/navigation";

/** Tips / tringelt live on articles; VIP is the paid support path. */
export default function TipsAliasPage() {
  redirect("/vip/protokoly");
}
