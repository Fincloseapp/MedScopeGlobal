import { Text, View, StyleSheet, Linking } from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "https://medscopeglobal.com";

export default function AcademyTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MedScope Academy</Text>
      <Text style={styles.sub}>Mobile scaffold v35 — Phase 2 foundation</Text>
      <Text style={styles.link} onPress={() => Linking.openURL(`${API_BASE}/academy`)}>
        Otevřít web Academy →
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", color: "#021d33" },
  sub: { marginTop: 8, color: "#64748b" },
  link: { marginTop: 16, color: "#005B96", fontWeight: "600" },
});
