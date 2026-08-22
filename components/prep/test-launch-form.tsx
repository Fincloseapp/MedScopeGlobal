"use client";

import { useRouter } from "next/navigation";
import { PREP_FACULTIES } from "@/lib/prep/faculties";
import { listPrepTopics } from "@/lib/prep/questions";
import { usePrepProgress } from "@/components/prep/progress-store";

export function TestLaunchForm({
  actionPath = "/prep/test",
  extraParams,
}: {
  actionPath?: string;
  extraParams?: Record<string, string>;
}) {
  const router = useRouter();
  const { progress } = usePrepProgress();
  const topics = listPrepTopics();

  return (
    <form
      className="space-y-5 rounded-[24px] border border-[#e0d5c4] bg-white p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const mode = String(fd.get("mode") || "mini");
        const subject = String(fd.get("subject") || "mixed");
        const faculty = String(fd.get("faculty") || progress.facultySlug || "");
        const count = String(fd.get("count") || "15");
        const topic = String(fd.get("topic") || "");
        const q = new URLSearchParams({ mode, subject, count, ...(extraParams ?? {}) });
        if (faculty) q.set("faculty", faculty);
        if (topic && mode === "drill") q.set("topic", topic);
        router.push(`${actionPath}?${q.toString()}`);
      }}
    >
      <h2 className="font-display text-xl font-semibold">Sestavit test</h2>
      <label className="block text-sm">
        <span className="text-[#6b6256]">Režim</span>
        <select name="mode" className="mt-1 w-full rounded-xl border border-[#e0d5c4] bg-[#F8F4EA] px-3 py-2">
          <option value="mini">Mini test zdarma (ochutnávka)</option>
          <option value="simulation">Simulace fakulty (předplatné)</option>
          <option value="drill">Drill tématu (předplatné)</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-[#6b6256]">Předmět</span>
        <select name="subject" className="mt-1 w-full rounded-xl border border-[#e0d5c4] bg-[#F8F4EA] px-3 py-2">
          <option value="mixed">Smíšený B/C/F</option>
          <option value="biologie">Biologie</option>
          <option value="chemie">Chemie</option>
          <option value="fyzika">Fyzika</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-[#6b6256]">Fakulta</span>
        <select
          name="faculty"
          defaultValue={progress.facultySlug ?? ""}
          className="mt-1 w-full rounded-xl border border-[#e0d5c4] bg-[#F8F4EA] px-3 py-2"
        >
          <option value="">Bez specifického formátu</option>
          {PREP_FACULTIES.map((f) => (
            <option key={f.slug} value={f.slug}>
              {f.shortName} · {f.city}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-[#6b6256]">Počet otázek (mini)</span>
        <select name="count" defaultValue="15" className="mt-1 w-full rounded-xl border border-[#e0d5c4] bg-[#F8F4EA] px-3 py-2">
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="30">30</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-[#6b6256]">Téma pro drill</span>
        <select name="topic" className="mt-1 w-full rounded-xl border border-[#e0d5c4] bg-[#F8F4EA] px-3 py-2">
          <option value="">—</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-[#6b6256]">
        První mini test je zdarma. Simulace a drill odemkne studentské předplatné.
      </p>
      <button type="submit" className="rounded-full bg-[#C45C26] px-5 py-2.5 text-sm font-semibold text-white">
        Spustit
      </button>
    </form>
  );
}
