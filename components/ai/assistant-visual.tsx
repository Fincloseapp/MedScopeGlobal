import { MARKETING_VISUALS } from "@/lib/brand/marketing-visuals";

export function AiAssistantVisual({
  caption = "AI asistentka MedScopeGlobal — vzdělávací nástroj, nenahrazuje lékaře.",
}: {
  caption?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MARKETING_VISUALS.aiAssistant}
        alt="Žena u obrazovky s portálem MedScopeGlobal"
        className="h-auto w-full object-cover"
        width={1600}
        height={900}
      />
      <figcaption className="px-4 py-2.5 text-xs text-slate-500">{caption}</figcaption>
    </figure>
  );
}
