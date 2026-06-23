"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const COOKIE_KEY = "msg_cookie_consent";

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function saveConsent(consent: Consent) {
  localStorage.setItem(COOKIE_KEY, JSON.stringify(consent));
  document.cookie = `msg_analytics=${consent.analytics ? "1" : "0"};path=/;max-age=31536000;SameSite=Lax`;
  document.cookie = `msg_marketing=${consent.marketing ? "1" : "0"};path=/;max-age=31536000;SameSite=Lax`;
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!readConsent()) setOpen(true);
  }, []);

  function acceptAll() {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      decidedAt: new Date().toISOString(),
    });
    setOpen(false);
  }

  function acceptNecessary() {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    });
    setOpen(false);
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg" aria-describedby="cookie-desc">
        <DialogHeader>
          <DialogTitle>Cookies a soukromí</DialogTitle>
          <DialogDescription id="cookie-desc">
            Používáme cookies pro fungování webu, analytiku a marketing. Více v{" "}
            <Link href="/gdpr" className="text-primary underline">
              GDPR
            </Link>{" "}
            a{" "}
            <Link href="/cookies" className="text-primary underline">
              Cookies
            </Link>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={acceptNecessary}>
            Pouze nezbytné
          </Button>
          <Button onClick={acceptAll} className="bg-[#005B96] hover:bg-[#004874]">
            Přijmout vše
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CookiePreferenceCenter() {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (c) {
      setAnalytics(c.analytics);
      setMarketing(c.marketing);
    }
  }, []);

  function save() {
    saveConsent({
      necessary: true,
      analytics,
      marketing,
      decidedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="not-prose my-6 space-y-4 rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="analytics">Analytické cookies</Label>
        <Switch id="analytics" checked={analytics} onCheckedChange={setAnalytics} />
      </div>
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="marketing">Marketingové cookies</Label>
        <Switch id="marketing" checked={marketing} onCheckedChange={setMarketing} />
      </div>
      <Button onClick={save} className="bg-[#005B96] hover:bg-[#004874]">
        Uložit preference
      </Button>
      {saved && (
        <p className="text-sm text-emerald-700" role="status">
          Preference uloženy.
        </p>
      )}
    </div>
  );
}
