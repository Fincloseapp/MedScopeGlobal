import { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";

const API_BASE = "https://medscopeglobal.com";

export default function HomeScreen() {
  const [health, setHealth] = useState<{ version?: string; ok?: boolean } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/academy/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MedScope Academy v35</Text>
      {health ? (
        <Text style={styles.sub}>API {health.version} — {health.ok ? "OK" : "offline"}</Text>
      ) : (
        <ActivityIndicator color="#005B96" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f0f7fc" },
  title: { fontSize: 22, fontWeight: "600", color: "#021d33" },
  sub: { marginTop: 8, fontSize: 14, color: "#005B96" },
});
