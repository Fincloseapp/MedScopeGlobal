import Image from "next/image";
import { getPublicTopicImage } from "@/lib/verejnost/images";
import { cn } from "@/lib/utils";

export function PublicModuleImage({
  slug,
  label,
  className,
}: {
  slug: string;
  label: string;
  className?: string;
}) {
  const src = getPublicTopicImage(slug);

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-[#005B96]/15 via-[#021d33]/5 to-slate-100",
          className
        )}
        aria-hidden
      >
        <span className="font-display text-3xl font-bold text-[#005B96]/35">{label.charAt(0)}</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      <Image src={src} alt={label} fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />
    </div>
  );
}
