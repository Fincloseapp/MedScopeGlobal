import Link from "next/link";

type FeedItem = {
  id: string;
  title: string;
  slug: string;
  summary_clinician: string | null;
  summary_patient: string | null;
  created_at: string;
};

export function ProMeFeed({ items, audience }: { items: FeedItem[]; audience: string }) {
  if (!items.length) {
    return (
      <p className="text-slate-600">
        Personalizovaný feed ({audience}) se naplní po běhu V6 autopilotu a publikaci článků.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-xl border border-[#d9e8f4] bg-white p-4 shadow-sm"
        >
          <Link
            href={`/odborne/${item.id}`}
            className="font-semibold text-[#005B96] hover:underline"
          >
            {item.title}
          </Link>
          <p className="mt-2 text-sm text-slate-600 line-clamp-3">
            {item.summary_clinician ?? item.summary_patient ?? ""}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">
            {new Date(item.created_at).toLocaleDateString("cs-CZ")}
          </p>
        </li>
      ))}
    </ul>
  );
}
