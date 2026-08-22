import Link from "next/link";
import { MeDipacientMark } from "@/components/medipacient/medipacient-mark";
import { MEDIPACIENT } from "@/lib/medipacient/branding";

export function MeDipacientPaywall({
  email,
  trialUrl = "/predplatne?trial=1",
}: {
  email?: string | null;
  trialUrl?: string;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <aside className="rounded-2xl border border-[#2D7FF9]/25 bg-[#021d33] p-6 text-white" aria-label="Trial MeDipacient">
        <div className="flex items-start gap-3">
          <MeDipacientMark size="md" className="shrink-0 rounded-[22%] ring-1 ring-white/25" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200">
              {MEDIPACIENT.lockline}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold">14 dní zdarma, pak předplatné</h2>
            <p className="mt-2 text-sm leading-6 text-sky-50/90">
              Jste přihlášeni{email ? ` jako ${email}` : ""}. MeDipacient používá stejný trial a tarif jako zbytek
              MedScopeGlobal — bez nového hesla.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={trialUrl}
                className="inline-flex h-10 items-center rounded-full bg-[#2D7FF9] px-4 text-sm font-semibold text-white hover:bg-[#1f6ae0]"
              >
                Začít 14denní trial
              </Link>
              <Link
                href="/predplatne"
                className="inline-flex h-10 items-center rounded-full border border-white/35 px-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                Porovnat tarify
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
