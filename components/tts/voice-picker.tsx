"use client";

import { useEffect, useState } from "react";
import {
  getUserVoiceOverride,
  initSessionVoice,
  setUserVoiceOverride,
} from "@/lib/tts/voice-session";
import { setVoiceGenderPreference, type VoiceGender } from "@/lib/tts/speak";
import { describeSelectedVoice, listVoicesForLang } from "@/lib/tts/voice-picker";
import { waitForVoices } from "@/lib/tts/speak";

type Props = {
  className?: string;
  compact?: boolean;
  /** BCP-47 locale — defaults to Czech */
  lang?: string;
};

export function VoicePicker({ className, compact, lang = "cs-CZ" }: Props) {
  const [gender, setGender] = useState<VoiceGender>("auto");
  const [sessionHint, setSessionHint] = useState<string>("");
  const [voiceLabel, setVoiceLabel] = useState<string | null>(null);
  const [noCzechVoice, setNoCzechVoice] = useState(false);

  useEffect(() => {
    initSessionVoice();
    const override = getUserVoiceOverride();
    setGender(override === "auto" ? "auto" : override);
    try {
      const s = sessionStorage.getItem("medscope-tts-session-gender");
      if (s === "male") setSessionHint("Muž");
      else if (s === "female") setSessionHint("Žena");
      else setSessionHint("Čeština");
    } catch {
      /* ignore */
    }

    void waitForVoices().then(() => {
      const czechVoices = listVoicesForLang(lang);
      setNoCzechVoice(!czechVoices.length && !lang.toLowerCase().startsWith("en"));
      setVoiceLabel(describeSelectedVoice(lang));
    });
  }, [lang]);

  function select(next: VoiceGender) {
    setGender(next);
    setUserVoiceOverride(next);
    setVoiceGenderPreference(next);
    setVoiceLabel(describeSelectedVoice(lang));
  }

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className ?? ""}`} role="group" aria-label="Výběr hlasu">
      {!compact ? <span className="mr-1 text-xs text-slate-500">Hlas:</span> : null}
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
      {gender === "auto" && sessionHint ? (
        <span className="text-[10px] text-slate-400">({sessionHint})</span>
      ) : null}
      {voiceLabel && !noCzechVoice ? (
        <span className="text-[10px] text-slate-400" title="Aktivní český hlas">
          {voiceLabel}
        </span>
      ) : null}
      {noCzechVoice ? (
        <span className="text-[10px] text-amber-700" title="Nainstalujte český hlas v systému">
          Chybí český hlas
        </span>
      ) : null}
    </div>
  );
}
