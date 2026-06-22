"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import {
  getTurnstileSiteKeyClient,
  useCaptchaToken,
} from "@/components/security/use-captcha";

export default function LoginPage() {
  const supabase = createClient();
  const siteKey = getTurnstileSiteKeyClient();
  const { token: captchaToken, widget, required: captchaRequired } = useCaptchaToken(siteKey);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (captchaRequired && siteKey) {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }),
      });
      const body = await res.json();
      setLoading(false);
      if (!res.ok) {
        setMessage(body.error ?? "Login failed");
        return;
      }
      window.location.reload();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  }

  async function onMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Check your inbox for the secure sign-in link.");
  }

  async function onGoogle() {
    setLoading(true);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      setLoading(false);
      setMessage(error.message);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in with email, magic link, or Google.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={onEmailPassword}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            Continue with password
          </Button>
          {widget}
        </form>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">Or</span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={loading || !email}
          onClick={onMagicLink}
        >
          Email me a magic link
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={onGoogle}
        >
          Continue with Google
        </Button>

        {message && (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <Link href="/signup" className="text-primary hover:underline">
          Need an account? Register
        </Link>
      </CardFooter>
    </Card>
  );
}
