"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Mic,
  Smartphone,
  ShieldCheck,
  Link2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediktorMark } from "@/components/lekari/mediktor-mark";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";
import { MEDIKTOR_ONBOARDING as C } from "@/lib/mediktor/copy";
import { INTEGRATION_PRESETS } from "@/lib/mediktor/presets";

type Step =
  | "welcome"
  | "contact"
  | "otp"
  | "verify"
  | "integration"
  | "tooltips"
  | "done";

type VerifyMethod = "id_photo" | "license" | "facility_ico" | "work_email";

const ONBOARDING_LS_KEY = "mediktor_onboarding_v2";

export function DokAppOnboarding({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [masked, setMasked] = useState("");
  const [smsGap, setSmsGap] = useState(true); // honest default until Twilio is wired
  const [otpChannel, setOtpChannel] = useState<"email" | "sms" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [emailHighlight, setEmailHighlight] = useState(false);
  const [methods, setMethods] = useState<VerifyMethod[]>([]);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [facilityIco, setFacilityIco] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [integrationType, setIntegrationType] = useState<
    "export" | "webhook" | "hl7" | "fhir" | "api"
  >("export");
  const [presetTarget, setPresetTarget] = useState("generic");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [tooltipIdx, setTooltipIdx] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/mediktor/onboarding", {
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          authenticated: boolean;
          needsOnboarding: boolean;
          step?: string;
        };
        if (data.authenticated && !data.needsOnboarding) {
          onComplete();
          return;
        }
        if (data.authenticated && data.needsOnboarding) {
          if (data.step === "integration") setStep("integration");
          else if (data.step === "verify") setStep("verify");
          else setStep("verify");
        }
      } catch {
        /* first-run offline: keep welcome */
      }
    })();
  }, [onComplete]);

  const canSubmitContact = useMemo(() => Boolean(email.trim()), [email]);

  function toggleMethod(m: VerifyMethod) {
    setMethods((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  async function requestOtp() {
    setLoading(true);
    setError(null);
    setDebugCode(null);
    try {
      const res = await fetch("/api/mediktor/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: email.trim() || null,
          phone: phone.trim() || null,
        }),
      });
      const body = (await res.json()) as {
        error?: string;
        code?: string;
        challengeId?: string;
        destinationMasked?: string;
        smsGap?: boolean;
        channel?: "email" | "sms";
        debugCode?: string;
      };
      if (!res.ok) {
        setError(body.error || "Odeslání kódu selhalo.");
        if (
          body.code === "EMAIL_REQUIRED_FOR_OTP" ||
          body.code === "SMS_SEND_FAILED"
        ) {
          setSmsGap(true);
          setEmailHighlight(true);
        }
        return;
      }
      setChallengeId(body.challengeId || null);
      setMasked(body.destinationMasked || "");
      if (typeof body.smsGap === "boolean") setSmsGap(body.smsGap);
      setOtpChannel(body.channel || "email");
      setEmailHighlight(false);
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
      const res = await fetch("/api/mediktor/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ challengeId, code: otp.trim() }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error || "Ověření kódu selhalo.");
        return;
      }
      setStep("verify");
    } catch {
      setError("Síťová chyba při ověření kódu.");
    } finally {
      setLoading(false);
    }
  }

  async function submitVerification(skip: boolean) {
    setLoading(true);
    setError(null);
    try {
      if (!skip) {
        if (!methods.length) {
          setError("Vyberte alespoň jeden způsob, nebo pokračujte bez dokončení.");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/mediktor/verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            methods,
            licenseNumber: licenseNumber || null,
            facilityIco: facilityIco || null,
            workEmail: workEmail || null,
            idFileName,
            idPhotoPath: idFileName ? `local://${idFileName}` : null,
          }),
        });
        const body = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(body.error || "Odeslání ověření selhalo.");
          return;
        }
      }
      setStep("integration");
    } catch {
      setError("Síťová chyba.");
    } finally {
      setLoading(false);
    }
  }

  async function submitIntegration(skip: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mediktor/integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(
          skip
            ? { skip: true, completeOnboarding: true }
            : {
                active: true,
                integrationType,
                presetTarget,
                formats:
                  integrationType === "hl7"
                    ? ["hl7", "text"]
                    : integrationType === "fhir"
                      ? ["fhir", "text"]
                      : ["text", "pdf", "docx"],
                webhookUrl: webhookUrl || null,
                completeOnboarding: true,
              }
        ),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error || "Uložení propojení selhalo.");
        return;
      }
      try {
        localStorage.setItem(ONBOARDING_LS_KEY, "done");
      } catch {
        /* ignore */
      }
      setStep("tooltips");
    } catch {
      setError("Síťová chyba.");
    } finally {
      setLoading(false);
    }
  }

  function finishTooltips() {
    if (tooltipIdx < C.tooltips.length - 1) {
      setTooltipIdx((i) => i + 1);
      return;
    }
    onComplete();
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <MediktorMark size="md" className="rounded-[22%] ring-1 ring-[#005B96]/20" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
            {MEDIKTOR.provider}
          </p>
          <p className="text-base font-semibold text-[#021d33]">{MEDIKTOR.shortName}</p>
        </div>
      </div>

      {step === "welcome" ? (
        <Panel>
          <Mic className="h-10 w-10 text-[#005B96]" />
          <h2 className="mt-4 font-display text-2xl font-bold text-[#021d33]">
            {C.welcome.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Bez hesla. E-mail → ověřovací kód → diktát. (SMS zatím není.)
          </p>
          <Button
            className="mt-6 h-12 w-full rounded-full bg-[#22a05a] hover:bg-[#1b874b]"
            onClick={() => setStep("contact")}
          >
            {C.welcome.cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Panel>
      ) : null}

      {step === "contact" ? (
        <Panel>
          <Smartphone className="h-8 w-8 text-[#005B96]" />
          <h2 className="mt-3 font-display text-xl font-bold text-[#021d33]">
            {C.contact.title}
          </h2>
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            {C.contact.smsGap}
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                E-mail (povinný)
              </label>
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus={emailHighlight}
                placeholder={C.contact.emailPlaceholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailHighlight(false);
                }}
                className={`h-12 rounded-xl ${
                  emailHighlight ? "border-amber-400 ring-2 ring-amber-200" : ""
                }`}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                Telefon (volitelný)
              </label>
              <Input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={C.contact.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-xl"
              />
              {phone.trim() && !email.trim() ? (
                <p className="mt-1 text-[11px] text-amber-800">
                  {C.contact.phoneOnlyHint}
                </p>
              ) : null}
            </div>
          </div>
          {error ? <ErrorText>{error}</ErrorText> : null}
          <Button
            className="mt-5 h-12 w-full rounded-full bg-[#005B96]"
            disabled={!canSubmitContact || loading}
            onClick={() => void requestOtp()}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {C.contact.cta}
          </Button>
          <button
            type="button"
            className="mt-3 w-full text-center text-xs text-slate-500 underline"
            onClick={() => {
              window.location.href = "/login?next=/app/dokumentace";
            }}
          >
            Mám heslo — klasické přihlášení
          </button>
        </Panel>
      ) : null}

      {step === "otp" ? (
        <Panel>
          <h2 className="font-display text-xl font-bold text-[#021d33]">{C.otp.title}</h2>
          <p className="mt-1 text-xs text-slate-500">
            {otpChannel === "sms" ? C.otp.sentViaSms : C.otp.sentViaEmail}
            {masked ? ` · ${masked}` : ""}
          </p>
          {smsGap && otpChannel === "email" && phone.trim() ? (
            <p className="mt-2 rounded-lg bg-[#eef6fb] px-2 py-1.5 text-[11px] text-[#021d33]">
              Telefon {phone.trim()} uložíme k účtu po ověření e-mailu. SMS kód zatím neposíláme.
            </p>
          ) : null}
          {debugCode ? (
            <p className="mt-2 rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs">
              Debug kód: {debugCode}
            </p>
          ) : null}
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="mt-4 h-14 rounded-xl text-center text-2xl tracking-[0.4em]"
          />
          {error ? <ErrorText>{error}</ErrorText> : null}
          <Button
            className="mt-5 h-12 w-full rounded-full bg-[#005B96]"
            disabled={otp.length < 6 || loading}
            onClick={() => void verifyOtp()}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {C.otp.cta}
          </Button>
          <button
            type="button"
            className="mt-3 w-full text-center text-xs text-[#005B96]"
            disabled={loading}
            onClick={() => void requestOtp()}
          >
            {C.otp.resend}
          </button>
        </Panel>
      ) : null}

      {step === "verify" ? (
        <Panel>
          <ShieldCheck className="h-8 w-8 text-[#005B96]" />
          <h2 className="mt-3 font-display text-xl font-bold text-[#021d33]">
            {C.verify.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{C.verify.subtitle}</p>
          <div className="mt-4 space-y-2">
            {(
              [
                ["id_photo", C.verify.options.id],
                ["license", C.verify.options.license],
                ["facility_ico", C.verify.options.ico],
                ["work_email", C.verify.options.workEmail],
              ] as const
            ).map(([id, label]) => (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm ${
                  methods.includes(id)
                    ? "border-[#005B96] bg-[#eef6fb]"
                    : "border-[#d9e8f4] bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={methods.includes(id)}
                  onChange={() => toggleMethod(id)}
                />
                {label}
              </label>
            ))}
          </div>
          {methods.includes("license") ? (
            <Input
              className="mt-3 h-11 rounded-xl"
              placeholder="Číslo licence / ČLK"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          ) : null}
          {methods.includes("facility_ico") ? (
            <Input
              className="mt-3 h-11 rounded-xl"
              placeholder="IČO (8 číslic)"
              value={facilityIco}
              onChange={(e) => setFacilityIco(e.target.value)}
            />
          ) : null}
          {methods.includes("work_email") ? (
            <Input
              className="mt-3 h-11 rounded-xl"
              type="email"
              placeholder="jmeno@nemocnice.cz"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
            />
          ) : null}
          {methods.includes("id_photo") ? (
            <Input
              className="mt-3 h-11 rounded-xl"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) =>
                setIdFileName(e.target.files?.[0]?.name ?? null)
              }
            />
          ) : null}
          {error ? <ErrorText>{error}</ErrorText> : null}
          <Button
            className="mt-5 h-12 w-full rounded-full bg-[#005B96]"
            disabled={loading}
            onClick={() => void submitVerification(false)}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {C.verify.cta}
          </Button>
          <Button
            variant="ghost"
            className="mt-2 h-10 w-full rounded-full"
            disabled={loading}
            onClick={() => void submitVerification(true)}
          >
            {C.verify.skip}
          </Button>
        </Panel>
      ) : null}

      {step === "integration" ? (
        <Panel>
          <Link2 className="h-8 w-8 text-[#005B96]" />
          <h2 className="mt-3 font-display text-xl font-bold text-[#021d33]">
            {C.integration.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {C.integration.prompt} Kopírování do vašeho programu stačí. Automatické odeslání je
            volitelné — webhook, HL7 nebo FHIR nastavíte i později v záložce Účet.
          </p>
          <div className="mt-4 space-y-3">
            <label className="block text-xs font-medium text-slate-600">
              Typ propojení
              <select
                className="mt-1 h-11 w-full rounded-xl border border-[#d9e8f4] bg-white px-3 text-sm"
                value={integrationType}
                onChange={(e) =>
                  setIntegrationType(e.target.value as typeof integrationType)
                }
              >
                <option value="export">Export (text / PDF / DOCX)</option>
                <option value="webhook">Webhook / API</option>
                <option value="hl7">HL7 (stub)</option>
                <option value="fhir">FHIR (stub)</option>
                <option value="api">API klíč</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Cílový systém
              <select
                className="mt-1 h-11 w-full rounded-xl border border-[#d9e8f4] bg-white px-3 text-sm"
                value={presetTarget}
                onChange={(e) => setPresetTarget(e.target.value)}
              >
                {INTEGRATION_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            {(integrationType === "webhook" || integrationType === "api") && (
              <Input
                className="h-11 rounded-xl"
                placeholder="https://vas-system.cz/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            )}
          </div>
          {error ? <ErrorText>{error}</ErrorText> : null}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button
              className="h-12 rounded-full bg-[#22a05a] hover:bg-[#1b874b]"
              disabled={loading}
              onClick={() => void submitIntegration(false)}
            >
              {C.integration.yes}
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-full"
              disabled={loading}
              onClick={() => void submitIntegration(true)}
            >
              {C.integration.skip}
            </Button>
          </div>
        </Panel>
      ) : null}

      {step === "tooltips" ? (
        <Panel>
          <h2 className="font-display text-xl font-bold text-[#021d33]">
            {C.tooltips[tooltipIdx].title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {C.tooltips[tooltipIdx].text}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            {tooltipIdx + 1} / {C.tooltips.length}
          </p>
          <Button
            className="mt-5 h-12 w-full rounded-full bg-[#005B96]"
            onClick={finishTooltips}
          >
            {tooltipIdx < C.tooltips.length - 1 ? "Další" : C.main.micHint}
          </Button>
        </Panel>
      ) : null}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#cfe1f3] bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-xs text-red-600">{children}</p>;
}
