import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MedScopeLogo } from "@/components/brand/medscope-logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#fafcff] px-4 text-center">
      <MedScopeLogo href="/" preset="header" className="mb-6" />
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#005B96]">
        Chyba 404
      </p>
      <h1 className="mt-4 font-display text-4xl font-bold text-[#021d33]">
        Stránka nebyla nalezena
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Požadovaná stránka na MedScopeGlobal neexistuje nebo byla přesunuta. Zkuste návrat na
        úvodní stránku nebo prohledání obsahu.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full bg-[#005B96]">
          <Link href="/">Domů</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/articles">Články</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/help">Nápověda</Link>
        </Button>
      </div>
    </div>
  );
}
