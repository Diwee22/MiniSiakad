import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          Inter: require("@expo-google-fonts/inter/Inter_400Regular.ttf"),
        });
      } catch (e) {
        console.warn("Font gagal dimuat:", e);
      } finally {
        setReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false, // ❌ NAVBAR MATI TOTAL
          animation: "slide_from_right",
        }}
      />
    </>
  );
}
