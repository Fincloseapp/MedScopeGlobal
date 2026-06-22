import { useEffect, useState } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";

const API_BASE = "https://medscopeglobal.com";

type Course = { id: string; title: string; slug: string };

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/mobile/sync`)
      .then((r) => r.json())
      .then((d) => setCourses(d.courses ?? []))
      .catch(() => setCourses([]));
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Žádné kurzy</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  card: { padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: "#cfe1f3" },
  cardTitle: { fontSize: 16, fontWeight: "500", color: "#021d33" },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40 },
});
