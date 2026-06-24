import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">
        MedScopeGlobal
      </p>
      <h1 className="mt-4 font-display text-4xl font-bold text-medical-navy">
        Page not located in archive
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The requested briefing could not be matched. Try returning home or
        running a search across recent reporting.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Return home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/search">Search archive</Link>
        </Button>
      </div>
    </div>
  );
}
