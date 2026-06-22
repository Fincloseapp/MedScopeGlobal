"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics";

export function ContactForm({
  kind,
  title,
  description,
  destination,
}: {
  kind: "general" | "partner";
  title: string;
  description: string;
  destination: string;
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const honeypot = String(formData.get("company") ?? "").trim();

    if (honeypot) {
      setStatus("success");
      setMessage("Děkujeme za zprávu, ozveme se vám co nejdříve.");
      return;
    }

    setSubmitting(true);
    setStatus("idle");
    setMessage("");

    try {
      const payload = {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        organization: String(formData.get("organization") ?? ""),
        message: String(formData.get("message") ?? ""),
        phone: String(formData.get("phone") ?? ""),
      };

      const response = await fetch(`/api/contact/${kind}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to submit form");
      }

      setStatus("success");
      setMessage("Děkujeme za zprávu, ozveme se vám co nejdříve.");
      form.reset();
      trackEvent("contact_submit", {
        form_type: kind,
        destination,
      });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong while submitting the form.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_-28px_rgba(2,30,57,0.55)]">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#005B96]">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="hidden" aria-hidden="true">
        <Label htmlFor={`${kind}-company`}>Company</Label>
        <Input id={`${kind}-company`} name="company" autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${kind}-name`}>Jméno</Label>
          <Input id={`${kind}-name`} name="name" required placeholder="Jan Novák" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${kind}-email`}>E-mail</Label>
          <Input id={`${kind}-email`} name="email" type="email" required placeholder="jan@firma.cz" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${kind}-organization`}>Organizace</Label>
        <Input id={`${kind}-organization`} name="organization" placeholder="Název organizace" />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${kind}-phone`}>Telefon</Label>
        <Input id={`${kind}-phone`} name="phone" type="tel" placeholder="+420 123 456 789" />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${kind}-message`}>Zpráva</Label>
        <Textarea id={`${kind}-message`} name="message" required rows={5} placeholder="Popište vaši potřebu..." />
      </div>

      <Button type="submit" disabled={submitting} className="w-full bg-[#005B96] hover:bg-[#004874]">
        {submitting ? "Odesílám..." : "Odeslat zprávu"}
      </Button>

      {status !== "idle" && (
        <div className={`rounded-2xl border px-3 py-2 text-sm ${status === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          {message}
        </div>
      )}
    </form>
  );
}
