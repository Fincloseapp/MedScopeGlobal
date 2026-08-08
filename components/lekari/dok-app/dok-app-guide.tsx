"use client";

import Link from "next/link";
import { Mic, Sparkles, FileCheck2, Shield } from "lucide-react";

const STEPS = [
  {
    icon: Mic,
    title: "1. Povolte mikrofon",
    text: "Jednou klepněte na „Povolit mikrofon“ a v telefonu potvrďte přístup. Pak stačí Nahrávat — až 60 minut.",
  },
  {
    icon: Sparkles,
    title: "2. Nahrajte konzultaci nebo diktát",
    text: "Zvolte šablonu (např. Anamnéza). Po Stop AI přepíše češtinu a sestaví profesionální zápis. Audio se neukládá.",
  },
  {
    icon: FileCheck2,
    title: "3. Zkontrolujte a zkopírujte",
    text: "Upravte návrh, zkopírujte do NIS. Historie je pod stejným účtem na mobilu i PC.",
  },
  {
    icon: Shield,
    title: "4. Právní rámec",
    text: "Asistent, ne zdravotnický prostředek. Lékař schvaluje finální znění. Informujte pacienta před nahrávkou.",
  },
] as const;

export function DokAppGuide() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-3 pb-4 pt-2 sm:px-4">
      <div>
        <h2 className="text-base font-semibold text-[#021d33]">Návod</h2>
        <p className="mt-1 text-xs text-slate-500">
          Po stažení: mikrofon → nahrát → hotový zápis.
        </p>
      </div>

      <ol className="space-y-3">
        {STEPS.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex gap-3 rounded-2xl border border-[#cfe1f3] bg-white p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f2f9] text-[#005B96]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#021d33]">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-[#d9e8f4] bg-[#f4f9fc] p-4 text-xs leading-5 text-slate-600">
        <p className="font-semibold text-[#021d33]">Když telefon mikrofon nepovolí</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-4">
          <li>iPhone: Nastavení → Safari (nebo MeDiktor) → Mikrofon → Povolit</li>
          <li>Android: Nastavení → Aplikace → Chrome / MeDiktor → Oprávnění → Mikrofon</li>
          <li>Pak v aplikaci znovu „Povolit mikrofon“</li>
        </ul>
        <p className="mt-3 font-semibold text-[#021d33]">Právní upozornění</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-4">
          <li>MeDiktor od MedScopeGlobal není zdravotnický prostředek ani diagnóza.</li>
          <li>Lékař odpovídá za kontrolu a schválení zápisu.</li>
          <li>Audio se po zpracování neukládá (ephemeral).</li>
        </ul>
        <p className="mt-3">
          Marketing a předplatné:{" "}
          <Link href="/lekari/dokumentace" className="font-medium text-[#005B96] underline">
            /lekari/dokumentace
          </Link>
        </p>
      </div>
    </div>
  );
}
