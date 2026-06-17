import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { getSupabase } from "../../lib/supabase";

function parseAuthParams(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const fragment = url.includes("#") ? url.split("#")[1] : "";
  const query = url.includes("?") ? url.split("?")[1]?.split("#")[0] ?? "" : "";
  for (const part of [...fragment.split("&"), ...query.split("&")]) {
    if (!part) continue;
    const [rawKey, rawVal] = part.split("=");
    if (!rawKey || !rawVal) continue;
    out[decodeURIComponent(rawKey)] = decodeURIComponent(rawVal);
  }
  return out;
}

async function applyAuthUrl(url: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return "Supabase není nakonfigurován";

  const params = parseAuthParams(url);
  const access_token = params.access_token;
  const refresh_token = params.refresh_token;
  const code = params.code;

  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    return error?.message ?? null;
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error?.message ?? null;
  }

  return "Chybí auth tokeny v callback URL";
}

/** Handles medscope-academy://auth/callback after Google OAuth or magic link. */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function handle(url: string | null) {
      if (!url || !active) return;
      const err = await applyAuthUrl(url);
      if (!active) return;
      if (err) {
        setError(err);
        return;
      }
      router.replace("/");
    }

    Linking.getInitialURL().then((url) => {
      if (url) return handle(url);
      setError("Chybí callback URL — otevřete odkaz z e-mailu nebo OAuth znovu.");
    });

    const sub = Linking.addEventListener("url", ({ url }) => handle(url));
    return () => {
      active = false;
      sub.remove();
    };
  }, [router]);

  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text style={styles.title}>Přihlášení selhalo</Text>
          <Text style={styles.error}>{error}</Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#005B96" />
          <Text style={styles.title}>Dokončuji přihlášení…</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { marginTop: 16, fontSize: 16, color: "#021d33" },
  error: { marginTop: 8, color: "#b91c1c", textAlign: "center" },
});
