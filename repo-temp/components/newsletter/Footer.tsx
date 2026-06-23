import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  href?: string;
  showCaption?: boolean;
};

/** v23.3.2 — Logo_Transparent 60px, WebP + retina */
export function NewsletterFooterLogo({ className, href = "/", showCaption = true }: Props) {
  return (
    <div className={cn("newsletter-footer-logo mt-8 flex flex-col items-center", className)}>
      <MedScopeLogo href={href} preset="newsletter-footer" />
      {showCaption ? (
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          MedScopeGlobal — odborný medicínský magazín
        </p>
      ) : null}
    </div>
  );
}

export { NewsletterFooterLogo as NewsletterFooter };
