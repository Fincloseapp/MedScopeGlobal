"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { getShareCopy } from "@/lib/i18n/share-copy";
import { officialProfile } from "@/lib/social/profiles";
import { buildShareIntents, publicAbsoluteUrl } from "@/lib/social/share-intents";

export function SocialShareStrip({
  title,
  path,
  locale = "cs",
  showNative = true,
}: {
  title: string;
  path: string;
  locale?: string;
  showNative?: boolean;
}) {
  const copy = getShareCopy(locale);
  const [note, setNote] = useState<string | null>(null);
  const url =
    typeof window === "undefined"
      ? publicAbsoluteUrl(path, locale)
      : publicAbsoluteUrl(path, locale, window.location.origin);
  const intents = buildShareIntents({ title, url });
  const instagram = officialProfile("instagram");
  const youtube = officialProfile("youtube");

  async function copyLink(message: string) {
    try {
      await navigator.clipboard.writeText(url);
      setNote(message);
    } catch {
      setNote(url);
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await copyLink(copy.copied);
  }

  const btn =
    "inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-[#005B96]/40 hover:text-[#005B96]";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={copy.aria}>
        {showNative ? (
          <button type="button" onClick={() => void nativeShare()} className={btn}>
            <Share2 className="mr-1 h-3.5 w-3.5" aria-hidden />
            {copy.native}
          </button>
        ) : null}
        <a href={intents.facebook} target="_blank" rel="noopener noreferrer" className={btn}>
          {copy.facebook}
        </a>
        <a href={intents.whatsapp} target="_blank" rel="noopener noreferrer" className={btn}>
          {copy.whatsapp}
        </a>
        <a href={intents.linkedin} target="_blank" rel="noopener noreferrer" className={btn}>
          {copy.linkedin}
        </a>
        <button
          type="button"
          onClick={() => {
            void copyLink(copy.instagramCopied);
            if (instagram) window.open(instagram, "_blank", "noopener,noreferrer");
          }}
          className={btn}
          title={copy.instagramHint}
        >
          {copy.instagram}
        </button>
        {youtube ? (
          <a href={youtube} target="_blank" rel="noopener noreferrer" className={btn}>
            {copy.youtube}
          </a>
        ) : null}
        <button type="button" onClick={() => void copyLink(copy.copied)} className={btn}>
          {copy.copyLink}
        </button>
      </div>
      {note ? <p className="mt-2 text-xs text-slate-500">{note}</p> : null}
    </div>
  );
}
