import { Text, View, StyleSheet } from "react-native";

export default function ProfileTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.sub}>XP, certifikáty a postup — auth ve fázi 3.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 20, fontWeight: "700", color: "#021d33" },
  sub: { marginTop: 8, color: "#64748b" },
});
