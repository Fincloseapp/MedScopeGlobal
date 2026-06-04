import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { listDocumentationVersions } from "@/lib/queries/v4c/documentation";

export const metadata: Metadata = { title: "Dokumentace", description: "V4a–V4d release notes." };

export default async function DokumentacePage() {
  const versions = await listDocumentationVersions();

  return (
    <ModulePageShell
      eyebrow="Docs"
      title="Dokumentace MedScopeGlobal"
      description="Přehled verzí platformy a implementovaných modulů."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["v4a", "v4b", "v4c", "v4d"].map((v) => (
          <Link
            key={v}
            href={`/dokumentace/${v}`}
            className="rounded-2xl border border-[#cfe1f3] bg-white p-5 hover:shadow-md"
          >
            <p className="font-display text-lg font-semibold uppercase">{v}</p>
            <p className="mt-2 text-sm text-slate-600">
              {versions.find((x) => x.version === v) ? "Dostupné v databázi" : "Statický přehled"}
            </p>
          </Link>
        ))}
      </div>
    </ModulePageShell>
  );
}
