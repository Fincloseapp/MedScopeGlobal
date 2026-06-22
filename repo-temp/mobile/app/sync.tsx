import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, StyleSheet } from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "https://medscopeglobal.com";

export default function SyncTab() {
  const [data, setData] = useState<{ courses?: unknown[]; version?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/academy/mobile/sync`)
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sync</Text>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      {!data && !error ? <ActivityIndicator color="#005B96" /> : null}
      {data ? (
        <>
          <Text style={styles.meta}>Version: {data.version}</Text>
          <Text style={styles.meta}>Courses: {data.courses?.length ?? 0}</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 20, fontWeight: "700", color: "#021d33" },
  meta: { marginTop: 8, color: "#64748b" },
  err: { marginTop: 8, color: "#b91c1c" },
});
