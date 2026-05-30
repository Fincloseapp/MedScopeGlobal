"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"reader" | "expert">("reader");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload =
      mode === "login"
        ? { email: form.get("email"), password: form.get("password") }
        : {
            email: form.get("email"),
            password: form.get("password"),
            name: form.get("name"),
            role,
            institution: form.get("institution") || undefined
          };

    const response = await fetch(`/api/portal/auth/${mode === "login" ? "login" : "register"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Operace selhala");
      return;
    }

    router.push(mode === "login" && data.user?.role === "reader" ? "/portal" : "/portal/manage");
    router.refresh();
  }

  return (
    <form className="form card auth-form" onSubmit={handleSubmit}>
      <h1>{mode === "login" ? "Přihlášení" : "Registrace"}</h1>
      <p className="lead">{mode === "login" ? "Přístup k odbornému obsahu a personalizaci." : "Vytvořte účet čtenáře nebo odborníka."}</p>

      {mode === "register" ? (
        <>
          <label>
            Jméno
            <input name="name" required minLength={2} placeholder="MUDr. Jan Novák" />
          </label>
          <fieldset className="role-picker">
            <legend>Typ účtu</legend>
            <label className="check">
              <input type="radio" name="roleChoice" checked={role === "reader"} onChange={() => setRole("reader")} />
              <span>Čtenář – čtení, ukládání, hodnocení</span>
            </label>
            <label className="check">
              <input type="radio" name="roleChoice" checked={role === "expert"} onChange={() => setRole("expert")} />
              <span>Odborník – publikace, editace, validace</span>
            </label>
          </fieldset>
          {role === "expert" ? (
            <label>
              Instituce
              <input name="institution" placeholder="1. LF UK / FN Brno" />
            </label>
          ) : null}
        </>
      ) : null}

      <label>
        E-mail
        <input name="email" type="email" required placeholder="email@lf1.cuni.cz" />
      </label>
      <label>
        Heslo
        <input name="password" type="password" required minLength={8} placeholder="Min. 8 znaků" />
      </label>

      {error ? <p className="error">{error}</p> : null}

      <div className="actions">
        <button className="button primary" type="submit" disabled={loading}>
          {loading ? "Probíhá…" : mode === "login" ? "Přihlásit" : "Registrovat"}
        </button>
        <Link className="button" href={mode === "login" ? "/auth/register" : "/auth/login"}>
          {mode === "login" ? "Vytvořit účet" : "Mám účet"}
        </Link>
      </div>
    </form>
  );
}
