import Image from "next/image";
import { MAGAZINE } from "@/lib/brand/magazine";
import { editionCoverAlt, type EditionCover } from "@/lib/brand/edition-covers";
import { briefChrome } from "@/lib/monetization/brief-marketing";

export function MagazineTitleSpread({
  cover,
  locale,
}: {
  cover: EditionCover;
  locale: string;
}) {
  const chrome = briefChrome(locale);
  return (
    <figure className="article-title-spread">
      <Image
        src={cover.src}
        alt={editionCoverAlt(locale)}
        fill
        priority
        className="object-cover"
        sizes="(max-width:768px) 100vw, 720px"
      />
      <div className="article-title-spread-veil" />
      <figcaption className="article-title-spread-caption">
        <p className="article-title-spread-brand">{MAGAZINE.name}</p>
        <p className="article-title-spread-line">{chrome.brandLine}</p>
        <p className="article-title-spread-site">{MAGAZINE.domain}</p>
      </figcaption>
    </figure>
  );
}
