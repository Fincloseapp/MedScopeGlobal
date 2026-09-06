import { NovinkyTagPage } from "@/components/novinky/novinky-tag-page";

export default async function Page() {
  return <NovinkyTagPage tag="univerzity" hrefForItem={(slug) => `/novinky/univerzity/${slug}`} />;
}
