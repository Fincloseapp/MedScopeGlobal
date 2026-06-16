import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ headerStyle: { backgroundColor: "#005B96" }, headerTintColor: "#fff" }}>
      <Tabs.Screen name="index" options={{ title: "Academy" }} />
      <Tabs.Screen name="courses" options={{ title: "Kurzy" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}
