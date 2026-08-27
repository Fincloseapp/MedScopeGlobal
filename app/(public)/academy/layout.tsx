import type { Metadata } from "next";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
  title: "MedScope Academy — vzdělávání v medicíně",
  description:
    "Interaktivní kurzy, lekce a kvízy pro studenty medicíny a lékaře. Gamifikace, certifikáty a AI generovaný obsah.",
  path: "/academy",
});
}

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="academy-v40 min-h-full bg-[#fafcff]">
      {children}
    </div>
  );
}
