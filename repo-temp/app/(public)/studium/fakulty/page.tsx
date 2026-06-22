import { redirect } from "next/navigation";

/** Alias — katalog fakult je na /studium/univerzity */
export default function FakultyRedirectPage() {
  redirect("/studium/univerzity");
}
