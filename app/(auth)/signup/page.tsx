"use client";

import Link from "next/link";
import { useState } from "react";
import { ACCESS_LEVELS, normalizeAccessLevel, PROFESSIONS } from "@/lib/config/access-levels";
import { clientT } from "@/lib/i18n/client-dictionary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTurnstileSiteKeyClient,
  useCaptchaToken,
} from "@/components/security/use-captcha";

const ACCESS_KEYS: Record<string, string> = {
  public: "access.level1Title",
  physician: "access.level3Title",
};

export default function SignupPage() {
  const siteKey = getTurnstileSiteKeyClient();
  const { token: captchaToken, widget, required: captchaRequired } =
    useCaptchaToken(siteKey);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessLevel, setAccessLevel] = useState<string>("public");
  const [profession, setProfession] = useState<string>("general_public");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const selectedAccessLevel = normalizeAccessLevel(accessLevel);

    if (captchaRequired && !captchaToken) {
      setLoading(false);
      setError("Počkejte na ověření CAPTCHA a zkuste to znovu.");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          accessLevel: selectedAccessLevel,
          profession,
          captchaToken: captchaToken || undefined,
        }),
      });
      const body = (await res.json()) as {
        error?: string;
        message?: string;
        needsConfirmation?: boolean;
        code?: string;
      };

      if (!res.ok) {
        setError(body.error ?? "Registrace se nezdařila.");
        setCanResend(
          body.code === "EMAIL_SEND_FAILED" || res.status === 502
        );
        setLoading(false);
        return;
      }

      setCanResend(true);
      setMessage(
        body.message ??
          (selectedAccessLevel === "physician"
            ? "Účet MedScopeGlobal byl založen. Otevřete potvrzovací e-mail, potvrďte adresu a poté nahrajte doklad profese v sekci Účet."
            : "Účet MedScopeGlobal byl založen. Ověřte e-mailovou schránku (i spam) a potvrďte registraci odkazem od MedScopeGlobal.")
      );
    } catch {
      setError("Síťová chyba při registraci. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (!email.trim()) {
      setError("Zadejte e-mail pro opětovné odeslání.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          captchaToken: captchaToken || undefined,
        }),
      });
      const body = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(body.error ?? "Odeslání se nezdařilo.");
      } else {
        setMessage(body.message ?? "Potvrzovací e-mail byl odeslán.");
      }
    } catch {
      setError("Síťová chyba při odesílání e-mailu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Registrace</CardTitle>
        <CardDescription>
          Zvolte úroveň přístupu a profesi. Po registraci vám přijde potvrzovací
          e-mail — bez potvrzení se nelze přihlásit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="full_name">Jméno a příjmení</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Úroveň přístupu</Label>
            <Select value={accessLevel} onValueChange={setAccessLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_LEVELS.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {clientT(ACCESS_KEYS[l.id] ?? l.id, l.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              <Link href="/access-levels" className="text-primary underline">
                Co jednotlivé úrovně zahrnují
              </Link>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Profese</Label>
            <Select value={profession} onValueChange={setProfession}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {clientT(`verification.profession.${p}`, p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {widget}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || (captchaRequired && !captchaToken)}
          >
            {loading ? "Registruji…" : "Zaregistrovat se"}
          </Button>
        </form>

        {error ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 text-sm text-[#005B96]" role="status">
            {message}
          </p>
        ) : null}

        {canResend ? (
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            disabled={loading}
            onClick={onResend}
          >
            Znovu odeslat potvrzovací e-mail
          </Button>
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Již máte účet? Přihlásit se
        </Link>
      </CardFooter>
    </Card>
  );
}
