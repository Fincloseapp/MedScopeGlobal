import { useState } from "react";
import { Text, TextInput, View, StyleSheet, Pressable } from "react-native";
import { signInWithGoogle, signInWithMagicLink } from "../../lib/auth";
import { useSession } from "../../hooks/useSession";

export default function AuthScreen() {
  const { session, configured } = useSession();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!configured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Přihlášení</Text>
        <Text style={styles.sub}>
          Nastavte EXPO_PUBLIC_SUPABASE_URL a EXPO_PUBLIC_SUPABASE_ANON_KEY.
        </Text>
      </View>
    );
  }

  if (session?.user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Přihlášen</Text>
        <Text style={styles.email}>{session.user.email ?? session.user.id}</Text>
      </View>
    );
  }

  async function sendMagicLink() {
    if (!email.trim()) {
      setStatus("Zadejte e-mail.");
      return;
    }
    setLoading(true);
    setStatus(null);
    const { error } = await signInWithMagicLink(email);
    setStatus(error ? error : "Magic link odeslán — zkontrolujte e-mail.");
    setLoading(false);
  }

  async function googleSignIn() {
    setLoading(true);
    setStatus(null);
    const { error } = await signInWithGoogle();
    setStatus(error ? error : "Přesměrování na Google…");
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Přihlášení</Text>
      <Text style={styles.sub}>Magic link nebo Google (Supabase Auth).</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Pressable style={styles.btn} onPress={sendMagicLink} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Odesílám…" : "Odeslat magic link"}</Text>
      </Pressable>

      <Pressable style={[styles.btn, styles.btnOutline]} onPress={googleSignIn} disabled={loading}>
        <Text style={styles.btnOutlineText}>Přihlásit přes Google</Text>
      </Pressable>

      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#021d33" },
  sub: { marginTop: 8, color: "#64748b", lineHeight: 22 },
  email: { marginTop: 8, fontSize: 16, color: "#005B96" },
  input: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  btn: {
    marginTop: 12,
    backgroundColor: "#005B96",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  btnOutline: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#005B96" },
  btnOutlineText: { color: "#005B96", fontWeight: "600" },
  status: { marginTop: 16, color: "#64748b", fontSize: 14 },
});
