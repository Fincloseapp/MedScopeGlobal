import { redirect } from "next/navigation";

/** Czech alias to canonical terms path. */
export default function PodminkyRedirect() {
  redirect("/terms");
}