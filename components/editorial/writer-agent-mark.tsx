import type { WriterAgent, WriterAgentMarkKind } from "@/lib/editorial/writer-agents";

function Glyph({ kind }: { kind: WriterAgentMarkKind }) {
  switch (kind) {
    case "lifestyle":
      return (
        <>
          <circle cx="16" cy="13" r="5" fill="currentColor" />
          <path d="M8 26c2.5-6 6-9 8-9s5.5 3 8 9" fill="currentColor" opacity="0.85" />
        </>
      );
    case "clinical":
      return (
        <path
          d="M14 8h4v6h6v4h-6v6h-4v-6H8v-4h6V8z"
          fill="currentColor"
        />
      );
    case "shield":
      return (
        <path
          d="M16 6l10 4v7c0 6.2-4.2 10.4-10 12-5.8-1.6-10-5.8-10-12V10l10-4z"
          fill="currentColor"
        />
      );
    case "interview":
      return (
        <>
          <rect x="12" y="8" width="8" height="12" rx="4" fill="currentColor" />
          <path d="M10 22h12v2H10z" fill="currentColor" />
          <path d="M15 24h2v3h-2z" fill="currentColor" />
        </>
      );
    case "longevity":
      return (
        <path
          d="M11 16c0-3.3 2.2-5 5-5s5 1.7 5 5-2.2 5-5 5-5-1.7-5-5zm5-8c-5 0-8 3.4-8 8s3 8 8 8 8-3.4 8-8-3-8-8-8z"
          fill="currentColor"
        />
      );
    default:
      return <circle cx="16" cy="16" r="6" fill="currentColor" />;
  }
}

export function WriterAgentMark({
  agent,
  size = 40,
  className = "",
}: {
  agent: WriterAgent;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[22%] ${className}`}
      style={{ width: size, height: size, background: agent.accentSoft, color: agent.accent }}
      title={agent.label}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" width={Math.round(size * 0.62)} height={Math.round(size * 0.62)}>
        <Glyph kind={agent.mark} />
      </svg>
    </span>
  );
}
