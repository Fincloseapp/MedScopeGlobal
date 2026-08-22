"use client";

import { useMemo, useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MeDiprepLogo } from "@/components/prep/mediprep-mark";
import { MEDIPREP, MEDIPREP_ONBOARDING as C } from "@/lib/prep/branding";
import { PREP_FACULTIES } from "@/lib/prep/faculties";
import { usePrepProgress } from "@/components/prep/progress-store";

type Step = "welcome" | "contact" | "otp" | "faculty";

export function MeDiprepOnboarding({ onComplete }: { onComplete: () => void }) {
  const { setFaculty } = usePrepProgress();
  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [masked, setMasked] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  const canSubmit = useMemo(() => Boolean(email.trim()), [email]);

  async function requestOtp() {
    setLoading(true);
    setError(null);
    setDebugCode(null);
    try {
      const res = await fetch("/api/mediprep/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = (await res.json()) as {
        error?: string;
        challengeId?: string;
        destinationMasked?: string;
        debugCode?: string;
      };
      if (!res.ok) {
        setError(body.error || "Odeslání kódu selhalo.");
        return;
      }
      setChallengeId(body.challengeId || null);
      setMasked(body.destinationMasked || "");
      if (body.debugCode) setDebugCode(body.debugCode);
      setStep("otp");
    } catch {
      setError("Síťová chyba. Zkontrolujte připojení.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!challengeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mediprep/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ challengeId, code: otp.trim() }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error || "Ověření selhalo.");
        return;
      }
      setStep("faculty");
    } catch {
      setError("Síťová chyba.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-[#0A192F]/10 bg-white p-6 shadow-sm">
        <MeDiprepLogo priority />
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0A192F]">
          {MEDIPREP.lockline}
        </p>

        {step === "welcome" ? (
          <>
            <h2 className="mt-2 font-display text-2xl font-semibold">{C.welcome.title}</h2>
            <p className="mt-2 text-sm text-[#5a5348]">{MEDIPREP.heroSupport}</p>
            <p className="mt-2 text-xs text-[#6b6256]">
              Účet založíte e-mailem. Heslo nepotřebujete. Stejný e-mail jako na medscopeglobal.com = stejný účet a předplatné.
            </p>
            <Button className="mt-5 h-11 w-full rounded-full bg-[#F97316] hover:bg-[#ea6a0c]" onClick={() => setStep("contact")}>
              {C.welcome.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : null}

        {step === "contact" ? (
          <>
            <h2 className="mt-2 font-display text-xl font-semibold">{C.contact.title}</h2>
            <label className="mt-4 block text-sm">
              E-mail
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={C.contact.emailPlaceholder}
                className="mt-1"
                autoComplete="email"
              />
            </label>
            {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
            <Button
              className="mt-4 h-11 w-full rounded-full bg-[#22a05a] hover:bg-[#1b874b]"
              disabled={!canSubmit || loading}
              onClick={() => void requestOtp()}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {C.contact.cta}
            </Button>
          </>
        ) : null}

        {step === "otp" ? (
          <>
            <h2 className="mt-2 font-display text-xl font-semibold">{C.otp.title}</h2>
            <p className="mt-1 text-sm text-[#5a5348]">
              {C.otp.sentViaEmail}
              {masked ? ` (${masked})` : ""}.
            </p>
            {debugCode ? <p className="mt-2 text-xs text-amber-700">Dev kód: {debugCode}</p> : null}
            <Input
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="mt-4 tracking-[0.4em]"
              maxLength={6}
            />
            {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
            <Button
              className="mt-4 h-11 w-full rounded-full bg-[#F97316] hover:bg-[#ea6a0c]"
              disabled={otp.trim().length < 6 || loading}
              onClick={() => void verifyOtp()}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {C.otp.cta}
            </Button>
            <button type="button" className="mt-3 w-full text-sm text-[#005B96]" onClick={() => void requestOtp()}>
              {C.otp.resend}
            </button>
          </>
        ) : null}

        {step === "faculty" ? (
          <>
            <h2 className="mt-2 font-display text-xl font-semibold">{C.faculty.title}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {PREP_FACULTIES.map((f) => (
                <button
                  key={f.slug}
                  type="button"
                  className="rounded-xl border border-[#0A192F]/15 px-3 py-2 text-left text-sm hover:border-[#A3E635]"
                  onClick={() => {
                    setFaculty(f.slug);
                    onComplete();
                  }}
                >
                  <span className="font-medium">{f.shortName}</span>
                  <span className="mt-0.5 block text-xs text-[#6b6256]">{f.city}</span>
                </button>
              ))}
            </div>
            <button type="button" className="mt-4 w-full text-sm text-[#6b6256]" onClick={onComplete}>
              {C.faculty.skip}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
