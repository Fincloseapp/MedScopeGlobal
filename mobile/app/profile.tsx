import { Text, View, StyleSheet } from "react-native";
import { useSession } from "../hooks/useSession";

export default function ProfileTab() {
  const { session, loading, configured, signOut } = useSession();

  if (!configured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.sub}>
          Nastavte EXPO_PUBLIC_SUPABASE_URL a EXPO_PUBLIC_SUPABASE_ANON_KEY pro přihlášení.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sub}>Načítám session…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      {session?.user ? (
        <>
          <Text style={styles.email}>{session.user.email ?? session.user.id}</Text>
          <Text style={styles.sub}>XP, certifikáty a postup — synchronizace s webem.</Text>
          <Text style={styles.link} onPress={() => signOut()}>
            Odhlásit se
          </Text>
        </>
      ) : (
        <Text style={styles.sub}>
          Nepřihlášen. Přihlášení přes Supabase Auth bude doplněno ve fázi 5 (OAuth / magic link).
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 20, fontWeight: "700", color: "#021d33" },
  email: { marginTop: 8, fontSize: 16, color: "#005B96" },
  sub: { marginTop: 8, color: "#64748b", lineHeight: 22 },
  link: { marginTop: 16, color: "#005B96", fontWeight: "600" },
});
