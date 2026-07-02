import type { Metadata } from "next";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export const metadata: Metadata = buildV20PageMetadata({
  title: "MedScope Academy — vzdělávání v medicíně",
  description:
    "Interaktivní kurzy, lekce a kvízy pro studenty medicíny a lékaře. Gamifikace, certifikáty a AI generovaný obsah.",
  path: "/academy",
});

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="academy-v40 min-h-full bg-[#fafcff]">
      {children}
    </div>
  );
}
