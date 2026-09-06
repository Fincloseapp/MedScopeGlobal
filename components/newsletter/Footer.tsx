import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MAGAZINE } from "@/lib/brand/magazine";

type Props = {
  className?: string;
  href?: string;
  showCaption?: boolean;
  caption?: string;
};

/** Compact ViaLongeVita masthead for issue footers */
export function NewsletterFooterLogo({
  className,
  href = "/",
  showCaption = true,
  caption,
}: Props) {
  return (
    <div className={cn("newsletter-footer-logo mt-8 flex flex-col items-center", className)}>
      <Link href={href} className="inline-block">
        <Image
          src={MAGAZINE.emailLockup}
          alt={MAGAZINE.name}
          width={1200}
          height={340}
          className="mx-auto h-auto w-full max-w-[320px] object-contain"
        />
      </Link>
      {showCaption ? (
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          {caption ?? `${MAGAZINE.name} · ${MAGAZINE.domain}`}
        </p>
      ) : null}
    </div>
  );
}

export { NewsletterFooterLogo as NewsletterFooter };
