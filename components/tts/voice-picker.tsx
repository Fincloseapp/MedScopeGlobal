"use client";

import { useEffect, useState } from "react";
import {
  getVoiceGenderPreference,
  setVoiceGenderPreference,
  type VoiceGender,
} from "@/lib/tts/speak";

type Props = {
  className?: string;
  compact?: boolean;
};

export function VoicePicker({ className, compact }: Props) {
  const [gender, setGender] = useState<VoiceGender>("auto");

  useEffect(() => {
    setGender(getVoiceGenderPreference());
  }, []);

  function select(next: VoiceGender) {
    setGender(next);
    setVoiceGenderPreference(next);
  }

  return (
    <div className={className} role="group" aria-label="Výběr hlasu">
      {!compact ? (
        <span className="mr-2 text-xs text-slate-500">Hlas:</span>
      ) : null}
      {(["female", "male", "auto"] as const).map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => select(g)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
            gender === g
              ? "bg-[#005B96] text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:border-[#005B96]/40"
          }`}
          aria-pressed={gender === g}
        >
          {g === "female" ? "Žena" : g === "male" ? "Muž" : "Auto"}
        </button>
      ))}
    </div>
  );
}
