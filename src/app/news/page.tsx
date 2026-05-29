import type { Metadata } from "next";
import ArticlesPage from "@/app/articles/page";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Novinky",
  description: "Aktuální medicínské články a novinky z ověřených zdrojů."
};

export const dynamic = "force-dynamic";

export default async function NewsPage({ searchParams }: { searchParams: SearchParams }) {
  return ArticlesPage({ searchParams });
}
