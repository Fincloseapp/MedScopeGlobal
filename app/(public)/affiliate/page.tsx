import { redirect } from "next/navigation";

/** Standalone /affiliate hub is in-article (/go/*). Point guessers at apps. */
export default function AffiliateAliasPage() {
  redirect("/aplikace");
}
