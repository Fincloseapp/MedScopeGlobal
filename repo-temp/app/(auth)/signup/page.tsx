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

import { createClient } from "@/lib/supabase/client";
import {
  getTurnstileSiteKeyClient,
  useCaptchaToken,
} from "@/components/security/use-captcha";



const ACCESS_KEYS: Record<string, string> = {
  public: "access.level1Title",
  physician: "access.level3Title",
};



export default function SignupPage() {

  const supabase = createClient();
  const siteKey = getTurnstileSiteKeyClient();
  const { token: captchaToken, widget, required: captchaRequired } = useCaptchaToken(siteKey);

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [accessLevel, setAccessLevel] = useState<string>("public");

  const [profession, setProfession] = useState<string>("general_public");

  const [message, setMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);



  async function onSubmit(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    setMessage(null);

    const origin = window.location.origin;
    const selectedAccessLevel = normalizeAccessLevel(accessLevel);

    if (captchaRequired && siteKey) {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          accessLevel: selectedAccessLevel,
          profession,
          captchaToken,
        }),
      });
      const body = await res.json();
      setLoading(false);
      if (!res.ok) {
        setMessage(body.error ?? "Registrace se nezdařila.");
        return;
      }
      if (body.needsConfirmation === false) {
        window.location.href = "/account";
        return;
      }
      setMessage(
        selectedAccessLevel === "physician"
          ? "Účet MedScopeGlobal byl založen. Otevřete potvrzovací e-mail od MedScopeGlobal, potvrďte adresu a poté nahrajte doklad profese v sekci Účet."
          : "Účet MedScopeGlobal byl založen. Ověřte prosím e-mailovou schránku a potvrďte registraci odkazem od MedScopeGlobal."
      );
      return;
    }

    const { data, error } = await supabase.auth.signUp({

      email,

      password,

      options: {

        emailRedirectTo: `${origin}/auth/callback?next=/account`,

        data: {

          full_name: fullName,

          access_level: selectedAccessLevel,

          profession,

        },

      },

    });

    setLoading(false);

    if (error) {

      setMessage(error.message);

      return;

    }

    if (data.session) {

      window.location.href = "/account";

      return;

    }

    setMessage(

      selectedAccessLevel === "physician"

        ? "Účet MedScopeGlobal byl založen. Otevřete potvrzovací e-mail od MedScopeGlobal, potvrďte adresu a poté nahrajte doklad profese v sekci Účet."

        : "Účet MedScopeGlobal byl založen. Ověřte prosím e-mailovou schránku a potvrďte registraci odkazem od MedScopeGlobal."

    );

  }



  return (

    <Card className="shadow-lg">

      <CardHeader>

        <CardTitle className="font-display text-2xl">Registrace</CardTitle>

        <CardDescription>

          Zvolte úroveň přístupu a profesi. Pro úroveň 3 budete po registraci

          vyzváni k nahrání dokladu.

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

          <Button type="submit" className="w-full" disabled={loading}>

            Zaregistrovat se

          </Button>

          {widget}

        </form>

        {message && (

          <p className="mt-4 text-sm text-muted-foreground" role="status">

            {message}

          </p>

        )}

      </CardContent>

      <CardFooter className="flex justify-center text-sm">

        <Link href="/login" className="text-primary hover:underline">

          Již máte účet? Přihlásit se

        </Link>

      </CardFooter>

    </Card>

  );

}

