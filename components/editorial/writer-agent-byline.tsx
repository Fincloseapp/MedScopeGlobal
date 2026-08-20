import {
  resolveWriterAgent,
  resolveWritingStyle,
  type ArticleForWriterAgent,
} from "@/lib/editorial/writer-agents";
import { WriterAgentMark } from "@/components/editorial/writer-agent-mark";

export function WriterAgentByline({
  article,
  size = 40,
}: {
  article: ArticleForWriterAgent;
  size?: number;
}) {
  const agent = resolveWriterAgent(article);
  const style = resolveWritingStyle(article);
  if (!agent) return null;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <WriterAgentMark agent={agent} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-[#021d33]">{agent.label}</span>
        {style ? (
          <span className="block truncate text-[10px] text-slate-500">styl: {style.label}</span>
        ) : (
          <span className="block truncate text-[10px] text-slate-500">{agent.hint}</span>
        )}
      </span>
    </div>
  );
}
