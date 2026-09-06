import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { Button } from "@/components/ui/button";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getNotFoundCopy } from "@/lib/i18n/not-found-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";

export default async function NotFound() {
  const locale = await getServerLocale();
  const copy = getNotFoundCopy(locale);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#fafcff] px-4 text-center">
      <MedScopeLogo href={localizePublicHref("/", locale)} preset="header" className="mb-6" />
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#005B96]">{copy.code}</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-[#021d33]">{copy.title}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{copy.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full bg-[#005B96]">
          <Link href={localizePublicHref("/", locale)}>{copy.home}</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={localizePublicHref("/aplikace", locale)}>{copy.apps}</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={localizePublicHref("/dashboard", locale)}>{copy.dashboard}</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={localizePublicHref("/predplatne?trial=1", locale)}>{copy.trial}</Link>
        </Button>
      </div>
    </div>
  );
}
