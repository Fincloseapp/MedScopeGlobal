import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search MedScopeGlobal clinical reporting archive.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
