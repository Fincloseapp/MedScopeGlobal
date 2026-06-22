import { Crown, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPaywallPreviewHtml, VIP_TRIAL_DAYS } from "@/lib/vip";

export function ArticleBody({
  html,
  locked,
  title,
}: {
  html: string;
  locked: boolean;
  title?: string;
}) {
  if (locked) {
    const previewHtml = getPaywallPreviewHtml(html);
    return (
      <>
        {previewHtml ? (
          <div className="relative">
            <div
              className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-primary prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"
              aria-hidden
            />
          </div>
        ) : null}
        <div
          className={`rounded-2xl border border-dashed border-[#005B96]/30 bg-[#f0f7ff]/50 px-6 py-10 text-center ${previewHtml ? "mt-6" : ""}`}
        >
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-900">
            <Lock className="h-7 w-7" aria-hidden />
          </span>
          <p className="mt-4 font-display text-xl font-semibold text-[#021d33]">
            {title ? `Pokračování: ${title}` : "Pokračování článku je v prémiovém obsahu"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Tento článek je součástí VIP obsahu. Vyzkoušejte {VIP_TRIAL_DAYS} dní zdarma — plný
            přístup k odborným článkům, AI asistentům a obsahu bez reklam.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-[#005B96] hover:bg-[#004a7a]">
              <Link href="/predplatne">
                <Crown className="mr-2 h-4 w-4" aria-hidden />
                Vyzkoušet {VIP_TRIAL_DAYS} dní zdarma
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup">Registrace</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-primary prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
