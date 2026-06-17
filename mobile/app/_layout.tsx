import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Tabs screenOptions={{ headerStyle: { backgroundColor: "#005B96" }, headerTintColor: "#fff" }}>
        <Tabs.Screen name="index" options={{ title: "Academy" }} />
        <Tabs.Screen name="sync" options={{ title: "Sync" }} />
        <Tabs.Screen name="profile" options={{ title: "Profil" }} />
      </Tabs>
    </>
  );
}
