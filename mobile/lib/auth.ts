import * as Linking from "expo-linking";
import { getSupabase } from "./supabase";

/**
 * Supabase Auth redirect for mobile deep links.
 * Register in Supabase Dashboard → Auth → Redirect URLs:
 *   medscope-academy://auth/callback
 * See mobile/GOOGLE-OAUTH.md for Google Cloud client setup.
 */
export const AUTH_CALLBACK_PATH = "auth/callback";
export const authRedirectUrl = Linking.createURL(AUTH_CALLBACK_PATH);

/** Sends a Supabase magic-link OTP to the given email. */
export async function signInWithMagicLink(email: string): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Supabase není nakonfigurován" };

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: authRedirectUrl },
  });

  return { error: error?.message ?? null };
}

/** Opens Google OAuth flow via Supabase (requires deep-link scheme in app.json). */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Supabase není nakonfigurován" };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: authRedirectUrl },
  });

  return { error: error?.message ?? null };
}
