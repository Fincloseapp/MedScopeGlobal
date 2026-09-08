"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** After a successful tip/donate return, show immediately. */
  forceVisible?: boolean;
};

/**
 * Reveals the author-support box only after the reader reaches the end of the article.
 */
export function AfterArticleRead({ children, forceVisible = false }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const [seenEnd, setSeenEnd] = useState(forceVisible);

  useEffect(() => {
    if (forceVisible || tipReturnForcesVisible()) {
      setSeenEnd(true);
      return;
    }
    const node = endRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setSeenEnd(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeenEnd(true);
      },
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [forceVisible]);

  return (
    <>
      <div ref={endRef} data-article-read-end="" aria-hidden className="h-px w-full" />
      {seenEnd ? children : null}
    </>
  );
}

export function tipReturnForcesVisible(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("tip") === "1" || params.get("donated") === "1";
}
