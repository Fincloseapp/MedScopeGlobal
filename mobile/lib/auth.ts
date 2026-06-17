import * as Linking from "expo-linking";
import { getSupabase } from "./supabase";

const redirectUrl = Linking.createURL("auth/callback");

/** Sends a Supabase magic-link OTP to the given email. */
export async function signInWithMagicLink(email: string): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Supabase není nakonfigurován" };

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: redirectUrl },
  });

  return { error: error?.message ?? null };
}

/** Opens Google OAuth flow via Supabase (requires deep-link scheme in app.json). */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Supabase není nakonfigurován" };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUrl },
  });

  return { error: error?.message ?? null };
}
