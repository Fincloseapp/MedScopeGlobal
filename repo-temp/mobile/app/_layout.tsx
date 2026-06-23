import { Tabs } from "expo-router";

import { StatusBar } from "expo-status-bar";

import { SessionProvider } from "../hooks/useSession";



export default function RootLayout() {

  return (

    <SessionProvider>

      <StatusBar style="auto" />

      <Tabs screenOptions={{ headerStyle: { backgroundColor: "#005B96" }, headerTintColor: "#fff" }}>

        <Tabs.Screen name="index" options={{ title: "Academy" }} />

        <Tabs.Screen name="courses" options={{ title: "Kurzy" }} />

        <Tabs.Screen name="sync" options={{ title: "Sync" }} />

        <Tabs.Screen name="auth" options={{ title: "Přihlášení" }} />

        <Tabs.Screen name="auth/callback" options={{ href: null, headerShown: false }} />

        <Tabs.Screen name="profile" options={{ title: "Profil" }} />

      </Tabs>

    </SessionProvider>

  );

}

