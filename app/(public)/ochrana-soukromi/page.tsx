import { redirect } from "next/navigation";

/** Czech alias to canonical privacy path. */
export default function OchranaSoukromiRedirect() {
  redirect("/privacy");
}