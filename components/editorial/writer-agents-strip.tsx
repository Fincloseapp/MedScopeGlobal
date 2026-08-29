import Link from "next/link";
import { WRITER_AGENTS } from "@/lib/editorial/writer-agents";
import { WriterAgentMark } from "@/components/editorial/writer-agent-mark";

export function WriterAgentsStrip() {
  return (
    <section className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-sm font-bold text-[#021d33]">Redakční agenti</h2>
        <Link href="/verejnost/clanky" className="text-xs font-medium text-[#005B96] hover:underline">
          všechny články
        </Link>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {WRITER_AGENTS.map((agent) => (
          <li key={agent.id}>
            <Link
              href={agent.href}
              className="flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-slate-50"
            >
              <WriterAgentMark agent={agent} size={36} />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-[#021d33]">{agent.label}</span>
                <span className="block truncate text-[10px] text-slate-500">{agent.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
