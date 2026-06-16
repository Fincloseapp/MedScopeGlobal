import { Text, View, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.sub}>Přihlášení přes MedScope účet — fáze 3.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "600", color: "#021d33" },
  sub: { marginTop: 8, fontSize: 14, color: "#64748b" },
});
